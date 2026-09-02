import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Star,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Store,
  HeartHandshake,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/product-card';
import { ProductService } from '@/lib/services/product-service';
import { SellerService } from '@/lib/services/seller-service';
import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'OoruMart | Sri Lanka Village & Local Products Marketplace',
  description:
    'Buy fresh village products, pure honey, traditional rice, spices, and handmade crafts directly from local Sri Lankan farmers and artisans.',
};

export default async function HomePage() {
  const [featuredProducts, topSellers, categories, provinces] = await Promise.all([
    ProductService.getFeaturedProducts(8),
    SellerService.getTopSellers(4),
    prisma.category.findMany({
      where: { status: true },
      take: 8,
      orderBy: { id: 'asc' },
    }),
    prisma.location.findMany({
      where: { type: 'PROVINCE' },
      include: {
        children: {
          take: 3,
        },
      },
      take: 5,
    }),
  ]);

  const serializedCategories = serializeBigInt(categories);
  const serializedProvinces = serializeBigInt(provinces);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-brand-950 via-brand-900 to-earth-950 text-white overflow-hidden py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Col: Hero Copy */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-800/80 border border-brand-700/60 text-brand-200 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Sri Lanka&apos;s Local Village Marketplace</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Fresh Village Products,{' '}
                <span className="text-amber-300 font-serif italic">Direct to Your Home.</span>
              </h1>

              <p className="text-sm sm:text-base text-brand-100/90 max-w-xl font-normal leading-relaxed">
                Buy pure honey, traditional rice, spices, palm sweets, and handmade items directly from verified village sellers across Sri Lanka.
              </p>

              {/* Popular Unicode Quick Searches */}
              <div className="pt-1">
                <p className="text-xs text-brand-200 font-medium mb-2">Popular Searches:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'யாழ்ப்பாண பனங்கற்கண்டு (Palm Candy)', query: 'பனங்கற்கண்டு' },
                    { label: 'கிராமத்து தேன் (Pure Honey)', query: 'தேன்' },
                    { label: 'மாப்பிள்ளை சம்பா அரிசி (Traditional Rice)', query: 'அரிசி' },
                    { label: 'கறித்தூள் (Curry Powder)', query: 'கறித்தூள்' },
                    { label: 'பனை ஓலைக் கூடை (Palmyra Basket)', query: 'கூடை' },
                  ].map((tag) => (
                    <Link
                      key={tag.query}
                      href={`/products?query=${encodeURIComponent(tag.query)}`}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-xs font-medium text-amber-200 transition"
                    >
                      {tag.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link href="/products">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-brand-950 font-bold gap-2 shadow-lg">
                    <ShoppingBag className="w-4 h-4" /> Shop All Products
                  </Button>
                </Link>

                <Link href="/register?role=seller">
                  <Button
                    variant="outline-light"
                    size="lg"
                    className="gap-2"
                  >
                    <Store className="w-4 h-4" /> Sell on Village Mart
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Col: Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15 bg-brand-900/50 backdrop-blur-md p-2.5">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80"
                    alt="Authentic Sri Lankan Palm Sweets"
                    fill
                    priority
                    className="object-cover"
                    sizes="500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                    <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">
                      Village Specialty
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      யாழ்ப்பாண பனங்கற்கண்டு (Jaffna Palm Candy)
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">Direct from Valvettithurai, Northern Province</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-brand-50/50 dark:bg-slate-800/60 rounded-2xl border border-brand-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-brand-700 dark:text-brand-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">100% Authentic</h4>
              <p className="text-[11px] text-gray-600 dark:text-slate-300">Direct from village producers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-brand-700 dark:text-brand-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">Islandwide Delivery</h4>
              <p className="text-[11px] text-gray-600 dark:text-slate-300">To all 9 provinces</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-brand-700 dark:text-brand-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">Cash on Delivery</h4>
              <p className="text-[11px] text-gray-600 dark:text-slate-300">Pay when you receive</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HeartHandshake className="w-8 h-8 text-brand-700 dark:text-brand-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">Support Rural Sellers</h4>
              <p className="text-[11px] text-gray-600 dark:text-slate-300">Direct income to farmers</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Top Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">Explore traditional foods, spices, honey, rice, and handmade crafts</p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1 hover:underline transition-colors"
          >
            All Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {serializedCategories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all duration-150 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] bg-gray-100 dark:bg-slate-900 overflow-hidden">
                <Image
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-sm sm:text-base group-hover:text-amber-300 transition leading-snug">
                    {cat.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">Popular and top-rated items from local sellers</p>
          </div>
          <Link
            href="/products"
            className="text-sm font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1 hover:underline transition-colors"
          >
            See All Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Top Verified Village Sellers */}
      <section className="bg-brand-50/50 dark:bg-slate-900/50 py-12 border-y border-brand-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                Top Local Sellers
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">Trusted sellers with verified shops and quality products</p>
            </div>
            <Link
              href="/sellers"
              className="text-sm font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 hover:underline flex items-center gap-1 transition-colors"
            >
              All Sellers <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topSellers.map((seller: any) => (
              <div
                key={seller.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="relative w-12 h-12 rounded-xl bg-brand-50 dark:bg-slate-700 overflow-hidden border border-brand-200 dark:border-slate-600 shrink-0">
                      <Image
                        src={seller.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'}
                        alt={seller.shopName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/sellers/${seller.slug}`}
                        className="font-bold text-sm text-gray-900 dark:text-slate-100 hover:text-brand-700 dark:hover:text-brand-400 truncate block transition-colors"
                      >
                        {seller.shopName}
                      </Link>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-brand-600 dark:text-brand-400 shrink-0" />
                        <span className="truncate">{seller.location?.name || 'Sri Lanka'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {seller.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-800 dark:text-slate-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{seller.averageRating}</span>
                    <span className="text-gray-500 dark:text-slate-400 font-normal">({seller.reviewCount} reviews)</span>
                  </div>

                  <Link href={`/sellers/${seller.slug}`}>
                    <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                      View Shop
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Regional Hubs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            Shop by Province & District
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
            Discover local products from Northern, Eastern, Central, Western, and Southern Sri Lanka.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {serializedProvinces.map((prov: any) => (
            <div
              key={prov.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-sm transition-all duration-150"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-slate-100">{prov.name}</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                {prov.children?.map((c: any) => c.name).join(', ') || 'Local districts'}
              </p>
              <Link href={`/products?province=${prov.slug}`}>
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  View {prov.name} Products
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Seller Onboarding Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-earth-800 to-earth-950 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-xl space-y-3 relative z-10">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold">
              For Local Farmers & Artisans
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sell Your Village Products on Village Mart
            </h2>
            <p className="text-xs sm:text-sm text-earth-100 leading-relaxed">
              Open your free online shop. List your products in Tamil, English, or Sinhala and start receiving orders from customers across Sri Lanka.
            </p>
            <div className="pt-2">
              <Link href="/register?role=seller">
                <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-earth-950 font-bold shadow-md">
                  Open a Seller Shop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
