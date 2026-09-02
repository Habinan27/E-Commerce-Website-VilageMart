import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const addressId = params.id;

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const uId = BigInt(session.id);
    const targetId = BigInt(addressId);

    const existing = await prisma.address.findFirst({
      where: {
        id: targetId,
        userId: uId,
      },
      include: {
        orders: { select: { id: true }, take: 1 },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
    }

    if (existing.orders.length > 0) {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      const archiveUserId = adminUser ? adminUser.id : uId;

      const archivedCopy = await prisma.address.create({
        data: {
          userId: archiveUserId,
          name: existing.name,
          phone: existing.phone,
          addressLine: existing.addressLine,
          locationId: existing.locationId,
          postalCode: existing.postalCode,
          isDefault: false,
        },
      });

      await prisma.order.updateMany({
        where: { addressId: targetId },
        data: { addressId: archivedCopy.id },
      });

      await prisma.address.delete({
        where: { id: targetId },
      });
    } else {
      await prisma.address.delete({
        where: { id: targetId },
      });
    }

    if (existing.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId: uId },
        orderBy: { createdAt: 'desc' },
      });
      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Address removed successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete address' }, { status: 500 });
  }
}
