'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight, Store, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface WishlistViewProps {
  initialItems: any[];
}

export function WishlistView({ initialItems }: WishlistViewProps) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [movedSuccessId, setMovedSuccessId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    try {
      setRemovingId(productId);
      const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        const nextItems = items.filter((it) => it.product.id !== productId && it.productId !== productId);
        setItems(nextItems);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wishlist-updated', {
              detail: { count: nextItems.length },
            })
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (product: any) => {
    try {
      setMovingId(product.id);
      // 1. Add to cart
      const cartRes = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('cart-updated', {
              detail: { count: cartData.cartCount },
            })
          );
        }

        // 2. Remove from wishlist
        await fetch(`/api/wishlist/${product.id}`, { method: 'DELETE' });
        const nextItems = items.filter((it) => it.product.id !== product.id && it.productId !== product.id);
        setItems(nextItems);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wishlist-updated', {
              detail: { count: nextItems.length },
            })
          );
        }

        setMovedSuccessId(product.id);
        setTimeout(() => setMovedSuccessId(null), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMovingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
          Save your favorite traditional foods, honey, and handmade village crafts to purchase later.
        </p>
        <Link href="/products" className="inline-block mt-6">
          <Button size="md" className="gap-2">
            Discover Products <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium">
          Showing <strong>{items.length}</strong> saved {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => {
          const product = item.product || item;
          const primaryImage =
            product.productImages?.find((img: any) => img.isPrimary)?.imageUrl ||
            product.productImages?.[0]?.imageUrl ||
            'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';

          return (
            <div
              key={item.id || product.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* Product Photo */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <Link href={`/products/${product.slug}`} className="block w-full h-full">
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => handleRemove(product.id)}
                  disabled={removingId === product.id}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-400 hover:text-red-600 rounded-full shadow-sm backdrop-blur-sm transition"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {product.seller && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1 truncate">
                      <Store className="w-3 h-3 text-brand-600 shrink-0" />
                      <span className="font-semibold text-brand-800 truncate">{product.seller.shopName}</span>
                    </div>
                  )}

                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-brand-700 transition">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="text-base font-extrabold text-gray-900 mt-2">
                    {formatPrice(product.price)}
                  </div>
                </div>

                {/* Move to Cart Action */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleMoveToCart(product)}
                    isLoading={movingId === product.id}
                    disabled={product.stock <= 0}
                    className="w-full gap-1.5 text-xs font-bold"
                  >
                    {movedSuccessId === product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Moved to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
