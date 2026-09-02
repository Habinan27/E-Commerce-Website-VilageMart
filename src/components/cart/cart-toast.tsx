'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface CartToastData {
  productName: string;
  productImage?: string;
  price?: number | string;
  quantity: number;
  totalCount?: number;
}

export function CartToast() {
  const [toastData, setToastData] = useState<CartToastData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleCartItemAdded = (e: any) => {
      if (e.detail) {
        setToastData({
          productName: e.detail.productName || e.detail.name || 'Product',
          productImage: e.detail.productImage || e.detail.imageUrl,
          price: e.detail.price,
          quantity: e.detail.quantity || 1,
          totalCount: e.detail.count,
        });
        setVisible(true);

        clearTimeout(timer);
        timer = setTimeout(() => {
          setVisible(false);
        }, 4500);
      }
    };

    window.addEventListener('cart-item-added', handleCartItemAdded);
    return () => {
      window.removeEventListener('cart-item-added', handleCartItemAdded);
      clearTimeout(timer);
    };
  }, []);

  if (!visible || !toastData) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 shadow-2xl space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Added to Shopping Cart!</span>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Info */}
        <div className="flex items-center gap-3">
          {toastData.productImage && (
            <div className="relative w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 overflow-hidden shrink-0">
              <Image
                src={toastData.productImage}
                alt={toastData.productName}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
              {toastData.productName}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
              <span>Qty: {toastData.quantity}</span>
              {toastData.price !== undefined && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">
                    {formatPrice(typeof toastData.price === 'number' ? toastData.price * toastData.quantity : toastData.price)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1 flex items-center gap-2">
          <Link
            href="/cart"
            prefetch={false}
            onClick={() => setVisible(false)}
            className="flex-1 py-2 px-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> View Cart
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
          <Link
            href="/checkout"
            prefetch={false}
            onClick={() => setVisible(false)}
            className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
