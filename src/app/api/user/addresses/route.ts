import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth';
import { addressSchema } from '@/lib/validations';
import { serializeBigInt } from '@/lib/utils';

export async function GET() {
  try {
    const session = await requireAuth();
    const addresses = await prisma.address.findMany({
      where: { userId: BigInt(session.id) },
      include: {
        location: {
          include: {
            parent: {
              include: { parent: true },
            },
          },
        },
      },
      orderBy: { isDefault: 'desc' },
    });
    return NextResponse.json(serializeBigInt(addresses));
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid address information', details: parsed.error.format() }, { status: 400 });
    }

    const uId = BigInt(session.id);
    const hasDefault = await prisma.address.count({ where: { userId: uId } });

    const address = await prisma.address.create({
      data: {
        userId: uId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        addressLine: parsed.data.addressLine,
        locationId: BigInt(parsed.data.locationId),
        postalCode: parsed.data.postalCode || null,
        isDefault: hasDefault === 0 ? true : parsed.data.isDefault,
      },
      include: {
        location: true,
      },
    });

    return NextResponse.json(serializeBigInt(address), { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create address' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    let addressId = searchParams.get('id');

    if (!addressId) {
      try {
        const body = await request.json();
        addressId = body.id || body.addressId;
      } catch {
        // no body
      }
    }

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const uId = BigInt(session.id);
    const targetId = BigInt(addressId);

    // Verify ownership
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

    // If deleted address was default, make another address default if available
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
