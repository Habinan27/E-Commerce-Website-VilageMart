import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';
import { generateSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSeoMetadata({
  title: 'All Product Categories',
  description: 'Browse authentic Sri Lankan village product categories including traditional sweets, pure honey, organic rice, and handmade goods.',
  path: '/categories',
});

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { status: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const serialized = serializeBigInt(categories);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
          Village Product Categories
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
          Explore curated traditional categories directly from rural producers across Sri Lanka.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {serialized.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-400 dark:hover:border-emerald-600 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image Container with Smooth Scale on Hover */}
            <div className="relative aspect-[16/10] bg-gray-100 dark:bg-slate-800 overflow-hidden">
              <Image
                src={cat.imageUrl || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80'}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute top-3.5 right-3.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20 shadow-md">
                {cat._count?.products || 0} Products
              </div>
            </div>

            {/* Dedicated Info Box Below Image */}
            <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 bg-white dark:bg-slate-900">
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 group-hover:text-brand-700 dark:group-hover:text-emerald-400 transition-colors duration-150 leading-snug">
                  {cat.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {cat.description || 'Authentic rural Sri Lankan village products and specialties.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-700 dark:text-emerald-400">
                <span>View Products</span>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-brand-700 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
