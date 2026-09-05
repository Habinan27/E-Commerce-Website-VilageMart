'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, MapPin, Check, AlertCircle } from 'lucide-react';
import { RatingStars } from '@/components/ui/rating-stars';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    stock: number;
    averageRating?: number;
    reviewCount?: number;
    category?: { name: string; slug: string };
    seller?: {
      shopName: string;
      slug: string;
      location?: { name: string; parent?: { name: string } };
    };
    productImages?: { imageUrl: string; isPrimary: boolean }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const primaryImage =
    product.productImages?.find((img) => img.isPrimary)?.imageUrl ||
    product.productImages?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';

  const sellerLocation = product.seller?.location
    ? `${product.seller.location.name}${product.seller.location.parent ? `, ${product.seller.location.parent.name}` : ''}`
    : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    try {
      setIsAdding(true);
      setIsAdded(true);

      // 1. Instant Optimistic Live Badge Increment (0ms delay!) & Toast Notification
      const currentStored = typeof window !== 'undefined' ? parseInt(localStorage.getItem('vm_cart_count') || '0', 10) : 0;
      const optimisticCount = currentStored + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('vm_cart_count', optimisticCount.toString());
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: optimisticCount } }));
        window.dispatchEvent(
          new CustomEvent('cart-item-added', {
            detail: {
              productId: product.id,
              productName: product.name,
              productImage: primaryImage,
              price: product.price,
              quantity: 1,
              count: optimisticCount,
            },
          })
        );
      }

      // 2. Server Sync
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (res.ok) {
        const data = await res.json();
        // Exact authoritative server count
        if (typeof window !== 'undefined' && data.cartCount !== undefined) {
          localStorage.setItem('vm_cart_count', data.cartCount.toString());
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: data.cartCount } }));
        }
        router.refresh();
        setTimeout(() => setIsAdded(false), 2000);
      } else {
        // Revert on error
        if (typeof window !== 'undefined') {
          localStorage.setItem('vm_cart_count', currentStored.toString());
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: currentStored } }));
        }
        setIsAdded(false);
      }
    } catch (error) {
      console.error(error);
      setIsAdded(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTogglingWishlist) return;

    try {
      setIsTogglingWishlist(true);
      const nextState = !isWishlisted;
      setIsWishlisted(nextState);

      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.isWishlisted);
        // Dispatch real-time wishlist update across app
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wishlist-updated', {
              detail: { count: data.count },
            })
          );
        }
      } else {
        // Revert on error (e.g. not logged in)
        setIsWishlisted(!nextState);
      }
    } catch (err) {
      setIsWishlisted(!isWishlisted);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-300 dark:hover:border-emerald-700/60 transition-all duration-300 ease-out flex flex-col justify-between">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-gray-50 dark:bg-slate-800/80 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md hover:scale-110 active:scale-90 transition-all duration-200 ease-out shadow-sm ${
            isWishlisted
              ? 'bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400'
              : 'bg-white/80 dark:bg-slate-900/80 text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-red-500'
          }`}
          title="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Stock / Category Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.category && (
            <span className="bg-brand-900/85 backdrop-blur-sm text-brand-100 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm">
              {product.category.name}
            </span>
          )}
          {product.stock <= 0 ? (
            <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Out of Stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="bg-amber-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller & Location */}
          {product.seller && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400 mb-1.5 truncate">
              <Link
                href={`/sellers/${product.seller.slug}`}
                className="font-semibold text-brand-800 dark:text-emerald-400 hover:underline truncate transition-colors duration-150"
              >
                {product.seller.shopName}
              </Link>
              {sellerLocation && (
                <>
                  <span className="text-gray-300 dark:text-slate-600">•</span>
                  <span className="flex items-center gap-0.5 text-gray-500 dark:text-slate-400 truncate">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    {sellerLocation}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block hover:text-brand-700 dark:hover:text-emerald-400 transition-colors duration-150">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 line-clamp-2 leading-snug tracking-tight">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Rating & Action */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-end justify-between gap-2">
          <div>
            <div className="text-xs text-gray-400 font-medium">Price</div>
            <div className="text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight">
              {formatPrice(product.price)}
            </div>
            {product.averageRating !== undefined && product.averageRating > 0 && (
              <RatingStars
                rating={product.averageRating}
                reviewCount={product.reviewCount}
                size="sm"
                className="mt-0.5"
              />
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAdding}
            className={`p-2.5 rounded-xl transition-all duration-200 ease-out active:scale-90 flex items-center justify-center shrink-0 shadow-sm ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : product.stock <= 0
                ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                : 'bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white shadow-brand-900/20'
            }`}
            title="Add to cart"
          >
            {isAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
