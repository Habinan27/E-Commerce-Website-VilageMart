import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Admin Dashboard | Village Mart',
};

export default async function AdminDashboardPage() {
  const [summary, monthlyRevenue, topSellers, topProducts, categorySales, locationSales] = await Promise.all([
    AnalyticsService.getAdminSummary(),
    AnalyticsService.getMonthlyRevenue(),
    AnalyticsService.getTopSellers(5),
    AnalyticsService.getTopProducts(5),
    AnalyticsService.getCategorySales(),
    AnalyticsService.getLocationSales(),
  ]);

  return (
    <div className="space-y-8 pb-12">
      {/* Pending Seller Approvals Alert Banner */}
      {summary.pendingSellers > 0 && (
        <div className="bg-amber-500 text-brand-950 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <p className="text-sm font-extrabold">
                {summary.pendingSellers} Pending Seller Application{summary.pendingSellers === 1 ? '' : 's'} Waiting for Approval!
              </p>
              <p className="text-xs text-brand-900 font-medium">
                New village sellers have registered and need your verification before they can list products.
              </p>
            </div>
          </div>
          <Link href="/dashboard/admin/sellers">
            <button className="bg-brand-950 text-white hover:bg-brand-900 font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap shadow transition">
              Review & Accept Sellers →
            </button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Overview of total sales, orders, seller approvals, and products across Sri Lanka.
          </p>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={formatPrice(summary.totalRevenue)}
          description="Total value of completed customer orders"
          icon={<DollarSign className="w-5 h-5 text-brand-700 dark:text-emerald-400" />}
        />
        <StatCard
          title="Platform Earnings (10%)"
          value={formatPrice(summary.platformCommission)}
          description="10% marketplace commission fee"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <StatCard
          title="Total Orders"
          value={summary.totalOrders}
          description={`${summary.pendingOrders} orders being processed`}
          icon={<ShoppingBag className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        />
        <StatCard
          title="Total Customers"
          value={summary.totalCustomers}
          description="Registered shopper accounts"
          icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm transition-colors duration-150">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Active Sellers</p>
            <p className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-1">{summary.totalSellers}</p>
          </div>
          <Link
            href="/dashboard/admin/sellers"
            className="text-xs font-bold text-brand-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            View Sellers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm transition-colors duration-150">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Pending Approvals</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary.pendingSellers}</p>
          </div>
          <Link
            href="/dashboard/admin/sellers"
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Review Applications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm transition-colors duration-150">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Listed Products</p>
            <p className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-1">{summary.totalProducts}</p>
          </div>
          <Link
            href="/dashboard/admin/products"
            className="text-xs font-bold text-brand-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Manage Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts
        monthlyData={monthlyRevenue}
        topSellers={topSellers}
        topProducts={topProducts}
        categorySales={categorySales}
        locationSales={locationSales}
      />
    </div>
  );
}
