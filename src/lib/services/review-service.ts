import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';
import type { ReviewStatus } from '@/types';

export class ReviewService {
  static async createReview(userId: string, data: { orderItemId: string; rating: number; comment?: string }) {
    const uId = BigInt(userId);
    const itemOrderId = BigInt(data.orderItemId);

    // Verify verified purchase: item exists, belongs to order owned by user, and order is DELIVERED or PAID
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemOrderId },
      include: {
        order: true,
        review: true,
      },
    });

    if (!orderItem) {
      throw new Error('Order item not found');
    }

    if (orderItem.order.userId !== uId) {
      throw new Error('You can only review products you have purchased');
    }

    if (orderItem.review) {
      throw new Error('You have already submitted a review for this purchase');
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars');
    }

    const review = await prisma.review.create({
      data: {
        productId: orderItem.productId,
        userId: uId,
        orderItemId: itemOrderId,
        rating: data.rating,
        comment: data.comment,
        status: 'VISIBLE',
      },
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
    });

    return serializeBigInt(review);
  }

  static async getProductReviews(productId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        productId: BigInt(productId),
        status: 'VISIBLE',
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return serializeBigInt(reviews);
  }

  static async getAllReviewsAdmin() {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: {
          select: {
            name: true,
            slug: true,
            seller: { select: { shopName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return serializeBigInt(reviews);
  }

  static async updateReviewStatus(reviewId: string, status: ReviewStatus) {
    const review = await prisma.review.update({
      where: { id: BigInt(reviewId) },
      data: { status },
    });
    return serializeBigInt(review);
  }

  static async deleteReview(reviewId: string) {
    const review = await prisma.review.delete({
      where: { id: BigInt(reviewId) },
    });
    return serializeBigInt(review);
  }
}
