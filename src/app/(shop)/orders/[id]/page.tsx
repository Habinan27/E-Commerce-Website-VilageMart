'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Star,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewModal } from '@/components/reviews/review-modal';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewingItem, setReviewingItem] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-gray-500">
        Loading order tracking and details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <Link href="/orders" className="inline-block mt-4">
          <Button size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Review Modal Triggered */}
      {reviewingItem && (
        <ReviewModal
          orderItemId={reviewingItem.id}
          productName={reviewingItem.name}
          onClose={() => setReviewingItem(null)}
        />
      )}

      {/* Success banner if redirected from checkout */}
      {searchParams.get('placed') === 'true' && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-sm block">Order Placed Successfully!</span>
            <span>Thank you for supporting Sri Lankan village sellers. We are preparing your shipment.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <Link href="/orders" className="text-xs font-semibold text-gray-500 hover:text-brand-700 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900">Order #{order.orderNumber}</h1>
            <Badge variant="brand">{order.orderStatus}</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">Placed on {formatDateTime(order.createdAt)}</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-500">Total Order Value</span>
          <div className="text-2xl font-extrabold text-brand-900">{formatPrice(order.totalAmount)}</div>
        </div>
      </div>

      {/* Order Tracking Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Delivery Tracking</h3>

        <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
          {steps.map((step, idx) => {
            const isCompleted = currentStepIndex >= idx && order.orderStatus !== 'CANCELLED';
            const isCurrent = currentStepIndex === idx && order.orderStatus !== 'CANCELLED';

            return (
              <div key={step.key} className="flex-1 flex sm:flex-col items-center sm:text-center relative">
                {/* Connecting Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`hidden sm:block absolute top-4 left-1/2 w-full h-1 -z-0 transition ${
                      currentStepIndex > idx ? 'bg-brand-600' : 'bg-gray-200'
                    }`}
                  ></div>
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition ${
                    isCompleted
                      ? 'bg-brand-700 text-white shadow-md ring-4 ring-brand-100'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="ml-3 sm:ml-0 sm:mt-2 text-left sm:text-center">
                  <p className={`text-xs font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit Status History Log */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 mb-3">Status Timeline Log</h4>
            <div className="space-y-2 text-xs">
              {order.statusHistory.map((hist: any) => (
                <div key={hist.id} className="flex items-start gap-3 text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900">{hist.status}</span>
                    <span className="text-gray-400 mx-2">•</span>
                    <span className="text-gray-500">{formatDateTime(hist.createdAt)}</span>
                    {hist.note && <p className="text-gray-600 text-[11px] mt-0.5">{hist.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Multi-Vendor Order Items */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Purchased Items</h3>

        <div className="divide-y divide-gray-100">
          {order.orderItems.map((item: any) => (
            <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-200 shrink-0">
                  <Image
                    src={
                      item.product?.productImages?.[0]?.imageUrl ||
                      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=80'
                    }
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{item.productName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Seller: <span className="font-semibold text-brand-800">{item.seller?.shopName}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatPrice(item.unitPrice)} × {item.quantity} units
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                <div className="text-sm font-extrabold text-gray-900">{formatPrice(item.subtotal)}</div>

                {/* Verified Review Button */}
                {item.review ? (
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-emerald-600" /> Reviewed ({item.review.rating}★)
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReviewingItem({ id: item.id, name: item.productName })}
                    className="text-xs py-1 px-3 gap-1"
                  >
                    <Star className="w-3 h-3 text-amber-500" /> Write Review
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address & Payment Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Delivery Address</h3>
          <div className="text-xs text-gray-700 space-y-1">
            <p className="font-bold text-gray-900">{order.address?.name}</p>
            <p>{order.address?.phone}</p>
            <p>{order.address?.addressLine}</p>
            <p className="font-medium text-brand-800">
              {order.address?.location?.name}, {order.address?.location?.parent?.name}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Payment Details</h3>
          <div className="text-xs text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Method:</span>
              <span className="font-semibold">{order.payment?.paymentMethod || 'COD'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <Badge variant={order.payment?.status === 'PAID' ? 'success' : 'warning'} size="sm">
                {order.payment?.status || 'PENDING'}
              </Badge>
            </div>
            {order.payment?.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Txn Ref:</span>
                <span className="font-mono text-gray-600">{order.payment.transactionId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
