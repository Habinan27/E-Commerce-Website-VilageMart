import React from 'react';
import type { Metadata } from 'next';
import { Star, ShieldAlert } from 'lucide-react';
import { RatingStars } from '@/components/ui/rating-stars';
import { Badge } from '@/components/ui/badge';
import { ReviewService } from '@/lib/services/review-service';
import { requireRole } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Reviews Moderation - Admin',
};

export default async function AdminReviewsPage() {
  await requireRole('ADMIN');
  const reviews = await ReviewService.getAllReviewsAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Review Moderation</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Monitor customer reviews and maintain high marketplace trust standards.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-150">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Comment</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
              {reviews.map((rev: any) => (
                <tr key={rev.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100 max-w-[200px] truncate">
                    {rev.product.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-slate-100">{rev.user.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400">{rev.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <RatingStars rating={rev.rating} size="sm" showNumber={false} />
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-slate-300 max-w-sm">
                    <p className="line-clamp-2">{rev.comment || 'No text comment'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={rev.status === 'VISIBLE' ? 'success' : 'danger'}>{rev.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">{formatDate(rev.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
