import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order-service';
import { requireAuth } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid checkout information', details: parsed.error.format() }, { status: 400 });
    }

    const order = await OrderService.checkout(session.id, parsed.data);
    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 400 });
  }
}
