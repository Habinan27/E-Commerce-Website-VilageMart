import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order-service';
import { requireAuth } from '@/lib/auth';
import { updateCartItemSchema } from '@/lib/validations';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = updateCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    await OrderService.updateCartItemQuantity(session.id, params.id, parsed.data.quantity);
    const updatedCart = await OrderService.getOrCreateCart(session.id);
    return NextResponse.json(updatedCart);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update item' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await OrderService.removeCartItem(session.id, params.id);
    const updatedCart = await OrderService.getOrCreateCart(session.id);
    return NextResponse.json(updatedCart);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete item' }, { status: 400 });
  }
}
