import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
  ChevronRight,
  Heart,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/back-button';
import { RatingStars } from '@/components/ui/rating-stars';
import { ProductActions } from '@/components/products/product-actions';
import { ProductGallery } from '@/components/products/product-gallery';
import { ProductCard } from '@/components/products/product-card';
import { ProductService } from '@/lib/services/product-service';
import { generateSeoMetadata, generateProductJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo';
import { formatPrice, formatDate } from '@/lib/utils';

interface ProductDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await ProductService.getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };

  return generateSeoMetadata({
    title: product.name,
    description: product.metaDescription || product.description?.substring(0, 155),
    path: `/products/${product.slug}`,
    image: product.productImages?.[0]?.imageUrl || undefined,
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await ProductService.getProductBySlug(params.slug);
  if (!product) notFound();

  const jsonLd = generateProductJsonLd(product);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.category?.name || 'Category', url: `/products?category=${product.category?.slug}` },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  const sellerLocation = product.seller?.location
    ? `${product.seller.location.name}${product.seller.location.parent ? `, ${product.seller.location.parent.name}` : ''}`
    : 'Sri Lanka';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Top Bar: Back Button & Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-3">
        <BackButton fallbackUrl="/products" label="Back to Products" />
        <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-brand-700 dark:hover:text-brand-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href="/products" className="hover:text-brand-700 dark:hover:text-brand-400 transition-colors">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-700 dark:hover:text-brand-400 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-900 dark:text-slate-200 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery images={product.productImages || []} productName={product.name} />
        </div>

        {/* Right Product Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Category & Status */}
          <div className="flex items-center gap-2">
            {product.category && (
              <Link href={`/products?category=${product.category.slug}`}>
                <Badge variant="brand" size="md">
                  {product.category.name}
                </Badge>
              </Link>
            )}
            {product.stock > 0 ? (
              <Badge variant="success" size="md">
                In Stock ({product.stock} units)
              </Badge>
            ) : (
              <Badge variant="danger" size="md">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Product Title (supports Tamil / Sinhala) */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center gap-3">
            <RatingStars
              rating={product.averageRating || 0}
              reviewCount={product.reviewCount}
              size="md"
            />
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500">{product.reviewCount || 0} verified customer reviews</span>
          </div>

          {/* Price Section */}
          <div className="flex flex-wrap items-baseline justify-between gap-3 py-3 border-b border-gray-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium block mb-0.5">Selling Price (LKR)</span>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">{formatPrice(product.price)}</div>
            </div>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Cash on Delivery Available
            </span>
          </div>

          {/* Interactive Add to Cart & Buy Now Actions */}
          <ProductActions
            productId={product.id.toString()}
            productName={product.name}
            productImage={product.productImages?.[0]?.imageUrl}
            stock={product.stock}
            price={typeof product.price === 'number' ? product.price : parseFloat(product.price.toString())}
          />

          {/* Seller Information Card */}
          {product.seller && (
            <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-xl bg-brand-50 overflow-hidden border border-brand-200 shrink-0">
                  <Image
                    src={product.seller.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'}
                    alt={product.seller.shopName}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Sold by</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-700" />
                  </div>
                  <Link
                    href={`/sellers/${product.seller.slug}`}
                    className="text-sm font-bold text-gray-900 hover:text-brand-700 hover:underline block truncate"
                  >
                    {product.seller.shopName}
                  </Link>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    {sellerLocation}
                  </p>
                </div>
              </div>

              <Link
                href={`/sellers/${product.seller.slug}`}
                className="group/badge inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-brand-600/70 dark:border-emerald-500/60 bg-brand-50/50 dark:bg-emerald-950/40 text-brand-800 dark:text-emerald-300 hover:bg-brand-700 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white hover:border-brand-700 dark:hover:border-emerald-600 shadow-sm hover:shadow-md active:scale-95 transition-all duration-150 shrink-0"
              >
                <Store className="w-3.5 h-3.5 text-brand-600 dark:text-emerald-400 group-hover/badge:text-white transition-colors shrink-0" />
                <span>View Shop</span>
                <ChevronRight className="w-3 h-3 text-brand-600/70 dark:text-emerald-400/70 group-hover/badge:text-white group-hover/badge:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description || 'Authentic Sri Lankan village product with traditional preparation.'}
            </p>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
              <Truck className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
              <span>Islandwide Delivery</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
              <ShieldCheck className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
              <span>100% Authentic Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <section className="pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Verified Customer Reviews</h2>
            <p className="text-xs text-gray-500 mt-1">
              Only verified purchasers who received this product can submit reviews.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold text-gray-900">{product.averageRating || '0.0'}</div>
            <div>
              <RatingStars rating={product.averageRating || 0} size="sm" showNumber={false} />
              <p className="text-xs text-gray-500">{product.reviewCount} total ratings</p>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Distribution */}
        {product.reviewCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-200 mb-8">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = (product.ratingBreakdown as Record<number, number>)?.[stars] || 0;
                const percent = product.reviewCount > 0 ? (count / product.reviewCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 text-gray-600 font-medium">{stars} Stars</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="w-8 text-right text-gray-500 font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        {product.reviews.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-xs text-gray-500">
            No customer reviews yet for this product. Be the first verified purchaser to review!
          </div>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((rev: any) => (
              <div key={rev.id} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs">
                      {rev.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{rev.user?.name}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Purchase
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <RatingStars rating={rev.rating} size="sm" showNumber={false} />
                    <span className="text-[11px] text-gray-400 mt-1 block">{formatDate(rev.createdAt)}</span>
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed pt-1">
                    {rev.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Related Products in {product.category?.name}</h2>
            <Link
              href={`/products?category=${product.category?.slug}`}
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              View More
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((rel: any) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
