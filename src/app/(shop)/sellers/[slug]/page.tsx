import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Phone, Mail, CheckCircle2, Star, Store, ShieldCheck } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { BackButton } from '@/components/ui/back-button';
import { SellerService } from '@/lib/services/seller-service';
import { prisma } from '@/lib/db/prisma';
import { generateSeoMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SellerStorefrontProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: SellerStorefrontProps): Promise<Metadata> {
  const seller = await SellerService.getSellerBySlug(params.slug);
  if (!seller) return { title: 'Seller Not Found' };

  return generateSeoMetadata({
    title: `${seller.shopName} - Village Seller Storefront`,
    description: seller.description?.substring(0, 155),
    path: `/sellers/${seller.slug}`,
    image: seller.logoUrl || undefined,
  });
}

export default async function SellerStorefrontPage({ params }: SellerStorefrontProps) {
  const seller = await SellerService.getSellerBySlug(params.slug);
  if (!seller) notFound();

  let sellerAnnouncement = null;
  try {
    if (prisma?.announcement) {
      sellerAnnouncement = await prisma.announcement.findFirst({
        where: {
          sellerId: seller.id,
          isActive: true,
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });
    }
  } catch (e) {
    // ignore
  }

  const fullLocation = seller.location
    ? `${seller.location.name}${seller.location.parent ? `, ${seller.location.parent.name}` : ''}${
        seller.location.parent?.parent ? `, ${seller.location.parent.parent.name}` : ''
      }`
    : 'Sri Lanka';

  const themeClasses: Record<string, { bar: string; badge: string; linkBtn: string }> = {
    emerald: {
      bar: 'bg-emerald-800 dark:bg-emerald-950 text-emerald-50 border border-emerald-700/50',
      badge: 'bg-emerald-950/70 text-emerald-200 border border-emerald-700',
      linkBtn: 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600/60',
    },
    amber: {
      bar: 'bg-amber-600 dark:bg-amber-950 text-amber-50 border border-amber-500/50',
      badge: 'bg-amber-900/70 text-amber-200 border border-amber-500',
      linkBtn: 'bg-amber-700 hover:bg-amber-600 text-white border border-amber-400/60',
    },
    brand: {
      bar: 'bg-brand-900 dark:bg-slate-950 text-brand-50 border border-brand-800/60',
      badge: 'bg-brand-950/80 text-brand-200 border border-brand-700',
      linkBtn: 'bg-brand-800 hover:bg-brand-700 text-white border border-brand-600/60',
    },
    indigo: {
      bar: 'bg-indigo-700 dark:bg-indigo-950 text-indigo-50 border border-indigo-600/50',
      badge: 'bg-indigo-900/70 text-indigo-200 border border-indigo-500',
      linkBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/60',
    },
    rose: {
      bar: 'bg-rose-700 dark:bg-rose-950 text-rose-50 border border-rose-600/50',
      badge: 'bg-rose-900/70 text-rose-200 border border-rose-500',
      linkBtn: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/60',
    },
    slate: {
      bar: 'bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800',
      badge: 'bg-slate-800 text-slate-300 border border-slate-700',
      linkBtn: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600',
    },
    gradient: {
      bar: 'bg-gradient-to-r from-emerald-900 via-amber-700 to-emerald-900 text-white border border-amber-600/40',
      badge: 'bg-black/40 text-amber-200 border border-white/20',
      linkBtn: 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm',
    },
  };

  const selectedTheme = sellerAnnouncement
    ? themeClasses[sellerAnnouncement.theme] || themeClasses.emerald
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Back Button */}
      <div>
        <BackButton fallbackUrl="/sellers" label="Back to Sellers" />
      </div>

      {/* Seller Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-50 overflow-hidden border-2 border-brand-200 shrink-0 shadow-md">
            <Image
              src={seller.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80'}
              alt={seller.shopName}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {seller.shopName}
              </h1>
              <span className="inline-flex items-center gap-1 bg-brand-100 text-brand-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Seller
              </span>
            </div>

            <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>{fullLocation}</span>
              <span className="text-gray-300">•</span>
              <span>{seller.address}</span>
            </p>

            <p className="text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed pt-1">
              {seller.description}
            </p>
          </div>

          {/* Rating & Stats */}
          <div className="sm:border-l border-gray-200 sm:pl-6 space-y-2 text-center sm:text-left shrink-0">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-bold text-gray-900">{seller.averageRating}</span>
              <span className="text-xs text-gray-400">/ 5.0</span>
            </div>
            <p className="text-xs text-gray-500">{seller.reviewCount} customer reviews</p>
            <p className="text-xs font-semibold text-brand-800">{seller.productCount} active products</p>
          </div>
        </div>
      </div>

      {/* Seller Custom Shop Announcement / Marquee Banner */}
      {sellerAnnouncement && selectedTheme && (
        <div className={`rounded-2xl overflow-hidden shadow-sm transition-all ${selectedTheme.bar}`}>
          {sellerAnnouncement.isMarquee ? (
            <div className="group relative flex items-center py-2.5 overflow-hidden select-none">
              <div
                className="flex items-center gap-12 whitespace-nowrap will-change-transform animate-marquee group-hover:[animation-play-state:paused]"
                style={{ animationDuration: `${sellerAnnouncement.speed || 28}s` }}
              >
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4 shrink-0">
                    {sellerAnnouncement.title && (
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase shrink-0 ${selectedTheme.badge}`}>
                        {sellerAnnouncement.title}
                      </span>
                    )}
                    <span className="font-semibold text-xs tracking-tight">
                      {sellerAnnouncement.content}
                    </span>
                    {sellerAnnouncement.contentTamil && (
                      <>
                        <span className="opacity-40">•</span>
                        <span className="font-medium text-xs font-tamil tracking-normal">
                          {sellerAnnouncement.contentTamil}
                        </span>
                      </>
                    )}
                    {sellerAnnouncement.linkUrl && (
                      <Link
                        href={sellerAnnouncement.linkUrl}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all ml-1 ${selectedTheme.linkBtn}`}
                      >
                        <span>{sellerAnnouncement.linkLabel || 'Explore'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                    <span className="opacity-40 ml-4">•</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 text-center flex items-center justify-center flex-wrap gap-2 sm:gap-3 text-xs">
              {sellerAnnouncement.title && (
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase shrink-0 ${selectedTheme.badge}`}>
                  {sellerAnnouncement.title}
                </span>
              )}
              <span className="font-semibold">{sellerAnnouncement.content}</span>
              {sellerAnnouncement.contentTamil && (
                <span className="font-medium font-tamil hidden sm:inline">
                  {sellerAnnouncement.contentTamil}
                </span>
              )}
              {sellerAnnouncement.linkUrl && (
                <Link
                  href={sellerAnnouncement.linkUrl}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all ml-1 ${selectedTheme.linkBtn}`}
                >
                  <span>{sellerAnnouncement.linkLabel || 'Explore'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Seller Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Products from {seller.shopName}</h2>
          <span className="text-xs text-gray-500">{seller.products.length} items available</span>
        </div>

        {seller.products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-xs text-gray-500">
            This seller does not have any active products listed right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seller.products.map((p: any) => (
              <ProductCard key={p.id} product={{ ...p, seller }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
