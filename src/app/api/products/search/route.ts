import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const sellerOnly = searchParams.get('sellerOnly') === 'true';
    const specificSellerId = searchParams.get('sellerId');
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    const session = await getSessionUser();

    const where: any = {
      status: 'ACTIVE',
    };

    // If caller is a seller or sellerOnly is true
    if (session?.role === 'SELLER' || sellerOnly) {
      if (session?.sellerProfileId) {
        where.sellerId = BigInt(session.sellerProfileId);
      } else if (session?.id) {
        const seller = await prisma.sellerProfile.findUnique({
          where: { userId: BigInt(session.id) },
          select: { id: true },
        });
        if (seller) {
          where.sellerId = seller.id;
        }
      }
    } else if (specificSellerId) {
      where.sellerId = BigInt(specificSellerId);
    }

    if (query.trim()) {
      where.OR = [
        { name: { contains: query.trim() } },
        { slug: { contains: query.trim().toLowerCase() } },
        { description: { contains: query.trim() } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: { id: true, shopName: true, slug: true },
        },
        productImages: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
    });

    const formatted = products.map((p) => {
      const primaryImg = p.productImages[0]?.imageUrl || null;
      return {
        id: p.id.toString(),
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        stock: p.stock,
        status: p.status,
        primaryImage: primaryImg,
        sellerId: p.seller.id.toString(),
        sellerShopName: p.seller.shopName,
        sellerSlug: p.seller.slug,
      };
    });

    return NextResponse.json({ products: formatted });
  } catch (error: any) {
    console.error('Error searching products:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
