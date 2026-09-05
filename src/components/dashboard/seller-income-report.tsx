'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Package,
  DollarSign,
  ShieldCheck,
  ShoppingBag,
  Search,
  ArrowUpDown,
  Eye,
  Calendar,
  X,
  FileText,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomDateRangePicker } from '@/components/ui/date-range-picker';
import { formatPrice } from '@/lib/utils';

interface ProductSaleItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantitySold: number;
  totalSales: number;
  sellerEarnings: number;
  platformIncome: number;
}

interface OrderSaleItem {
  orderId: string;
  orderNumber: string;
  date: string;
  customerName: string;
  orderStatus: string;
  itemsCount: number;
  totalSales: number;
  sellerEarnings: number;
  platformIncome: number;
}

interface TransactionItem {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sellerNet: number;
  platformFee: number;
  date: string;
  status: string;
}

interface SellerReportItem {
  sellerId: string;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  location: string;
  approvalStatus: string;
  productsSold: number;
  totalOrders: number;
  totalSales: number;
  sellerEarnings: number;
  platformIncome: number;
  productSales?: ProductSaleItem[];
  orderSales?: OrderSaleItem[];
  recentTransactions?: TransactionItem[];
}

interface SellerIncomeReportProps {
  initialReport: {
    summary: {
      totalSellers: number;
      totalProductsSold: number;
      totalSales: number;
      totalSellerEarnings: number;
      totalPlatformIncome: number;
      totalOrders: number;
    };
    sellers: SellerReportItem[];
  };
}

type DatePreset = 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM';

export function SellerIncomeReport({ initialReport }: SellerIncomeReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [datePreset, setDatePreset] = useState<DatePreset>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortField, setSortField] = useState<'totalSales' | 'productsSold' | 'totalOrders' | 'shopName' | 'sellerEarnings' | 'platformIncome'>('totalSales');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<SellerReportItem | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'products' | 'orders' | 'transactions'>('overview');

  // Filter sellers based on search, status, and date range
  const filteredSellers = useMemo(() => {
    // Determine date boundaries
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (datePreset === 'TODAY') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (datePreset === 'THIS_WEEK') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
      endDate = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59, 999);
    } else if (datePreset === 'THIS_MONTH') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (datePreset === 'THIS_YEAR') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (datePreset === 'CUSTOM') {
      if (customStartDate) startDate = new Date(customStartDate);
      if (customEndDate) {
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    return initialReport.sellers
      .map((seller) => {
        // If date filter is active, re-calculate seller stats based on orderSales dates
        if (startDate || endDate) {
          const relevantOrders = (seller.orderSales || []).filter((o) => {
            const orderDate = new Date(o.date);
            if (startDate && orderDate < startDate) return false;
            if (endDate && orderDate > endDate) return false;
            return true;
          });

          const relevantTransactions = (seller.recentTransactions || []).filter((t) => {
            const tDate = new Date(t.date);
            if (startDate && tDate < startDate) return false;
            if (endDate && tDate > endDate) return false;
            return true;
          });

          const totalSales = relevantOrders.reduce((sum, o) => sum + o.totalSales, 0);
          const sellerEarnings = relevantOrders.reduce((sum, o) => sum + o.sellerEarnings, 0);
          const platformIncome = relevantOrders.reduce((sum, o) => sum + o.platformIncome, 0);
          const totalOrders = relevantOrders.length;
          const productsSold = relevantOrders.reduce((sum, o) => sum + o.itemsCount, 0);

          return {
            ...seller,
            totalSales,
            sellerEarnings,
            platformIncome,
            totalOrders,
            productsSold,
            orderSales: relevantOrders,
            recentTransactions: relevantTransactions,
          };
        }
        return seller;
      })
      .filter((seller) => {
        const matchesSearch =
          seller.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seller.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seller.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || seller.approvalStatus === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [initialReport.sellers, searchTerm, statusFilter, datePreset, customStartDate, customEndDate, sortField, sortAsc]);

  // Top summary KPIs recalculated according to filtered results
  const summary = useMemo(() => {
    const totalSellers = filteredSellers.length;
    const totalProductsSold = filteredSellers.reduce((sum, s) => sum + s.productsSold, 0);
    const totalSales = filteredSellers.reduce((sum, s) => sum + s.totalSales, 0);
    const totalSellerEarnings = filteredSellers.reduce((sum, s) => sum + s.sellerEarnings, 0);
    const totalPlatformIncome = filteredSellers.reduce((sum, s) => sum + s.platformIncome, 0);
    const totalOrders = filteredSellers.reduce((sum, s) => sum + s.totalOrders, 0);

    return {
      totalSellers,
      totalProductsSold,
      totalSales,
      totalSellerEarnings,
      totalPlatformIncome,
      totalOrders,
    };
  }, [filteredSellers]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
            Seller Sales & Income
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Comprehensive financial reporting per seller, including 90% merchant earnings and 10% platform revenue.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Sellers */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Sellers</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-slate-100 mt-2">{summary.totalSellers}</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Registered merchants</p>
        </div>

        {/* Total Products Sold */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Products Sold</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-slate-100 mt-2">{summary.totalProductsSold}</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Units fulfilled</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-slate-100 mt-2">{summary.totalOrders}</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Completed orders</p>
        </div>

        {/* Total Sales */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Sales</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-slate-100 mt-2">{formatPrice(summary.totalSales)}</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Gross paid by buyers</p>
        </div>

        {/* Total Seller Earnings */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Seller Earnings</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
            {formatPrice(summary.totalSellerEarnings)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">90% seller net amount</p>
        </div>

        {/* Total Platform Income */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Platform Income</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {formatPrice(summary.totalPlatformIncome)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">10% marketplace fee</p>
        </div>
      </div>

      {/* Filter Suite */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors duration-150">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Seller */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search seller name, shop, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-slate-100 placeholder:text-gray-400 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-600 dark:focus:border-emerald-500 outline-none transition-colors"
            />
          </div>

          {/* Quick Date Range Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date:
            </span>
            {(['ALL', 'TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR', 'CUSTOM'] as DatePreset[]).map((preset) => {
              const label =
                preset === 'ALL'
                  ? 'All Time'
                  : preset === 'TODAY'
                  ? 'Today'
                  : preset === 'THIS_WEEK'
                  ? 'This Week'
                  : preset === 'THIS_MONTH'
                  ? 'This Month'
                  : preset === 'THIS_YEAR'
                  ? 'This Year'
                  : 'Custom Range';
              const isSelected = datePreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setDatePreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-150 select-none border ${
                    isSelected
                      ? 'bg-brand-700 dark:bg-emerald-600 text-white border-brand-700 dark:border-emerald-600 shadow-sm'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Range Calendar Picker (Shown when Custom Range is active) */}
        {datePreset === 'CUSTOM' && (
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs animate-in fade-in">
            <span className="text-gray-600 dark:text-slate-300 font-medium">Custom Range:</span>
            <CustomDateRangePicker
              value={{ startDate: customStartDate, endDate: customEndDate }}
              onChange={(range) => {
                setCustomStartDate(range.startDate);
                setCustomEndDate(range.endDate);
              }}
              onClear={() => {
                setCustomStartDate('');
                setCustomEndDate('');
              }}
            />
          </div>
        )}
      </div>

      {/* Seller Sales & Income Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-150">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer hover:text-gray-900 dark:hover:text-slate-100 select-none"
                  onClick={() => toggleSort('shopName')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Seller</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-center cursor-pointer hover:text-gray-900 dark:hover:text-slate-100 select-none"
                  onClick={() => toggleSort('productsSold')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Products Sold</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-center cursor-pointer hover:text-gray-900 dark:hover:text-slate-100 select-none"
                  onClick={() => toggleSort('totalOrders')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Orders</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-right cursor-pointer hover:text-gray-900 dark:hover:text-slate-100 select-none"
                  onClick={() => toggleSort('totalSales')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Sales</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-right cursor-pointer hover:text-gray-900 dark:hover:text-slate-100 select-none"
                  onClick={() => toggleSort('sellerEarnings')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Seller Earnings</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-right cursor-pointer hover:text-gray-900 dark:hover:text-slate-100 select-none"
                  onClick={() => toggleSort('platformIncome')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Platform Income</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center whitespace-nowrap">View Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                    No seller records found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSellers.map((s) => (
                  <tr
                    key={s.sellerId}
                    className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150"
                  >
                    {/* Seller Column */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">{s.shopName}</p>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                          {s.ownerName} • {s.location}
                        </p>
                      </div>
                    </td>

                    {/* Products Sold Column */}
                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-slate-100">
                      {s.productsSold}
                    </td>

                    {/* Orders Column */}
                    <td className="px-6 py-4 text-center font-medium text-gray-800 dark:text-slate-200">
                      {s.totalOrders}
                    </td>

                    {/* Total Sales Column */}
                    <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-slate-100">
                      {formatPrice(s.totalSales)}
                    </td>

                    {/* Seller Earnings Column (90%) */}
                    <td className="px-6 py-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      {formatPrice(s.sellerEarnings)}
                    </td>

                    {/* Platform Income Column (10%) */}
                    <td className="px-6 py-4 text-right font-bold text-amber-600 dark:text-amber-400">
                      {formatPrice(s.platformIncome)}
                    </td>

                    {/* View Details Column */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSeller(s);
                          setModalTab('overview');
                        }}
                        className="text-xs py-1.5 px-3.5 gap-1.5 whitespace-nowrap inline-flex items-center shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">View Details</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Seller Report Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-gray-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100">{selectedSeller.shopName}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Seller: <span className="font-semibold text-gray-800 dark:text-slate-200">{selectedSeller.ownerName}</span> • {selectedSeller.email || selectedSeller.phone || 'Sri Lanka'}
                </p>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Key Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
                <span className="text-gray-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Products Sold</span>
                <span className="text-base font-black text-gray-900 dark:text-slate-100 mt-1 block">
                  {selectedSeller.productsSold}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
                <span className="text-gray-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Total Orders</span>
                <span className="text-base font-black text-gray-900 dark:text-slate-100 mt-1 block">
                  {selectedSeller.totalOrders}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
                <span className="text-gray-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Total Sales</span>
                <span className="text-base font-black text-gray-900 dark:text-slate-100 mt-1 block">
                  {formatPrice(selectedSeller.totalSales)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50">
                <span className="text-emerald-800 dark:text-emerald-300 block text-[10px] font-bold uppercase">Seller Earnings</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                  {formatPrice(selectedSeller.sellerEarnings)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/50 col-span-2 sm:col-span-1">
                <span className="text-amber-800 dark:text-amber-300 block text-[10px] font-bold uppercase">Platform Income</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400 mt-1 block">
                  {formatPrice(selectedSeller.platformIncome)}
                </span>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 dark:border-slate-800 gap-2">
              <button
                onClick={() => setModalTab('overview')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors duration-150 ${
                  modalTab === 'overview'
                    ? 'border-brand-700 dark:border-emerald-500 text-brand-700 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
                }`}
              >
                Profile & Overview
              </button>
              <button
                onClick={() => setModalTab('products')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors duration-150 ${
                  modalTab === 'products'
                    ? 'border-brand-700 dark:border-emerald-500 text-brand-700 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
                }`}
              >
                Product-wise Sales ({selectedSeller.productSales?.length || 0})
              </button>
              <button
                onClick={() => setModalTab('orders')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors duration-150 ${
                  modalTab === 'orders'
                    ? 'border-brand-700 dark:border-emerald-500 text-brand-700 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
                }`}
              >
                Order-wise Sales ({selectedSeller.orderSales?.length || 0})
              </button>
              <button
                onClick={() => setModalTab('transactions')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors duration-150 ${
                  modalTab === 'transactions'
                    ? 'border-brand-700 dark:border-emerald-500 text-brand-700 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
                }`}
              >
                Recent Transactions ({selectedSeller.recentTransactions?.length || 0})
              </button>
            </div>

            {/* Tab: Profile & Overview */}
            {modalTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 dark:text-slate-500 uppercase font-bold text-[10px]">Shop Name</span>
                    <p className="font-bold text-gray-900 dark:text-slate-100 text-xs mt-0.5">{selectedSeller.shopName}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 dark:text-slate-500 uppercase font-bold text-[10px]">Owner Name</span>
                    <p className="font-bold text-gray-900 dark:text-slate-100 text-xs mt-0.5">{selectedSeller.ownerName}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 dark:text-slate-500 uppercase font-bold text-[10px]">Email Address</span>
                    <p className="font-medium text-gray-900 dark:text-slate-100 text-xs mt-0.5 truncate">
                      {selectedSeller.email || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 dark:text-slate-500 uppercase font-bold text-[10px]">Phone Number</span>
                    <p className="font-medium text-gray-900 dark:text-slate-100 text-xs mt-0.5">
                      {selectedSeller.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 dark:text-slate-500 uppercase font-bold text-[10px]">Location</span>
                    <p className="font-medium text-gray-900 dark:text-slate-100 text-xs mt-0.5">
                      {selectedSeller.location}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                    <span className="text-gray-400 dark:text-slate-500 uppercase font-bold text-[10px]">Approval Status</span>
                    <p className="mt-0.5">
                      <Badge variant={selectedSeller.approvalStatus === 'APPROVED' ? 'success' : 'warning'} size="sm">
                        {selectedSeller.approvalStatus}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Product-wise Sales */}
            {modalTab === 'products' && (
              <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase font-bold border-b border-gray-200 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Product</th>
                      <th className="px-4 py-2.5 text-center">Sold</th>
                      <th className="px-4 py-2.5 text-right">Total Sales</th>
                      <th className="px-4 py-2.5 text-right">Seller Net (90%)</th>
                      <th className="px-4 py-2.5 text-right">Platform Fee (10%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                    {(!selectedSeller.productSales || selectedSeller.productSales.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                          No product sales recorded yet.
                        </td>
                      </tr>
                    ) : (
                      selectedSeller.productSales.map((p) => (
                        <tr key={p.productId} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-slate-100">{p.name}</td>
                          <td className="px-4 py-3 text-center font-bold">{p.quantitySold}</td>
                          <td className="px-4 py-3 text-right font-black">{formatPrice(p.totalSales)}</td>
                          <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">
                            {formatPrice(p.sellerEarnings)}
                          </td>
                          <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400 font-bold">
                            {formatPrice(p.platformIncome)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Order-wise Sales */}
            {modalTab === 'orders' && (
              <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase font-bold border-b border-gray-200 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Order #</th>
                      <th className="px-4 py-2.5">Customer</th>
                      <th className="px-4 py-2.5 text-center">Items</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                      <th className="px-4 py-2.5 text-right">Seller Net</th>
                      <th className="px-4 py-2.5 text-right">Platform Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                    {(!selectedSeller.orderSales || selectedSeller.orderSales.length === 0) ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                          No completed orders recorded yet.
                        </td>
                      </tr>
                    ) : (
                      selectedSeller.orderSales.map((o) => (
                        <tr key={o.orderId} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-bold text-gray-900 dark:text-slate-100">
                            {o.orderNumber}
                            <span className="block text-[10px] text-gray-400 font-normal">
                              {new Date(o.date).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">{o.customerName}</td>
                          <td className="px-4 py-3 text-center font-bold">{o.itemsCount}</td>
                          <td className="px-4 py-3 text-right font-black">{formatPrice(o.totalSales)}</td>
                          <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">
                            {formatPrice(o.sellerEarnings)}
                          </td>
                          <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400 font-bold">
                            {formatPrice(o.platformIncome)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Recent Transactions */}
            {modalTab === 'transactions' && (
              <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase font-bold border-b border-gray-200 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Order / Item</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Subtotal</th>
                      <th className="px-4 py-2.5 text-right">Seller Net (90%)</th>
                      <th className="px-4 py-2.5 text-right">Platform Fee (10%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                    {(!selectedSeller.recentTransactions || selectedSeller.recentTransactions.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                          No recent transactions found.
                        </td>
                      </tr>
                    ) : (
                      selectedSeller.recentTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-900 dark:text-slate-100">{t.productName}</p>
                            <p className="text-[10px] text-gray-400">{t.orderNumber} • {new Date(t.date).toLocaleDateString()}</p>
                          </td>
                          <td className="px-4 py-3 text-center font-bold">{t.quantity}</td>
                          <td className="px-4 py-3 text-right font-black">{formatPrice(t.subtotal)}</td>
                          <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">
                            {formatPrice(t.sellerNet)}
                          </td>
                          <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400 font-bold">
                            {formatPrice(t.platformFee)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal Close Button */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setSelectedSeller(null)}
                className="w-full"
              >
                Close Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

