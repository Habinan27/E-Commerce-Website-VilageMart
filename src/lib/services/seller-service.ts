import { prisma } from '@/lib/db/prisma';
import { serializeBigInt, slugify } from '@/lib/utils';
import type { SellerApprovalStatus } from '@/types';

export class SellerService {
  static async getTopSellers(limit = 6) {
    const sellers = await prisma.sellerProfile.findMany({
      where: { approvalStatus: 'APPROVED' },
      include: {
        location: {
          include: {
            parent: true,
          },
        },
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
        products: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            reviews: {
              where: { status: 'VISIBLE' },
              select: { rating: true },
            },
          },
        },
        orderItems: {
          select: {
            subtotal: true,
          },
        },
      },
      take: limit * 2,
    });

    const formatted = sellers.map((s) => {
      let totalRating = 0;
      let reviewCount = 0;
      s.products.forEach((p) => {
        p.reviews.forEach((r) => {
          totalRating += r.rating;
          reviewCount++;
        });
      });

      const avgRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 5.0;
      const totalSales = s.orderItems.reduce((acc, item) => acc + Number(item.subtotal), 0);

      return {
        ...s,
        totalSales,
        productCount: s.products.length,
        averageRating: avgRating,
        reviewCount,
      };
    });

    formatted.sort((a, b) => b.totalSales - a.totalSales);
    return serializeBigInt(formatted.slice(0, limit));
  }

  static async getSellerBySlug(slug: string) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { slug },
      include: {
        location: {
          include: {
            parent: {
              include: {
                parent: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        products: {
          where: { status: 'ACTIVE' },
          include: {
            category: true,
            productImages: {
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            },
            reviews: {
              where: { status: 'VISIBLE' },
              select: { rating: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!seller) return null;

    let totalRating = 0;
    let reviewCount = 0;

    const formattedProducts = seller.products.map((p) => {
      const pCount = p.reviews.length;
      const pAvg = pCount > 0 ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / pCount).toFixed(1)) : 0;
      p.reviews.forEach((r) => {
        totalRating += r.rating;
        reviewCount++;
      });
      return {
        ...p,
        averageRating: pAvg,
        reviewCount: pCount,
      };
    });

    const averageRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 5.0;

    return serializeBigInt({
      ...seller,
      products: formattedProducts,
      averageRating,
      reviewCount,
      productCount: seller.products.length,
    });
  }

  static async getSellerDashboardStats(sellerProfileId: string) {
    const sId = BigInt(sellerProfileId);

    const [productsCount, orderItems, earnings, productsWithReviews] = await Promise.all([
      prisma.product.count({ where: { sellerId: sId } }),
      prisma.orderItem.findMany({
        where: { sellerId: sId },
        include: {
          order: {
            select: {
              orderStatus: true,
              paymentStatus: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.sellerEarnings.aggregate({
        where: { sellerId: sId },
        _sum: {
          grossAmount: true,
          commissionAmount: true,
          netAmount: true,
        },
      }),
      prisma.product.findMany({
        where: { sellerId: sId },
        select: {
          reviews: {
            where: { status: 'VISIBLE' },
            select: { rating: true },
          },
        },
      }),
    ]);

    const totalOrders = new Set(orderItems.map((item) => item.orderId.toString())).size;
    const pendingOrders = orderItems.filter((item) => item.order.orderStatus === 'PENDING' || item.order.orderStatus === 'CONFIRMED').length;
    const completedOrders = orderItems.filter((item) => item.order.orderStatus === 'DELIVERED').length;

    let totalRating = 0;
    let reviewCount = 0;
    productsWithReviews.forEach((p) => {
      p.reviews.forEach((r) => {
        totalRating += r.rating;
        reviewCount++;
      });
    });
    const avgRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 5.0;

    return serializeBigInt({
      totalProducts: productsCount,
      totalOrders,
      totalSales: Number(earnings._sum.grossAmount || 0),
      totalEarnings: Number(earnings._sum.netAmount || 0),
      totalCommission: Number(earnings._sum.commissionAmount || 0),
      pendingOrders,
      completedOrders,
      averageRating: avgRating,
      reviewCount,
    });
  }

  static async getAllSellers(status?: SellerApprovalStatus) {
    const where = status ? { approvalStatus: status } : {};
    const sellers = await prisma.sellerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        location: {
          include: {
            parent: true,
          },
        },
        _count: {
          select: {
            products: true,
            orderItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return serializeBigInt(sellers);
  }

  static async updateApprovalStatus(sellerProfileId: string, status: SellerApprovalStatus) {
    const updated = await prisma.sellerProfile.update({
      where: { id: BigInt(sellerProfileId) },
      data: {
        approvalStatus: status,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
      },
    });
    return serializeBigInt(updated);
  }
}
