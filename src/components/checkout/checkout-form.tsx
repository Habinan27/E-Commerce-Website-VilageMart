'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, CreditCard, Banknote, ShieldCheck, CheckCircle2, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/modal';
import { formatPrice } from '@/lib/utils';

interface CheckoutFormProps {
  cart: any;
  savedAddresses: any[];
  locations: any[];
}

export function CheckoutForm({ cart, savedAddresses, locations }: CheckoutFormProps) {
  const router = useRouter();

  const [addressesList, setAddressesList] = useState<any[]>(savedAddresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.find((a) => a.isDefault)?.id?.toString() || savedAddresses[0]?.id?.toString() || 'new'
  );
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Address Form fields
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    const addrId = addressToDelete;
    setDeletingAddressId(addrId);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/user/addresses/${addrId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove address');
      }
      const updated = addressesList.filter((a) => a.id.toString() !== addrId);
      setAddressesList(updated);
      if (selectedAddressId === addrId) {
        setSelectedAddressId(updated[0]?.id?.toString() || 'new');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove address');
    } finally {
      setDeletingAddressId(null);
      setAddressToDelete(null);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let finalAddressId = selectedAddressId;

      if (selectedAddressId === 'new') {
        if (!newName || !newPhone || !newAddressLine || !selectedCityId) {
          throw new Error('Please fill in all address details including city selection');
        }

        const addressRes = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newName,
            phone: newPhone,
            addressLine: newAddressLine,
            locationId: selectedCityId,
          }),
        });

        if (!addressRes.ok) {
          const err = await addressRes.json();
          throw new Error(err.error || 'Failed to save address');
        }

        const createdAddr = await addressRes.json();
        finalAddressId = createdAddr.id.toString();
      }

      // Checkout order
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: finalAddressId,
          paymentMethod,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process checkout');
      }

      router.push(`/orders/${data.id}?placed=true`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during order checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Address & Payment Selection */}
      <div className="lg:col-span-8 space-y-6">
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Delivery Address Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-slate-700 mb-6">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-emerald-950 text-brand-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Delivery Address</h3>
          </div>

          <div className="space-y-3">
            {addressesList.map((addr) => {
              const addrId = addr.id.toString();
              const isSelected = selectedAddressId === addrId;
              return (
                <div
                  key={addrId}
                  onClick={() => setSelectedAddressId(addrId)}
                  className={`flex items-start justify-between gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-slate-900/80 dark:border-brand-500'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="radio"
                      name="address"
                      value={addrId}
                      checked={isSelected}
                      onChange={() => setSelectedAddressId(addrId)}
                      className="mt-1 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 dark:text-slate-100">{addr.name}</span>
                        <span className="text-gray-500 dark:text-slate-400 font-medium">{addr.phone}</span>
                        {addr.isDefault && (
                          <span className="bg-brand-100 dark:bg-emerald-950/60 text-brand-800 dark:text-emerald-300 border border-brand-200 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-slate-300 mt-1">{addr.addressLine}</p>
                      <p className="text-gray-500 dark:text-slate-400 mt-0.5 font-medium">
                        {addr.location?.name}, {addr.location?.parent?.name}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddressToDelete(addrId);
                    }}
                    disabled={deletingAddressId === addrId}
                    title="Remove address"
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                  >
                    {deletingAddressId === addrId ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}

            <div
              onClick={() => setSelectedAddressId('new')}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                selectedAddressId === 'new'
                  ? 'border-brand-600 bg-brand-50/40 dark:bg-slate-900/80 dark:border-brand-500'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="address"
                value="new"
                checked={selectedAddressId === 'new'}
                onChange={() => setSelectedAddressId('new')}
                className="mt-1 text-brand-600 focus:ring-brand-500"
              />
              <div className="text-xs font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                Add a New Delivery Address
              </div>
            </div>
          </div>

          {selectedAddressId === 'new' && (
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Name"
                  placeholder="e.g. Kavitha Senthilvel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="e.g. 077 123 4567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Street Address / House No."
                placeholder="e.g. No. 45, Temple Road"
                value={newAddressLine}
                onChange={(e) => setNewAddressLine(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Province</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setSelectedDistrict('');
                      setSelectedCityId('');
                    }}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-brand-500 outline-none"
                  >
                    <option value="">Select Province</option>
                    {locations.map((p: any) => (
                      <option key={p.id} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedCityId('');
                    }}
                    disabled={!selectedProvince}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-brand-500 outline-none disabled:bg-gray-50"
                  >
                    <option value="">Select District</option>
                    {locations
                      .find((p: any) => p.slug === selectedProvince)
                      ?.children?.map((d: any) => (
                        <option key={d.id} value={d.slug}>
                          {d.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">City / Town</label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    disabled={!selectedDistrict}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-brand-500 outline-none disabled:bg-gray-50"
                  >
                    <option value="">Select City</option>
                    {locations
                      .find((p: any) => p.slug === selectedProvince)
                      ?.children?.find((d: any) => d.slug === selectedDistrict)
                      ?.children?.map((city: any) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Payment Method Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-slate-700 mb-6">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-emerald-950 text-brand-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Select Payment Method</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                paymentMethod === 'COD'
                  ? 'border-brand-600 bg-brand-50/40 dark:bg-slate-900/80 dark:border-brand-500'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="mt-1 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-brand-700 dark:text-brand-400" />
                  <span className="font-bold text-xs text-gray-900 dark:text-slate-100">Cash on Delivery (COD)</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Pay with cash upon package receipt anywhere in Sri Lanka.</p>
              </div>
            </label>

            <label
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                paymentMethod === 'ONLINE'
                  ? 'border-brand-600 bg-brand-50/40 dark:bg-slate-900/80 dark:border-brand-500'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                checked={paymentMethod === 'ONLINE'}
                onChange={() => setPaymentMethod('ONLINE')}
                className="mt-1 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-xs text-gray-900 dark:text-slate-100">PayHere Gateway (Online)</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Visa, Mastercard, eZCash, Genie, and Sri Lankan bank cards.</p>
              </div>
            </label>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
              Order Notes / Delivery Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Call before delivery, landmark near temple..."
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-gray-900 dark:text-slate-100 focus:border-brand-500 outline-none transition-colors"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Right Column: Checkout Summary & Multi-Vendor Breakdown */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm sticky top-24">
        <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 pb-4 border-b border-gray-100 dark:border-slate-700">Review & Place Order</h3>

        <div className="py-4 space-y-4 max-h-60 overflow-y-auto pr-1">
          {cart.sellerGroups?.map((group: any) => (
            <div key={group.sellerId} className="border-b border-gray-100 dark:border-slate-700 pb-3 last:border-b-0">
              <p className="text-[11px] font-bold text-brand-800 dark:text-brand-400 flex items-center gap-1 mb-1.5">
                🏪 {group.shopName}
              </p>
              <div className="space-y-1.5">
                {group.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-600 dark:text-slate-300">
                    <span className="truncate max-w-[180px]">
                      {item.product.name} <span className="text-gray-400">×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {formatPrice(Number(item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2.5 py-4 border-t border-gray-100 dark:border-slate-700 text-xs">
          <div className="flex justify-between text-gray-600 dark:text-slate-300">
            <span>Items Total</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">{formatPrice(cart.subtotal)}</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-slate-300">
            <span>Flat Delivery Fee</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">{formatPrice(cart.deliveryFee)}</span>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center text-sm font-bold text-gray-900 dark:text-slate-100">
            <span>Grand Total</span>
            <span className="text-lg text-brand-800 dark:text-brand-400">{formatPrice(cart.totalAmount)}</span>
          </div>
        </div>

        <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full mt-4">
          Confirm Order • {formatPrice(cart.totalAmount)}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Safe & Encrypted Checkout</span>
        </div>
      </div>

      {/* Delete Address Confirmation Modal */}
      <ConfirmModal
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleDeleteAddress}
        title="Delete Delivery Address"
        message="Are you sure you want to permanently remove this delivery address from your saved addresses?"
        confirmText="Yes, Delete Address"
        cancelText="Keep Address"
        type="danger"
        isLoading={!!deletingAddressId}
      />
    </form>
  );
}
