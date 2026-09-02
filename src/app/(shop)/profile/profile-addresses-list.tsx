'use client';

import React, { useState } from 'react';
import { MapPin, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/modal';

interface ProfileAddressesListProps {
  initialAddresses: any[];
}

export function ProfileAddressesList({ initialAddresses }: ProfileAddressesListProps) {
  const [addresses, setAddresses] = useState<any[]>(initialAddresses || []);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!addressToDelete) return;
    const addrId = addressToDelete;
    setDeletingId(addrId);
    setError(null);
    try {
      const res = await fetch(`/api/user/addresses/${addrId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove address');
      }
      setAddresses((prev) => prev.filter((a) => a.id.toString() !== addrId));
    } catch (err: any) {
      setError(err.message || 'Failed to remove address');
    } finally {
      setDeletingId(null);
      setAddressToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {addresses.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-slate-400 py-4">No delivery addresses saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr: any) => {
            const addrId = addr.id.toString();
            return (
              <div
                key={addrId}
                className="p-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 space-y-1.5 text-xs text-gray-600 dark:text-slate-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-gray-900 dark:text-slate-100 mb-1">
                    <span className="truncate pr-2">{addr.name}</span>
                    <div className="flex items-center gap-2">
                      {addr.isDefault && (
                        <span className="text-[10px] bg-brand-100 dark:bg-emerald-950/60 text-brand-800 dark:text-emerald-300 border border-brand-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                          Default
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setAddressToDelete(addrId)}
                        disabled={deletingId === addrId}
                        title="Remove address"
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        {deletingId === addrId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-slate-400">{addr.phone}</p>
                  <p className="text-gray-700 dark:text-slate-200 mt-1">{addr.addressLine}</p>
                  <p className="font-semibold text-brand-800 dark:text-brand-400 mt-0.5">
                    {addr.location?.name}, {addr.location?.parent?.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Address Confirmation Modal */}
      <ConfirmModal
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Delivery Address"
        message="Are you sure you want to permanently remove this delivery address from your profile?"
        confirmText="Yes, Delete Address"
        cancelText="Cancel"
        type="danger"
        isLoading={!!deletingId}
      />
    </div>
  );
}
