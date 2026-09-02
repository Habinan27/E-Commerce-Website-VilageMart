import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Layers, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth';
import { serializeBigInt, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Categories - Admin',
};

export default async function AdminCategoriesPage() {
  await requireRole('ADMIN');

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { id: 'asc' },
  });

  const serialized = serializeBigInt(categories);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Product Categories</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Village and rural product categories, metadata, and listing distribution.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-150">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Slug URL</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Total Products</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
              {serialized.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 overflow-hidden border border-gray-200 dark:border-slate-700 shrink-0">
                        <Image
                          src={
                            cat.imageUrl ||
                            'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&auto=format&fit=crop&q=80'
                          }
                          alt={cat.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-slate-100">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-500 dark:text-slate-400">/categories/{cat.slug}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300 max-w-xs truncate">{cat.description}</td>
                  <td className="px-6 py-4 font-bold text-brand-800 dark:text-emerald-400">{cat._count.products}</td>
                  <td className="px-6 py-4">
                    <Badge variant={cat.status ? 'success' : 'neutral'}>{cat.status ? 'Active' : 'Disabled'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">{formatDate(cat.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
