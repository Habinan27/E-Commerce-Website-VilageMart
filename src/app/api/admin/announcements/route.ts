import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await requireRole(['ADMIN', 'SELLER']);

    const announcements = await prisma.announcement.findMany({
      include: {
        seller: {
          select: { shopName: true, slug: true },
        },
        product: {
          select: { id: true, name: true, slug: true, price: true, status: true },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const formatted = announcements.map((a) => {
      const finalLinkUrl = a.product?.slug ? `/products/${a.product.slug}` : (a.linkUrl || null);

      return {
        id: a.id.toString(),
        sellerId: a.sellerId?.toString() || null,
        sellerShopName: a.seller?.shopName || null,
        sellerSlug: a.seller?.slug || null,
        productId: a.productId?.toString() || null,
        productName: a.product?.name || null,
        productSlug: a.product?.slug || null,
        productPrice: a.product?.price ? Number(a.product.price) : null,
        title: a.title,
        content: a.content,
        contentTamil: a.contentTamil,
        linkUrl: finalLinkUrl,
        linkLabel: a.linkLabel,
        theme: a.theme,
        bgType: a.bgType || 'COLOR',
        bgColor: a.bgColor || null,
        textColor: a.textColor || null,
        accentColor: a.accentColor || null,
        borderColor: a.borderColor || null,
        buttonColor: a.buttonColor || null,
        buttonTextColor: a.buttonTextColor || null,
        bgImage: a.bgImage || null,
        overlayOpacity: a.overlayOpacity !== undefined ? a.overlayOpacity : 60,
        isMarquee: a.isMarquee,
        speed: a.speed,
        isActive: a.isActive,
        displayOrder: a.displayOrder,
        targetAudience: a.targetAudience,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    });

    return NextResponse.json({ announcements: formatted });
  } catch (error: any) {
    const status = error.message === 'FORBIDDEN' ? 403 : error.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Unauthorized or failed to fetch' },
      { status }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(['ADMIN', 'SELLER']);
    const body = await request.json();

    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Announcement content text is required' },
        { status: 400 }
      );
    }

    let parsedProductId: bigint | null = null;
    if (body.productId) {
      const prod = await prisma.product.findUnique({
        where: { id: BigInt(body.productId) },
        select: { id: true, slug: true, name: true },
      });
      if (!prod) {
        return NextResponse.json({ error: 'Selected linked product not found' }, { status: 400 });
      }
      parsedProductId = prod.id;
    }

    const created = await prisma.announcement.create({
      data: {
        productId: parsedProductId,
        title: body.title?.trim() || null,
        content: body.content.trim(),
        contentTamil: body.contentTamil?.trim() || null,
        linkUrl: body.linkUrl?.trim() || null,
        linkLabel: body.linkLabel?.trim() || null,
        theme: body.theme || 'emerald',
        bgType: body.bgType || 'COLOR',
        bgColor: body.bgColor?.trim() || null,
        textColor: body.textColor?.trim() || null,
        accentColor: body.accentColor?.trim() || null,
        borderColor: body.borderColor?.trim() || null,
        buttonColor: body.buttonColor?.trim() || null,
        buttonTextColor: body.buttonTextColor?.trim() || null,
        bgImage: body.bgImage?.trim() || null,
        overlayOpacity: body.overlayOpacity !== undefined ? Number(body.overlayOpacity) : 60,
        isMarquee: body.isMarquee !== undefined ? Boolean(body.isMarquee) : true,
        speed: body.speed ? Number(body.speed) : 30,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        displayOrder: body.displayOrder ? Number(body.displayOrder) : 0,
        targetAudience: body.targetAudience || 'CUSTOMERS',
      },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      announcement: {
        id: created.id.toString(),
        sellerId: created.sellerId?.toString() || null,
        productId: created.productId?.toString() || null,
        productName: created.product?.name || null,
        productSlug: created.product?.slug || null,
        productPrice: created.product?.price ? Number(created.product.price) : null,
        title: created.title,
        content: created.content,
        contentTamil: created.contentTamil,
        linkUrl: created.product?.slug ? `/products/${created.product.slug}` : (created.linkUrl || null),
        linkLabel: created.linkLabel,
        theme: created.theme,
        bgType: created.bgType,
        bgColor: created.bgColor,
        textColor: created.textColor,
        accentColor: created.accentColor,
        borderColor: created.borderColor,
        buttonColor: created.buttonColor,
        buttonTextColor: created.buttonTextColor,
        bgImage: created.bgImage,
        overlayOpacity: created.overlayOpacity,
        isMarquee: created.isMarquee,
        speed: created.speed,
        isActive: created.isActive,
        displayOrder: created.displayOrder,
        targetAudience: created.targetAudience,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    });
  } catch (error: any) {
    const status = error.message === 'FORBIDDEN' ? 403 : error.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create announcement' },
      { status }
    );
  }
}
