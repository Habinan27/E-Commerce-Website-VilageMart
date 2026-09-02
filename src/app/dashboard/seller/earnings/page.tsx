import React from 'react';
import type { Metadata } from 'next';
import { DollarSign, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth';
import { serializeBigInt, formatPrice, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Seller Earnings & Commission',
};

export default async function SellerEarningsPage() {
  const session = await requireRole(['SELLER', 'ADMIN']);
  if (!session.sellerProfileId) return null;

  const sId = BigInt(session.sellerProfileId);

  const [earningsList, aggregates] = await Promise.all([
    prisma.sellerEarnings.findMany({
      where: { sellerId: sId },
      include: {
        orderItem: {
          include: {
            order: {
              select: { orderNumber: true, createdAt: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.sellerEarnings.aggregate({
      where: { sellerId: sId },
      _sum: {
        grossAmount: true,
        commissionAmount: true,
        netAmount: true,
      },
    }),
  ]);

  const serializedEarnings = serializeBigInt(earningsList);
  const gross = Number(aggregates._sum.grossAmount || 0);
  const commission = Number(aggregates._sum.commissionAmount || 0);
  const net = Number(aggregates._sum.netAmount || 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Earnings & Commission Ledger</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Detailed breakdown of your gross sales, 10% platform commission, and net payouts.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Net Earnings"
          value={formatPrice(net)}
          description="Your take-home revenue (90%)"
          icon={<DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <StatCard
          title="Gross Sales"
          value={formatPrice(gross)}
          description="Total value of items ordered"
          icon={<DollarSign className="w-5 h-5 text-brand-700 dark:text-emerald-400" />}
        />
        <StatCard
          title="Platform Commission"
          value={formatPrice(commission)}
          description="Standard 10% marketplace fee"
          icon={<ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        />
      </div>

      {/* Earnings Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-150">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Per-Item Revenue & Payout Status</h3>
        </div>

        {serializedEarnings.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 dark:text-slate-400">No earnings recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Gross Amount</th>
                  <th className="px-6 py-3">Commission (10%)</th>
                  <th className="px-6 py-3">Net Earning</th>
                  <th className="px-6 py-3">Payout Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                {serializedEarnings.map((earn: any) => (
                  <tr key={earn.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-slate-100">
                      {earn.orderItem.order.orderNumber}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-slate-100 max-w-[200px] truncate">
                      {earn.orderItem.productName}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100">{formatPrice(earn.grossAmount)}</td>
                    <td className="px-6 py-4 font-medium text-amber-700 dark:text-amber-400">-{formatPrice(earn.commissionAmount)}</td>
                    <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">{formatPrice(earn.netAmount)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={earn.payoutStatus === 'PAID' ? 'success' : 'neutral'} size="sm">
                        {earn.payoutStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400 font-medium">{formatDate(earn.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
