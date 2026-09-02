import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderService } from '@/lib/services/order-service';
import { getSessionUser } from '@/lib/auth';
import { formatPrice, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'My Orders & Tracking',
};

export default async function OrdersPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login?callbackUrl=/orders');
  }

  const orders = await OrderService.getCustomerOrders(session.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">Delivered</Badge>;
      case 'SHIPPED':
        return <Badge variant="info">Shipped / In Transit</Badge>;
      case 'PROCESSING':
        return <Badge variant="brand">Processing</Badge>;
      case 'CONFIRMED':
        return <Badge variant="warning">Confirmed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">Pending Confirmation</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        My Orders & Tracking
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-xl mx-auto">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900">No orders placed yet</h2>
          <p className="text-xs text-gray-500 mt-1">Discover authentic village harvests and place your first order.</p>
          <Link href="/products" className="inline-block mt-4">
            <Button size="sm">Explore Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:border-brand-300 transition"
            >
              {/* Order Header */}
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-500 font-medium">Order Number:</span>
                    <span className="font-bold text-gray-900 ml-1.5">{order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Placed on:</span>
                    <span className="font-semibold text-gray-700 ml-1.5">{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.orderStatus)}
                  <Link href={`/orders/${order.id}`}>
                    <Button size="sm" variant="outline" className="text-xs py-1 px-3">
                      View Details & Tracking →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Items Summary */}
              <div className="p-6 space-y-4">
                <div className="divide-y divide-gray-100">
                  {order.orderItems.map((item: any) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-200 shrink-0">
                          <Image
                            src={
                              item.product?.productImages?.[0]?.imageUrl ||
                              'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&auto=format&fit=crop&q=80'
                            }
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{item.productName}</p>
                          <p className="text-[11px] text-gray-500">
                            Sold by: {item.seller?.shopName} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-gray-900">{formatPrice(item.subtotal)}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="text-gray-500">
                    Payment Method: <span className="font-semibold text-gray-700">{order.payment?.paymentMethod || 'COD'}</span>
                  </div>
                  <div className="text-sm font-extrabold text-gray-900">
                    Total: <span className="text-brand-800">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
