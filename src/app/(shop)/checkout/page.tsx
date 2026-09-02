import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { OrderService } from '@/lib/services/order-service';
import { LocationService } from '@/lib/services/location-service';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Checkout',
};

export default async function CheckoutPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login?callbackUrl=/checkout');
  }

  const [cart, savedAddresses, locationsHierarchy] = await Promise.all([
    OrderService.getOrCreateCart(session.id),
    prisma.address.findMany({
      where: { userId: BigInt(session.id) },
      include: {
        location: {
          include: { parent: true },
        },
      },
      orderBy: { isDefault: 'desc' },
    }),
    LocationService.getFullHierarchy(),
  ]);

  if (cart.items.length === 0) {
    redirect('/cart');
  }

  const serializedAddresses = serializeBigInt(savedAddresses);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Checkout & Shipping
      </h1>
      <CheckoutForm
        cart={cart}
        savedAddresses={serializedAddresses}
        locations={locationsHierarchy}
      />
    </div>
  );
}
