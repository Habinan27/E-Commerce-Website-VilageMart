import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CartView } from '@/components/cart/cart-view';
import { OrderService } from '@/lib/services/order-service';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'Shopping Cart',
};

export default async function CartPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login?callbackUrl=/cart');
  }

  const cart = await OrderService.getOrCreateCart(session.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Shopping Cart
      </h1>
      <CartView initialCart={cart} />
    </div>
  );
}
