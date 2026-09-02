import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WishlistView } from '@/components/wishlist/wishlist-view';
import { WishlistService } from '@/lib/services/wishlist-service';
import { getSessionUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'My Saved Products | Village Mart',
  description: 'View and manage your saved village products, honey, traditional rice, and handmade crafts.',
};

export default async function WishlistPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login?callbackUrl=/wishlist');
  }

  const wishlist = await WishlistService.getOrCreateWishlist(session.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          My Saved Products
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Items you saved to buy later or move directly to your shopping cart.
        </p>
      </div>

      <WishlistView initialItems={wishlist.items} />
    </div>
  );
}
