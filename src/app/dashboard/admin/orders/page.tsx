import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, MapPin, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderService } from '@/lib/services/order-service';
import { requireRole } from '@/lib/auth';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'All Orders - Admin',
};

export default async function AdminOrdersPage() {
  await requireRole('ADMIN');
  const orders = await OrderService.getAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Platform Orders Management</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Inspect multi-vendor customer orders, verify payments, and monitor order progression.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-150">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Delivery Destination</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Order Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-slate-100">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-slate-100">{order.user?.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800 dark:text-slate-200">{order.address?.location?.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate max-w-[150px]">{order.address?.addressLine}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-brand-900 dark:text-emerald-400">{formatPrice(order.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                      {order.payment?.paymentMethod || 'COD'} • {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        order.orderStatus === 'DELIVERED'
                          ? 'success'
                          : order.orderStatus === 'SHIPPED'
                          ? 'info'
                          : order.orderStatus === 'CANCELLED'
                          ? 'danger'
                          : 'brand'
                      }
                    >
                      {order.orderStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/orders/${order.id}`}>
                      <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
