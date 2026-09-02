import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
}

export function RatingStars({
  rating,
  max = 5,
  size = 'md',
  showNumber = true,
  reviewCount,
  className,
}: RatingStarsProps) {
  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              className={cn(
                starSizes[size],
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                  ? 'fill-amber-200 text-amber-400'
                  : 'text-gray-300 fill-gray-100'
              )}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className={cn('font-semibold text-gray-800 ml-1', textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={cn('text-gray-500', textSizes[size])}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
