import { NextResponse } from 'next/server';
import { SellerService } from '@/lib/services/seller-service';
import { requireRole } from '@/lib/auth';
import { updateSellerApprovalSchema } from '@/lib/validations';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole('ADMIN');
    const body = await request.json();
    const parsed = updateSellerApprovalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid approval status' }, { status: 400 });
    }

    const updated = await SellerService.updateApprovalStatus(params.id, parsed.data.approvalStatus);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update seller approval' }, { status: 500 });
  }
}
