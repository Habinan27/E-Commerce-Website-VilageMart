import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Store, MapPin, Star, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SellerService } from '@/lib/services/seller-service';
import { generateSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Verified Village Sellers',
  description: 'Meet approved local producers, palmyra artisans, and rural farmers across Sri Lanka.',
  path: '/sellers',
});

export default async function SellersPage() {
  const sellers = await SellerService.getTopSellers(12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">Verified Village Sellers</h1>
        <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
          Directly supporting local smallholder farmers, traditional cooperatives, and family artisans.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller: any) => (
          <div
            key={seller.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all duration-150 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-brand-50 dark:bg-slate-700 overflow-hidden border border-brand-100 dark:border-slate-600 shrink-0">
                  <Image
                    src={seller.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'}
                    alt={seller.shopName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/sellers/${seller.slug}`}
                      className="text-base font-bold text-gray-900 dark:text-slate-100 hover:text-brand-700 dark:hover:text-brand-400 truncate transition-colors"
                    >
                      {seller.shopName}
                    </Link>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-brand-600 dark:text-brand-400 shrink-0" />
                    <span className="truncate">{seller.location?.name || 'Sri Lanka'}</span>
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-800 dark:text-slate-200 mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{seller.averageRating}</span>
                    <span className="text-gray-500 dark:text-slate-400 font-normal">({seller.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-slate-300 mt-4 line-clamp-3 leading-relaxed">
                {seller.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                {seller.productCount} Products
              </span>
              <Link
                href={`/sellers/${seller.slug}`}
                className="group/badge inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-brand-600/70 dark:border-emerald-500/60 bg-brand-50/50 dark:bg-emerald-950/40 text-brand-800 dark:text-emerald-300 hover:bg-brand-700 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white hover:border-brand-700 dark:hover:border-emerald-600 shadow-sm hover:shadow-md active:scale-95 transition-all duration-150 shrink-0"
              >
                <Store className="w-3.5 h-3.5 text-brand-600 dark:text-emerald-400 group-hover/badge:text-white transition-colors shrink-0" />
                <span>View Shop</span>
                <ChevronRight className="w-3 h-3 text-brand-600/70 dark:text-emerald-400/70 group-hover/badge:text-white group-hover/badge:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
