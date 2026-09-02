import React from 'react';
import type { Metadata } from 'next';
import { FilterSidebar } from '@/components/products/filter-sidebar';
import { ProductCard } from '@/components/products/product-card';
import { ProductService } from '@/lib/services/product-service';
import { LocationService } from '@/lib/services/location-service';
import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';
import { generateSeoMetadata } from '@/lib/seo';
import Link from 'next/link';

interface ProductsPageProps {
  searchParams: {
    query?: string;
    category?: string;
    province?: string;
    district?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  };
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const query = searchParams.query;
  const category = searchParams.category;

  let title = 'All Village Products';
  if (query) title = `Search results for "${query}"`;
  else if (category) title = `Products in ${category.replace(/-/g, ' ')}`;

  return generateSeoMetadata({
    title,
    description: `Discover and buy verified rural Sri Lankan village products with fast islandwide delivery.`,
    path: '/products',
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const minRating = searchParams.minRating ? parseFloat(searchParams.minRating) : undefined;
  const inStock = searchParams.inStock === 'true';

  const [productsData, categories, locationsHierarchy] = await Promise.all([
    ProductService.getProducts({
      query: searchParams.query,
      category: searchParams.category,
      province: searchParams.province,
      district: searchParams.district,
      city: searchParams.city,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sort: (searchParams.sort as any) || 'newest',
      page,
      limit: 12,
    }),
    prisma.category.findMany({
      where: { status: true },
      orderBy: { name: 'asc' },
    }),
    LocationService.getFullHierarchy(),
  ]);

  const serializedCategories = serializeBigInt(categories);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {searchParams.query ? (
              <span>
                Search Results for &ldquo;<span className="text-brand-700">{searchParams.query}</span>&rdquo;
              </span>
            ) : searchParams.category ? (
              <span className="capitalize">{searchParams.category.replace(/-/g, ' ')}</span>
            ) : (
              'All Authentic Village Products'
            )}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Showing {productsData.pagination.total} genuine items from verified Sri Lankan sellers
          </p>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Product Grid */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left Filter Sidebar */}
        <FilterSidebar categories={serializedCategories} locations={locationsHierarchy} />

        {/* Right Product Grid */}
        <div className="flex-1 w-full">
          {productsData.data.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <h3 className="text-lg font-bold text-gray-900">No products matched your search criteria</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Try adjusting your filters, selecting a different location, or clearing search keywords.
              </p>
              <Link
                href="/products"
                className="inline-block mt-4 text-xs font-semibold text-brand-700 bg-brand-50 px-4 py-2 rounded-lg hover:bg-brand-100 transition"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsData.data.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {productsData.pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              {Array.from({ length: productsData.pagination.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === page;
                const params = new URLSearchParams(searchParams as any);
                params.set('page', pageNum.toString());

                return (
                  <Link
                    key={pageNum}
                    href={`/products?${params.toString()}`}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-brand-700 text-white shadow'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
