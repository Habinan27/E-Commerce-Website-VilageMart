import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Package, ShoppingBag, DollarSign, Star, Clock, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SellerService } from '@/lib/services/seller-service';
import { OrderService } from '@/lib/services/order-service';
import { requireRole } from '@/lib/auth';
import { formatPrice, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Seller Dashboard',
};

export default async function SellerDashboardPage() {
  const session = await requireRole(['SELLER', 'ADMIN']);
  if (!session.sellerProfileId) {
    return <div className="p-8 text-center text-xs">Seller Profile not found.</div>;
  }

  const [stats, recentOrderItems] = await Promise.all([
    SellerService.getSellerDashboardStats(session.sellerProfileId),
    OrderService.getSellerOrders(session.sellerProfileId),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Seller Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-bold text-gray-900 dark:text-slate-200">{session.shopName || session.name}</span>. Here is your shop summary.
          </p>
        </div>

        <Link href="/dashboard/seller/products/create">
          <Button size="md" className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Net Earnings"
          value={formatPrice(stats.totalEarnings)}
          description="Your take-home sales (90%)"
          icon={<DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <StatCard
          title="Total Sales"
          value={formatPrice(stats.totalSales)}
          description={`From ${stats.totalOrders} customer orders`}
          icon={<ShoppingBag className="w-5 h-5 text-brand-700 dark:text-emerald-400" />}
        />
        <StatCard
          title="Active Products"
          value={stats.totalProducts}
          description="Listed in your shop catalog"
          icon={<Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        />
        <StatCard
          title="Shop Rating"
          value={`${stats.averageRating} ★`}
          description={`From ${stats.reviewCount} customer reviews`}
          icon={<Star className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
        />
      </div>

      {/* Secondary Status Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 flex items-center justify-between transition-colors duration-150">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-300">Orders to Ship</p>
              <p className="text-xl font-black text-amber-950 dark:text-amber-200 mt-0.5">{stats.pendingOrders}</p>
            </div>
          </div>
          <Link href="/dashboard/seller/orders">
            <Button size="sm" variant="outline" className="text-xs bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
              View Orders
            </Button>
          </Link>
        </div>

        <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 flex items-center justify-between transition-colors duration-150">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Completed Orders</p>
              <p className="text-xl font-black text-emerald-950 dark:text-emerald-200 mt-0.5">{stats.completedOrders}</p>
            </div>
          </div>
          <Link href="/dashboard/seller/earnings">
            <Button size="sm" variant="outline" className="text-xs bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
              View Payouts
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-150">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">Recent Customer Orders</h3>
          <Link
            href="/dashboard/seller/orders"
            className="text-xs font-semibold text-brand-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrderItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 dark:text-slate-400">No orders received yet for your shop.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Your Earning</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                {recentOrderItems.slice(0, 5).map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150">
                    <td className="px-6 py-3.5 font-mono font-bold text-gray-900 dark:text-slate-100">{item.order.orderNumber}</td>
                    <td className="px-6 py-3.5 font-semibold text-gray-900 dark:text-slate-100">{item.productName}</td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-slate-300">{item.quantity}</td>
                    <td className="px-6 py-3.5 font-bold text-gray-900 dark:text-slate-100">{formatPrice(item.subtotal)}</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(item.sellerEarnings?.netAmount || Number(item.subtotal) * 0.9)}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant={item.order.orderStatus === 'DELIVERED' ? 'success' : 'neutral'}>
                        {item.order.orderStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 dark:text-slate-400 font-medium">{formatDate(item.createdAt)}</td>
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
