'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: { id?: string; imageUrl: string; altText?: string | null; isPrimary?: boolean }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const defaultList =
    images.length > 0
      ? images
      : [{ imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80' }];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnail Bar */}
      {defaultList.length > 1 && (
        <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px] shrink-0 scrollbar-none">
          {defaultList.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition ${
                activeIndex === idx ? 'border-brand-700 shadow-md ring-2 ring-brand-200' : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img.imageUrl}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Stage */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
        <Image
          src={defaultList[activeIndex]?.imageUrl || defaultList[0].imageUrl}
          alt={productName}
          fill
          priority
          className="object-cover transition-all duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}
