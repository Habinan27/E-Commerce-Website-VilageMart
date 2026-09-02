import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, MapPin, Phone, User, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderService } from '@/lib/services/order-service';
import { requireRole } from '@/lib/auth';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Seller Orders',
};

export default async function SellerOrdersPage() {
  const session = await requireRole(['SELLER', 'ADMIN']);
  if (!session.sellerProfileId) return null;

  const orderItems = await OrderService.getSellerOrders(session.sellerProfileId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Customer Orders</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            View orders containing products from your shop and dispatch items promptly.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-150">
        {orderItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 dark:text-slate-400">
            <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">No orders received yet</p>
            <p className="mt-1">When customers order your products, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Qty & Unit Price</th>
                  <th className="px-6 py-3">Gross Subtotal</th>
                  <th className="px-6 py-3">Net Seller Earning</th>
                  <th className="px-6 py-3">Customer & Delivery</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
                {orderItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-slate-100">
                      <Link href={`/orders/${item.orderId}`} className="hover:text-brand-700 dark:hover:text-emerald-400 hover:underline">
                        {item.order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-slate-100 max-w-[200px] truncate">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-medium">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100">{formatPrice(item.subtotal)}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(item.sellerEarnings?.netAmount || Number(item.subtotal) * 0.9)}
                    </td>
                    <td className="px-6 py-4 max-w-[220px]">
                      <div className="font-semibold text-gray-900 dark:text-slate-100 truncate">{item.order.address?.name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1 truncate mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 dark:text-slate-500 shrink-0" />
                        {item.order.address?.location?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          item.order.orderStatus === 'DELIVERED'
                            ? 'success'
                            : item.order.orderStatus === 'SHIPPED'
                            ? 'info'
                            : item.order.orderStatus === 'CANCELLED'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {item.order.orderStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap font-medium">{formatDate(item.createdAt)}</td>
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
