import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SellerProductsTable } from '@/components/dashboard/seller-products-table';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth';
import { serializeBigInt } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Manage Products',
};

export default async function SellerProductsPage() {
  const session = await requireRole(['SELLER', 'ADMIN']);
  if (!session.sellerProfileId) return null;

  const products = await prisma.product.findMany({
    where: { sellerId: BigInt(session.sellerProfileId) },
    include: {
      category: true,
      productImages: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
      _count: { select: { orderItems: true, reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = serializeBigInt(products);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Products Management</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage your catalog, edit details, update stock, or remove products.</p>
        </div>

        <Link href="/dashboard/seller/products/create">
          <Button size="md" className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> Add Village Product
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-150">
        <SellerProductsTable initialProducts={serialized} />
      </div>
    </div>
  );
}
