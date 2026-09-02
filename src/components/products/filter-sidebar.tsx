'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, RotateCcw, ChevronDown, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterSidebarProps {
  categories: { id: string; name: string; slug: string }[];
  locations: {
    id: string;
    name: string;
    slug: string;
    type: string;
    children?: {
      id: string;
      name: string;
      slug: string;
      children?: { id: string; name: string; slug: string }[];
    }[];
  }[];
}

export function FilterSidebar({ categories, locations }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentProvince = searchParams.get('province') || '';
  const currentDistrict = searchParams.get('district') || '';
  const currentCity = searchParams.get('city') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentRating = searchParams.get('minRating') || '';
  const currentInStock = searchParams.get('inStock') === 'true';

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  const updateFilters = (newParams: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset page to 1 when changing filters
    params.set('page', '1');

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ minPrice: minPrice || null, maxPrice: maxPrice || null });
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname);
  };

  return (
    <aside className="w-full lg:w-72 bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shrink-0 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
          <Filter className="w-4 h-4 text-brand-700" />
          Filter Products
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-medium text-gray-500 hover:text-brand-700 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Categories</h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-sm">
          <button
            onClick={() => updateFilters({ category: null })}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              !currentCategory ? 'bg-brand-50 text-brand-800 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateFilters({ category: isSelected ? null : cat.slug })}
                className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                  isSelected ? 'bg-brand-50 text-brand-800 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-700" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sri Lankan Location Hierarchy */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Location (Sri Lanka)</h4>
        <div className="space-y-3">
          {/* Province Selector */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Province</label>
            <select
              value={currentProvince}
              onChange={(e) =>
                updateFilters({
                  province: e.target.value || null,
                  district: null,
                  city: null,
                })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:bg-white focus:border-brand-500 outline-none"
            >
              <option value="">All Provinces</option>
              {locations.map((prov) => (
                <option key={prov.id} value={prov.slug}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector (if province chosen) */}
          {currentProvince && (
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">District</label>
              <select
                value={currentDistrict}
                onChange={(e) =>
                  updateFilters({
                    district: e.target.value || null,
                    city: null,
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:bg-white focus:border-brand-500 outline-none"
              >
                <option value="">All Districts</option>
                {locations
                  .find((p) => p.slug === currentProvince)
                  ?.children?.map((dist) => (
                    <option key={dist.id} value={dist.slug}>
                      {dist.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* City Selector (if district chosen) */}
          {currentDistrict && (
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">City / Village Area</label>
              <select
                value={currentCity}
                onChange={(e) => updateFilters({ city: e.target.value || null })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:bg-white focus:border-brand-500 outline-none"
              >
                <option value="">All Cities</option>
                {locations
                  .find((p) => p.slug === currentProvince)
                  ?.children?.find((d) => d.slug === currentDistrict)
                  ?.children?.map((city) => (
                    <option key={city.id} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Price Range (LKR) */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Price Range (Rs.)</h4>
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-brand-500"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-brand-500"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="w-full text-xs py-1">
            Apply Price
          </Button>
        </form>
      </div>

      {/* Minimum Rating */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Customer Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((stars) => {
            const isSelected = currentRating === stars.toString();
            return (
              <button
                key={stars}
                onClick={() => updateFilters({ minRating: isSelected ? null : stars.toString() })}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                  isSelected ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < stars ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  <span>{stars} Stars & Above</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="pt-4 border-t border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : null })}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </aside>
  );
}
