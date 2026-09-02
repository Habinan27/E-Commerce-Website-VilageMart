import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'neutral', size = 'md', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={cn('inline-flex items-center rounded-full border', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
