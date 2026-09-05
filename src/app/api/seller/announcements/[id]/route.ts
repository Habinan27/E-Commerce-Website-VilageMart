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
    if (body.productId !== undefined) {
      if (body.productId) {
        const prod = await prisma.product.findFirst({
          where: {
            id: BigInt(body.productId),
            sellerId: existing.sellerId || undefined,
          },
          select: { id: true },
        });
        if (!prod) {
          return NextResponse.json(
            { error: 'Selected product was not found or does not belong to your shop' },
            { status: 400 }
          );
        }
        updateData.productId = prod.id;
      } else {
        updateData.productId = null;
      }
    }
    if (body.title !== undefined) updateData.title = body.title ? body.title.trim() : null;
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.contentTamil !== undefined) updateData.contentTamil = body.contentTamil ? body.contentTamil.trim() : null;
    if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl ? body.linkUrl.trim() : null;
    if (body.linkLabel !== undefined) updateData.linkLabel = body.linkLabel ? body.linkLabel.trim() : null;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.bgType !== undefined) updateData.bgType = body.bgType;
    if (body.bgColor !== undefined) updateData.bgColor = body.bgColor ? body.bgColor.trim() : null;
    if (body.textColor !== undefined) updateData.textColor = body.textColor ? body.textColor.trim() : null;
    if (body.accentColor !== undefined) updateData.accentColor = body.accentColor ? body.accentColor.trim() : null;
    if (body.borderColor !== undefined) updateData.borderColor = body.borderColor ? body.borderColor.trim() : null;
    if (body.buttonColor !== undefined) updateData.buttonColor = body.buttonColor ? body.buttonColor.trim() : null;
    if (body.buttonTextColor !== undefined) updateData.buttonTextColor = body.buttonTextColor ? body.buttonTextColor.trim() : null;
    if (body.bgImage !== undefined) updateData.bgImage = body.bgImage ? body.bgImage.trim() : null;
    if (body.overlayOpacity !== undefined) updateData.overlayOpacity = Number(body.overlayOpacity);
    if (body.isMarquee !== undefined) updateData.isMarquee = Boolean(body.isMarquee);
    if (body.speed !== undefined) updateData.speed = Number(body.speed);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder);

    const updated = await prisma.announcement.update({
      where: { id: targetId },
      data: updateData,
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      announcement: {
        id: updated.id.toString(),
        sellerId: updated.sellerId?.toString(),
        productId: updated.productId?.toString() || null,
        productName: updated.product?.name || null,
        productSlug: updated.product?.slug || null,
        productPrice: updated.product?.price ? Number(updated.product.price) : null,
        title: updated.title,
        content: updated.content,
        contentTamil: updated.contentTamil,
        linkUrl: updated.product?.slug ? `/products/${updated.product.slug}` : (updated.linkUrl || null),
        linkLabel: updated.linkLabel,
        theme: updated.theme,
        bgType: updated.bgType,
        bgColor: updated.bgColor,
        textColor: updated.textColor,
        accentColor: updated.accentColor,
        borderColor: updated.borderColor,
        buttonColor: updated.buttonColor,
        buttonTextColor: updated.buttonTextColor,
        bgImage: updated.bgImage,
        overlayOpacity: updated.overlayOpacity,
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
