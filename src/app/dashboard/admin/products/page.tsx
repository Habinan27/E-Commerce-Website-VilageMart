import React from 'react';
import type { Metadata } from 'next';
import { AdminProductsTable } from '@/components/dashboard/admin-products-table';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth';
import { serializeBigInt } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'All Products - Admin',
};

export default async function AdminProductsPage() {
  await requireRole('ADMIN');

  const products = await prisma.product.findMany({
    include: {
      category: true,
      seller: { include: { location: true } },
      productImages: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = serializeBigInt(products);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Marketplace Product Catalog</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Review, moderate, toggle status, and inspect all listed village products across Sri Lankan sellers.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-150">
        <AdminProductsTable initialProducts={serialized} />
      </div>
    </div>
  );
}
