import React from 'react';
import type { Metadata } from 'next';
import { Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { RatingStars } from '@/components/ui/rating-stars';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth';
import { serializeBigInt, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Seller Reviews',
};

export default async function SellerReviewsPage() {
  const session = await requireRole(['SELLER', 'ADMIN']);
  if (!session.sellerProfileId) return null;

  const sId = BigInt(session.sellerProfileId);

  const reviews = await prisma.review.findMany({
    where: {
      product: { sellerId: sId },
      status: 'VISIBLE',
    },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = serializeBigInt(reviews);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Customer Reviews & Ratings</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Feedback from verified customers on your village products.
        </p>
      </div>

      {serialized.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center text-xs text-gray-500 dark:text-slate-400 transition-colors duration-150">
          <MessageSquare className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">No reviews received yet</p>
          <p className="mt-1">When customers receive your products, their reviews will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {serialized.map((rev: any) => (
            <div key={rev.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 space-y-3 shadow-sm transition-colors duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900 dark:text-slate-100">{rev.user.name}</span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase
                    </span>
                  </div>
                  <p className="text-xs text-brand-800 dark:text-emerald-400 font-medium mt-0.5">
                    Product: {rev.product.name}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <RatingStars rating={rev.rating} size="sm" showNumber={false} />
                  <span className="text-xs text-gray-400 dark:text-slate-500">{formatDate(rev.createdAt)}</span>
                </div>
              </div>

              {rev.comment && (
                <p className="text-xs text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 p-3.5 rounded-xl leading-relaxed">
                  {rev.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
