import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Village Product Categories</h1>
        <p className="text-sm text-gray-500 mt-2">
          Explore curated traditional categories directly from rural producers across Sri Lanka.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {serialized.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-brand-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
              <Image
                src={cat.imageUrl || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80'}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] bg-brand-700/80 px-2.5 py-0.5 rounded-full font-medium backdrop-blur-sm">
                  {cat._count?.products || 0} Products
                </span>
                <h2 className="text-lg font-bold group-hover:text-amber-300 transition mt-1">{cat.name}</h2>
              </div>
            </div>
            <div className="p-4 bg-white">
              <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
