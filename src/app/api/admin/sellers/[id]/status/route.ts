import { NextResponse } from 'next/server';
import { SellerService } from '@/lib/services/seller-service';
import { requireRole } from '@/lib/auth';
import type { SellerApprovalStatus } from '@/types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Strictly require ADMIN role
    await requireRole('ADMIN');

    const body = await request.json();
    const { approvalStatus } = body;

    const validStatuses: SellerApprovalStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
    if (!validStatuses.includes(approvalStatus)) {
      return NextResponse.json(
        { error: 'Invalid approval status value' },
        { status: 400 }
      );
    }

    const updated = await SellerService.updateApprovalStatus(params.id, approvalStatus);
    return NextResponse.json({
      success: true,
      seller: updated,
      message: `Seller shop has been successfully marked as ${approvalStatus}.`,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update seller status' },
      { status: 500 }
    );
  }
}
