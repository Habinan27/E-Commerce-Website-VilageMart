import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order-service';
import { requireRole } from '@/lib/auth';
import { updateOrderStatusSchema } from '@/lib/validations';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['SELLER', 'ADMIN']);
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order status', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await OrderService.updateOrderStatus(
      params.id,
      parsed.data.orderStatus,
      session.id,
      parsed.data.note
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order status' }, { status: 500 });
  }
}
