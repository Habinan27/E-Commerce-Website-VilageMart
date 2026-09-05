import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await requireAuth();
    const uId = BigInt(session.id);

    let seller = await prisma.sellerProfile.findUnique({
      where: { userId: uId },
      select: { id: true, shopName: true },
    });

    if (!seller && session.sellerProfileId) {
      seller = await prisma.sellerProfile.findUnique({
        where: { id: BigInt(session.sellerProfileId) },
        select: { id: true, shopName: true },
      });
    }

    if (!seller && (session.role === 'ADMIN' || session.role === 'SELLER')) {
      seller = await prisma.sellerProfile.findFirst({
        select: { id: true, shopName: true },
      });
    }

    if (!seller) {
      return NextResponse.json({ announcements: [], shopName: 'My Shop' });
    }

    const announcements = await prisma.announcement.findMany({
      where: { sellerId: seller.id },
      include: {
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

    return NextResponse.json({ announcements: formatted, shopName: seller.shopName });
  } catch (error: any) {
    return NextResponse.json({ announcements: [], shopName: 'My Shop' });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const uId = BigInt(session.id);

    let seller = await prisma.sellerProfile.findUnique({
      where: { userId: uId },
      select: { id: true },
    });

    if (!seller && session.sellerProfileId) {
      seller = await prisma.sellerProfile.findUnique({
        where: { id: BigInt(session.sellerProfileId) },
        select: { id: true },
      });
    }

    if (!seller && (session.role === 'ADMIN' || session.role === 'SELLER')) {
      seller = await prisma.sellerProfile.findFirst({
        select: { id: true },
      });
    }

    if (!seller) {
      const defaultLoc = await prisma.location.findFirst({ select: { id: true } });
      if (defaultLoc) {
        seller = await prisma.sellerProfile.create({
          data: {
            userId: uId,
            shopName: `${session.name}'s Shop`,
            slug: `shop-${session.id}`,
            description: 'Local village products seller',
            address: 'Sri Lanka',
            locationId: defaultLoc.id,
            approvalStatus: 'APPROVED',
          },
          select: { id: true },
        });
      }
    }

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller shop profile could not be located. Please ensure your seller profile is registered.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json(
        { error: 'Announcement message content is required' },
        { status: 400 }
      );
    }

    let parsedProductId: bigint | null = null;
    if (body.productId) {
      const prod = await prisma.product.findFirst({
        where: {
          id: BigInt(body.productId),
          sellerId: seller.id, // Strictly ensure product belongs to this seller
        },
        select: { id: true, name: true, slug: true, price: true },
      });
      if (!prod) {
        return NextResponse.json(
          { error: 'Selected product was not found or does not belong to your shop' },
          { status: 400 }
        );
      }
      parsedProductId = prod.id;
    }

    const created = await prisma.announcement.create({
      data: {
        sellerId: seller.id,
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
        speed: body.speed ? Number(body.speed) : 28,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        displayOrder: body.displayOrder ? Number(body.displayOrder) : 0,
        targetAudience: 'CUSTOMERS',
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
        sellerId: created.sellerId?.toString(),
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
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating seller announcement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
