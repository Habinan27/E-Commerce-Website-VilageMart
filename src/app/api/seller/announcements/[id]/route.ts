import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const targetId = BigInt(params.id);

    const existing = await prisma.announcement.findUnique({
      where: { id: targetId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title ? body.title.trim() : null;
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.contentTamil !== undefined) updateData.contentTamil = body.contentTamil ? body.contentTamil.trim() : null;
    if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl ? body.linkUrl.trim() : null;
    if (body.linkLabel !== undefined) updateData.linkLabel = body.linkLabel ? body.linkLabel.trim() : null;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.isMarquee !== undefined) updateData.isMarquee = Boolean(body.isMarquee);
    if (body.speed !== undefined) updateData.speed = Number(body.speed);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder);

    const updated = await prisma.announcement.update({
      where: { id: targetId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      announcement: {
        id: updated.id.toString(),
        sellerId: updated.sellerId?.toString(),
        title: updated.title,
        content: updated.content,
        contentTamil: updated.contentTamil,
        linkUrl: updated.linkUrl,
        linkLabel: updated.linkLabel,
        theme: updated.theme,
        isMarquee: updated.isMarquee,
        speed: updated.speed,
        isActive: updated.isActive,
        displayOrder: updated.displayOrder,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const targetId = BigInt(params.id);

    await prisma.announcement.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ success: true, message: 'Announcement deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
