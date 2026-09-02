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
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const formatted = announcements.map((a) => ({
      id: a.id.toString(),
      sellerId: a.sellerId?.toString() || null,
      title: a.title,
      content: a.content,
      contentTamil: a.contentTamil,
      linkUrl: a.linkUrl,
      linkLabel: a.linkLabel,
      theme: a.theme,
      isMarquee: a.isMarquee,
      speed: a.speed,
      isActive: a.isActive,
      displayOrder: a.displayOrder,
      targetAudience: a.targetAudience,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

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

    const created = await prisma.announcement.create({
      data: {
        sellerId: seller.id,
        title: body.title?.trim() || null,
        content: body.content.trim(),
        contentTamil: body.contentTamil?.trim() || null,
        linkUrl: body.linkUrl?.trim() || null,
        linkLabel: body.linkLabel?.trim() || null,
        theme: body.theme || 'emerald',
        isMarquee: body.isMarquee !== undefined ? Boolean(body.isMarquee) : true,
        speed: body.speed ? Number(body.speed) : 28,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        displayOrder: body.displayOrder ? Number(body.displayOrder) : 0,
        targetAudience: 'CUSTOMERS',
      },
    });

    return NextResponse.json({
      success: true,
      announcement: {
        id: created.id.toString(),
        sellerId: created.sellerId?.toString(),
        title: created.title,
        content: created.content,
        contentTamil: created.contentTamil,
        linkUrl: created.linkUrl,
        linkLabel: created.linkLabel,
        theme: created.theme,
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
