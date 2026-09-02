import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';

export class WishlistService {
  /**
   * Get or create a wishlist for a user
   */
  static async getOrCreateWishlist(userId: string) {
    const uId = BigInt(userId);
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: uId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                seller: { include: { location: true } },
                productImages: {
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                },
                reviews: { where: { status: 'VISIBLE' }, select: { rating: true } },
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: uId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  seller: { include: { location: true } },
                  productImages: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  },
                  reviews: { where: { status: 'VISIBLE' }, select: { rating: true } },
                },
              },
            },
          },
        },
      });
    }

    return serializeBigInt({
      id: wishlist.id,
      userId: wishlist.userId,
      items: wishlist.items,
      count: wishlist.items.length,
      productIds: wishlist.items.map((it) => it.productId.toString()),
    });
  }

  /**
   * Get product IDs currently in user's wishlist
   */
  static async getWishlistProductIds(userId: string): Promise<string[]> {
    try {
      const uId = BigInt(userId);
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId: uId },
        include: { items: { select: { productId: true } } },
      });
      return wishlist?.items.map((it) => it.productId.toString()) || [];
    } catch {
      return [];
    }
  }

  /**
   * Toggle a product in/out of the user's wishlist
   */
  static async toggleWishlist(userId: string, productId: string) {
    const uId = BigInt(userId);
    const pId = BigInt(productId);

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: pId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: uId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: uId },
      });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: pId,
        },
      },
    });

    let isWishlisted = false;
    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      isWishlisted = false;
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId: pId,
        },
      });
      isWishlisted = true;
    }

    // Get updated count
    const count = await prisma.wishlistItem.count({
      where: { wishlistId: wishlist.id },
    });

    return { isWishlisted, count };
  }

  /**
   * Remove an item from wishlist
   */
  static async removeFromWishlist(userId: string, productId: string) {
    const uId = BigInt(userId);
    const pId = BigInt(productId);

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: uId },
    });

    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          productId: pId,
        },
      });
    }

    const count = wishlist
      ? await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } })
      : 0;

    return { count };
  }
}
