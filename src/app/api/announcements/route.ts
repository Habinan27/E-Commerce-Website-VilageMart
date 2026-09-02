import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerSlug = searchParams.get('sellerSlug');
    const sellerId = searchParams.get('sellerId');
    const audience = searchParams.get('audience');

    const whereClause: any = { isActive: true };

    if (sellerSlug) {
      const seller = await prisma.sellerProfile.findUnique({
        where: { slug: sellerSlug },
        select: { id: true },
      });
      if (seller) {
        whereClause.sellerId = seller.id;
      } else {
        return NextResponse.json({ announcements: [] });
      }
    } else if (sellerId) {
      whereClause.sellerId = BigInt(sellerId);
    } else if (audience === 'SELLERS') {
      whereClause.targetAudience = 'SELLERS';
      whereClause.sellerId = null;
    } else {
      // Global customer storefront announcements
      whereClause.sellerId = null;
      whereClause.targetAudience = { in: ['CUSTOMERS', 'ALL'] };
    }

    let announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    // If global store is queried and database is empty, seed initial promotion
    if (!sellerSlug && !sellerId && audience !== 'SELLERS' && announcements.length === 0) {
      const totalCount = await prisma.announcement.count();
      if (totalCount === 0) {
        const seeded = await prisma.announcement.create({
          data: {
            title: '🌾 Fresh Harvest Special',
            content: 'Special Launch Offer: Enjoy Free Islandwide Delivery on orders over Rs. 3,500! • Authentic Village Honey, Pure Palmyra Delicacies & Traditional Rice fresh from Jaffna & Vanni farmers.',
            contentTamil: 'ரூ. 3,500க்கு மேற்பட்ட அனைத்து கட்டளைகளுக்கும் இலவச விநியோகம்! • தூய கிராமத்து தேன் மற்றும் பாரம்பரிய அரிசி வகைகள்.',
            linkUrl: '/products',
            linkLabel: 'Shop Now →',
            theme: 'emerald',
            isMarquee: true,
            speed: 28,
            isActive: true,
            displayOrder: 0,
            targetAudience: 'CUSTOMERS',
          },
        });
        announcements = [seeded];
      }
    }

    const formatted = announcements.map((a) => ({
      id: a.id.toString(),
      sellerId: a.sellerId?.toString(),
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

    return NextResponse.json({ announcements: formatted });
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json({ announcements: [] }, { status: 500 });
  }
}
