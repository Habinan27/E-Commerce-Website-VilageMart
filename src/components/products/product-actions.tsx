'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, Heart, Check, Plus, Minus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductActionsProps {
  productId: string;
  stock: number;
  price: number;
  productName?: string;
  productImage?: string;
}

export function ProductActions({ productId, stock, price, productName, productImage }: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta;
    if (next >= 1 && next <= stock) {
      setQuantity(next);
    }
  };

  const handleAddToCart = async () => {
    if (stock <= 0) return;
    setIsAdding(true);
    setErrorMessage(null);
    setAddedSuccess(true);

    // 1. Instant Optimistic Live Badge Increment & Toast Notification
    const currentStored = typeof window !== 'undefined' ? parseInt(localStorage.getItem('vm_cart_count') || '0', 10) : 0;
    const optimisticCount = currentStored + quantity;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vm_cart_count', optimisticCount.toString());
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: optimisticCount } }));
      window.dispatchEvent(
        new CustomEvent('cart-item-added', {
          detail: {
            productId,
            productName: productName || 'Product',
            productImage,
            price,
            quantity,
            count: optimisticCount,
          },
        })
      );
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add item to cart');
      }

      if (typeof window !== 'undefined' && data.cartCount !== undefined) {
        localStorage.setItem('vm_cart_count', data.cartCount.toString());
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: data.cartCount } }));
      }
      router.refresh();
      setTimeout(() => setAddedSuccess(false), 3000);
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vm_cart_count', currentStored.toString());
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: currentStored } }));
      }
      setAddedSuccess(false);
      setErrorMessage(err.message || 'Please sign in to add items to cart');
      if (err.message?.includes('sign in') || err.message?.includes('unauthorized')) {
        setTimeout(() => router.push(`/login?callbackUrl=/products`), 1500);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (stock <= 0) return;
    setIsBuyingNow(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process checkout');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('cart-updated', {
            detail: { count: data.cartCount },
          })
        );
      }

      router.push('/checkout');
    } catch (err: any) {
      setErrorMessage(err.message || 'Please sign in to proceed to checkout');
      setTimeout(() => router.push(`/login?callbackUrl=/checkout`), 1500);
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (isTogglingWishlist) return;
    try {
      setIsTogglingWishlist(true);
      const nextState = !isWishlisted;
      setIsWishlisted(nextState);

      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.isWishlisted);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wishlist-updated', {
              detail: { count: data.count },
            })
          );
        }
      } else {
        setIsWishlisted(!nextState);
      }
    } catch (e) {
      setIsWishlisted(!isWishlisted);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  if (stock <= 0) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
        <p className="text-sm font-bold text-red-700">Currently Out of Stock</p>
        <p className="text-xs text-red-600 mt-0.5">
          This village product is temporarily sold out. Check back soon for fresh harvests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-gray-700">Quantity:</span>
        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="p-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center text-xs font-bold text-gray-900">{quantity}</span>
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= stock}
            className="p-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-xs text-gray-400">({stock} units available)</span>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6">
          <Button
            type="button"
            onClick={handleAddToCart}
            isLoading={isAdding}
            size="lg"
            variant="outline"
            className={`w-full gap-2 border-brand-600 text-brand-800 hover:bg-brand-50 font-bold ${
              addedSuccess ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : ''
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </>
            )}
          </Button>
        </div>

        <div className="sm:col-span-4">
          <Button
            type="button"
            onClick={handleBuyNow}
            isLoading={isBuyingNow}
            size="lg"
            className="w-full gap-2 font-bold shadow-md"
          >
            <Zap className="w-4 h-4 text-amber-300" /> Buy Now
          </Button>
        </div>

        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`w-full h-full min-h-[44px] rounded-xl border flex items-center justify-center transition shadow-sm ${
              isWishlisted
                ? 'border-red-300 bg-red-50 text-red-600'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-red-500'
            }`}
            title="Save product"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
