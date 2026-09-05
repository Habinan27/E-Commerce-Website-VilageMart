import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden hover:shadow-md hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-200 ease-out', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-emerald-400 border border-brand-100 dark:border-slate-700/60 shadow-sm">{icon}</div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">{value}</h3>
          {trend && (
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                trend.isPositive ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>

        {description && <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{description}</p>}
      </CardContent>
    </Card>
  );
}
