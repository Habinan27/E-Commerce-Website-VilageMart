'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';

export default function AdminEditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [images, setImages] = useState<string[]>([]);
  const [sellerInfo, setSellerInfo] = useState<{ shopName: string; location?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [catsRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/products/${params.id}`),
        ]);

        if (catsRes.ok) {
          const cats = await catsRes.json();
          setCategories(cats);
        }

        if (prodRes.ok) {
          const prod = await prodRes.json();
          setName(prod.name || '');
          setCategoryId(prod.categoryId?.toString() || prod.category?.id?.toString() || '');
          setPrice(prod.price?.toString() || '');
          setStock(prod.stock?.toString() || '0');
          setMinStock(prod.minStock?.toString() || '0');
          setDescription(prod.description || '');
          setStatus(prod.status || 'ACTIVE');
          if (prod.seller) {
            setSellerInfo({
              shopName: prod.seller.shopName,
              location: prod.seller.location?.name,
            });
          }
          if (prod.productImages && prod.productImages.length > 0) {
            setImages(prod.productImages.map((img: any) => img.imageUrl));
          }
        } else {
          setError('Product not found or access denied.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (images.length === 0) {
        throw new Error('Please upload at least one product photo.');
      }

      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          categoryId,
          price: parseFloat(price),
          stock: parseInt(stock),
          minStock: parseInt(minStock) || 0,
          description: description.trim() || undefined,
          images,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      setSuccess('Product successfully updated by Admin!');
      setTimeout(() => {
        router.push('/dashboard/admin/products');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Update error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-gray-500">
        Loading product information...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <Link
          href="/dashboard/admin/products"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-brand-700 dark:hover:text-emerald-400 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Products
        </Link>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Admin: Edit Product</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Update product listing information, change photos, adjust prices, stock, or moderation status.
        </p>
      </div>

      {sellerInfo && (
        <div className="bg-brand-50/70 dark:bg-emerald-950/40 border border-brand-200 dark:border-emerald-800/60 rounded-2xl p-4 flex items-center gap-3 text-xs transition-colors duration-150">
          <Store className="w-4 h-4 text-brand-700 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="text-gray-500 dark:text-slate-400">Listed by Seller Shop:</span>{' '}
            <strong className="text-brand-950 dark:text-emerald-300 font-bold">{sellerInfo.shopName}</strong>
            {sellerInfo.location && <span className="text-gray-500 dark:text-slate-400"> ({sellerInfo.location})</span>}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm transition-colors duration-150">
        {/* Product Images File Upload */}
        <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
          <ImageUpload
            label="Product Photos (Upload from Device)"
            value={images}
            onChange={setImages}
            maxFiles={6}
          />
        </div>

        {/* Product Name */}
        <Input
          label="Product Name (Tamil / English / Sinhala)"
          placeholder="Enter product title in Tamil, English, or Sinhala"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Category, Price & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Product Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-slate-100 focus:border-brand-500 dark:focus:border-emerald-500 outline-none transition-colors"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Price (Rs. / LKR)"
            type="number"
            step="0.01"
            placeholder="850.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Product Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-slate-100 focus:border-brand-500 dark:focus:border-emerald-500 outline-none transition-colors"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>

        {/* Stock & Minimum Stock Alert */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Available Stock Quantity"
            type="number"
            placeholder="50"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
          <Input
            label="Low Stock Threshold Alert"
            type="number"
            placeholder="5"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
            Product Description (Tamil / English / Sinhala)
          </label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain harvesting methods, village origin, health benefits, pure ingredients..."
            className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl p-3 text-xs text-gray-900 dark:text-slate-100 focus:border-brand-500 dark:focus:border-emerald-500 outline-none transition-colors"
          ></textarea>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
          <Link href="/dashboard/admin/products">
            <Button type="button" variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="md" isLoading={isSubmitting}>
            Save Changes as Admin
          </Button>
        </div>
      </form>
    </div>
  );
}
