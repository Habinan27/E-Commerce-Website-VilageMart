'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  Store,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/modal';
import { formatPrice } from '@/lib/utils';

interface CartViewProps {
  initialCart: {
    id: string;
    items: any[];
    sellerGroups: {
      sellerId: string;
      shopName: string;
      slug: string;
      location: string;
      items: any[];
      subtotal: number;
    }[];
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    itemCount: number;
  };
}

export function CartView({ initialCart }: CartViewProps) {
  const router = useRouter();
  const [cart, setCart] = useState(initialCart);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialCart.items.map((it) => it.id)
  );
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  // Real-time live cart sync when items are added or updated without refresh
  useEffect(() => {
    const handleSyncLiveCart = async () => {
      try {
        const res = await fetch('/api/cart', { cache: 'no-store' });
        if (res.ok) {
          const freshCart = await res.json();
          setCart(freshCart);
          const freshIds = (freshCart.items || []).map((it: any) => it.id);
          setSelectedIds((prev) => {
            const combined = Array.from(new Set([...prev, ...freshIds]));
            return combined.length > 0 ? combined : freshIds;
          });
        }
      } catch (e) {
        // ignore
      }
    };

    // Run immediately on mount
    handleSyncLiveCart();

    window.addEventListener('cart-updated', handleSyncLiveCart);
    window.addEventListener('cart-item-added', handleSyncLiveCart);

    return () => {
      window.removeEventListener('cart-updated', handleSyncLiveCart);
      window.removeEventListener('cart-item-added', handleSyncLiveCart);
    };
  }, []);

  // Update if initialCart prop changes
  useEffect(() => {
    if (initialCart) {
      setCart(initialCart);
      if (initialCart.items?.length > 0 && selectedIds.length === 0) {
        setSelectedIds(initialCart.items.map((it: any) => it.id));
      }
    }
  }, [initialCart]);

  // Sync selectedIds if items change
  const allItemIds = useMemo(() => cart.items.map((it) => it.id), [cart.items]);
  const isAllSelected = allItemIds.length > 0 && allItemIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allItemIds);
    }
  };

  const handleToggleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itId) => itId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleSellerGroup = (sellerItemIds: string[]) => {
    const allSellerItemsSelected = sellerItemIds.every((id) => selectedIds.includes(id));
    if (allSellerItemsSelected) {
      setSelectedIds(selectedIds.filter((id) => !sellerItemIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedIds, ...sellerItemIds]));
      setSelectedIds(merged);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQty: number) => {
    try {
      setLoadingItemId(cartItemId);
      const res = await fetch(`/api/cart/items/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCart(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vm_cart_count', updated.itemCount.toString());
          window.dispatchEvent(
            new CustomEvent('cart-updated', {
              detail: { count: updated.itemCount },
            })
          );
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      setLoadingItemId(cartItemId);
      const res = await fetch(`/api/cart/items/${cartItemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const updated = await res.json();
        setCart(updated);
        setSelectedIds(selectedIds.filter((id) => id !== cartItemId));
        if (typeof window !== 'undefined') {
          localStorage.setItem('vm_cart_count', updated.itemCount.toString());
          window.dispatchEvent(
            new CustomEvent('cart-updated', {
              detail: { count: updated.itemCount },
            })
          );
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleBatchRemoveSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsDeletingBatch(true);
      for (const id of selectedIds) {
        await fetch(`/api/cart/items/${id}`, { method: 'DELETE' });
      }

      const refreshRes = await fetch('/api/cart', { cache: 'no-store' });
      if (refreshRes.ok) {
        const updated = await refreshRes.json();
        setCart(updated);
        setSelectedIds([]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vm_cart_count', (updated.itemCount || 0).toString());
          window.dispatchEvent(
            new CustomEvent('cart-updated', {
              detail: { count: updated.itemCount || 0 },
            })
          );
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingBatch(false);
      setBatchDeleteModalOpen(false);
    }
  };

  // Selected Totals Calculation
  const selectedItems = useMemo(
    () => cart.items.filter((it) => selectedIds.includes(it.id)),
    [cart.items, selectedIds]
  );
  const selectedCount = useMemo(
    () => selectedItems.reduce((acc, it) => acc + it.quantity, 0),
    [selectedItems]
  );
  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((acc, it) => acc + Number(it.product.price) * it.quantity, 0),
    [selectedItems]
  );
  const selectedDeliveryFee = selectedItems.length > 0 ? 350 : 0;
  const selectedTotal = selectedSubtotal + selectedDeliveryFee;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-20 h-20 bg-brand-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-brand-700 dark:text-brand-400 mb-6 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Your Shopping Cart is Empty</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto">
          Explore genuine Sri Lankan village products directly from local farmers and artisans.
        </p>
        <Link href="/products" className="inline-block mt-6">
          <Button size="lg" className="gap-2 font-bold">
            Browse Authentic Products <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Select All Bar + Grouped by Seller */}
      <div className="lg:col-span-8 space-y-4">
        {/* Master Select All Toolbar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-slate-600 dark:bg-slate-900 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100">
              Select All ({cart.itemCount} items)
            </span>
          </label>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-slate-400 hidden sm:inline-block">
              {selectedIds.length} item(s) selected
            </span>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setBatchDeleteModalOpen(true)}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Selected
              </button>
            )}
          </div>
        </div>

        {/* Seller Shop Groups */}
        {cart.sellerGroups.map((group) => {
          const groupItemIds = group.items.map((it: any) => it.id);
          const isGroupAllSelected = groupItemIds.every((id: string) => selectedIds.includes(id));

          return (
            <div key={group.sellerId} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
              {/* Seller Shop Header */}
              <div className="bg-gray-50 dark:bg-slate-900/90 px-4 sm:px-6 py-3.5 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isGroupAllSelected}
                    onChange={() => handleToggleSellerGroup(groupItemIds)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-slate-600 dark:bg-slate-900 cursor-pointer"
                    title={`Select all items from ${group.shopName}`}
                  />
                  <Store className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
                  <Link
                    href={`/sellers/${group.slug}`}
                    className="text-sm font-bold text-gray-900 dark:text-slate-100 hover:text-brand-700 dark:hover:text-brand-400 hover:underline transition-colors"
                  >
                    {group.shopName}
                  </Link>
                  {group.location && (
                    <span className="text-xs text-gray-500 dark:text-slate-400 hidden sm:flex items-center gap-0.5 ml-2">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" /> {group.location}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Subtotal: {formatPrice(group.subtotal)}
                </div>
              </div>

              {/* Items inside this Seller Group */}
              <div className="divide-y divide-gray-100 dark:divide-slate-700/60 p-4 sm:p-6 space-y-4 sm:space-y-0">
                {group.items.map((item: any) => {
                  const isSelected = selectedIds.includes(item.id);
                  const productImg =
                    item.product.productImages?.[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=80';

                  return (
                    <div
                      key={item.id}
                      className={`sm:py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-150 rounded-xl p-2 sm:p-3 ${
                        isSelected ? 'bg-brand-50/20 dark:bg-slate-900/60' : 'opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        {/* Item Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectItem(item.id)}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-slate-600 dark:bg-slate-900 cursor-pointer shrink-0"
                        />

                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 dark:bg-slate-900 overflow-hidden border border-gray-200 dark:border-slate-700 shrink-0">
                          <Image
                            src={productImg}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>

                        {/* Details */}
                        <div>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-brand-700 dark:hover:text-brand-400 line-clamp-2 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{formatPrice(item.product.price)} each</p>
                          {item.product.stock < item.quantity && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Only {item.product.stock} available</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Selector & Line Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-7 sm:pl-0">
                        {/* Quantity Controller */}
                        <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-900">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || loadingItemId === item.id}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 transition text-gray-600 dark:text-slate-300 disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-800 dark:text-slate-100">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock || loadingItemId === item.id}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 transition text-gray-600 dark:text-slate-300 disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <div className="text-sm font-bold text-gray-900 dark:text-slate-100">
                            {formatPrice(Number(item.product.price) * item.quantity)}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loadingItemId === item.id}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Order Summary (Based on Selected Items) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm sticky top-24">
        <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 pb-4 border-b border-gray-100 dark:border-slate-700">Order Summary</h3>

        <div className="space-y-3 py-4 text-xs">
          <div className="flex justify-between text-gray-600 dark:text-slate-300">
            <span>Selected Items ({selectedCount} units)</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">{formatPrice(selectedSubtotal)}</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-slate-300">
            <span>Estimated Delivery Fee</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">{formatPrice(selectedDeliveryFee)}</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-slate-300">
            <span>Discounts</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">- Rs. 0.00</span>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center text-sm font-bold text-gray-900 dark:text-slate-100">
            <span>Total Amount</span>
            <span className="text-xl font-black text-brand-800 dark:text-emerald-400">{formatPrice(selectedTotal)}</span>
          </div>
        </div>

        {selectedIds.length === 0 && (
          <div className="mb-4 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-[11px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Please select at least one item with the checkbox to proceed to checkout.</span>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <Link
            href={selectedIds.length > 0 ? `/checkout?items=${selectedIds.join(',')}` : '#'}
            className={selectedIds.length === 0 ? 'pointer-events-none' : 'block w-full'}
          >
            <Button
              size="lg"
              disabled={selectedIds.length === 0}
              className="w-full gap-2 font-bold"
            >
              Proceed to Checkout ({selectedCount}) <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/products" className="block text-center text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-brand-700 dark:hover:text-brand-400 transition-colors">
            ← Continue Shopping
          </Link>
        </div>

        {/* Security / Quality guarantee */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Guaranteed authentic village items with direct seller support.</span>
        </div>
      </div>

      {/* Batch Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={batchDeleteModalOpen}
        onClose={() => setBatchDeleteModalOpen(false)}
        onConfirm={handleBatchRemoveSelected}
        title="Remove Selected Items"
        message={`Are you sure you want to remove ${selectedIds.length} selected item(s) from your shopping cart?`}
        confirmText="Yes, Remove Items"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeletingBatch}
      />
    </div>
  );
}
