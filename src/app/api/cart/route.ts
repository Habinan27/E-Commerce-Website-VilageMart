import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order-service';
import { requireAuth } from '@/lib/auth';
import { addToCartSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await requireAuth();
    const cart = await OrderService.getOrCreateCart(session.id);
    return NextResponse.json(cart);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please sign in to view your cart' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const item = await OrderService.addToCart(session.id, parsed.data.productId, parsed.data.quantity);
    const cart = await OrderService.getOrCreateCart(session.id);
    return NextResponse.json({ ...item, cartCount: cart.itemCount }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please sign in to add items to cart' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Failed to add item to cart' }, { status: 400 });
  }
}
