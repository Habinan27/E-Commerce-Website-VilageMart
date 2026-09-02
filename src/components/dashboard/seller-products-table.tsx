'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Edit, Trash2, CheckCircle2, AlertCircle, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

interface SellerProductsTableProps {
  initialProducts: any[];
}

export function SellerProductsTable({ initialProducts }: SellerProductsTableProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      setProducts((prev) => prev.filter((p) => p.id.toString() !== id.toString()));
      setActionMessage({ text: 'Product deleted or deactivated successfully.', type: 'success' });
      setDeleteConfirmId(null);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Error deleting product', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update product status');
      }

      setProducts((prev) =>
        prev.map((p) => (p.id.toString() === id.toString() ? { ...p, status: nextStatus } : p))
      );
      setActionMessage({ text: `Product status updated to ${nextStatus}`, type: 'success' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to update status', type: 'error' });
    }
  };

  if (products.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-gray-500">
        <p className="font-bold text-gray-900 text-sm">No products in your catalog yet</p>
        <p className="mt-1">Add your authentic village products to start receiving orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Delete Product</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Are you sure you want to delete this product? It will no longer be visible to buyers on the store.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                isLoading={isDeleting}
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Orders</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
            {products.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 overflow-hidden border border-gray-200 dark:border-slate-700 shrink-0">
                      <Image
                        src={
                          p.productImages?.[0]?.imageUrl ||
                          'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-bold text-gray-900 dark:text-slate-100 hover:text-brand-700 dark:hover:text-emerald-400 line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      <span className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">{p.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-200">{p.category?.name}</td>
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100">{formatPrice(p.price)}</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${p.stock <= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {p.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-slate-300">{p._count?.orderItems || 0} sold</td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(p.id.toString(), p.status)}
                    title="Click to toggle status"
                    className="flex items-center gap-1.5 hover:opacity-80 transition"
                  >
                    <Badge variant={p.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                      {p.status}
                    </Badge>
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Product */}
                    <Link href={`/products/${p.slug}`}>
                      <Button size="sm" variant="outline" className="text-xs py-1 px-2.5 gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </Link>

                    {/* Edit Product */}
                    <Link href={`/dashboard/seller/products/${p.id}/edit`}>
                      <Button size="sm" variant="outline" className="text-xs py-1 px-2.5 gap-1 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40">
                        <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Edit
                      </Button>
                    </Link>

                    {/* Delete Product */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirmId(p.id.toString())}
                      className="text-xs py-1 px-2.5 gap-1 border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" /> Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
