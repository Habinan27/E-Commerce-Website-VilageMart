'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  DollarSign,
  Star,
  Users,
  Layers,
  Settings,
  ShieldCheck,
  Megaphone,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: 'SELLER' | 'ADMIN';
  shopName?: string | null;
}

export function DashboardSidebar({ role, shopName }: SidebarProps) {
  const pathname = usePathname();

  const sellerLinks = [
    { label: 'Dashboard', href: '/dashboard/seller', icon: LayoutDashboard },
    { label: 'My Products', href: '/dashboard/seller/products', icon: Package },
    { label: 'Customer Orders', href: '/dashboard/seller/orders', icon: ShoppingBag },
    { label: 'My Earnings', href: '/dashboard/seller/earnings', icon: DollarSign },
    { label: 'Customer Reviews', href: '/dashboard/seller/reviews', icon: Star },
    { label: 'Shop Announcement', href: '/dashboard/seller/announcements', icon: Megaphone },
    { label: 'Shop Settings', href: '/dashboard/seller/profile', icon: Settings },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Seller Sales & Income', href: '/dashboard/admin/seller-income', icon: TrendingUp },
    { label: 'Approve Sellers', href: '/dashboard/admin/sellers', icon: Store },
    { label: 'Customers', href: '/dashboard/admin/customers', icon: Users },
    { label: 'All Orders', href: '/dashboard/admin/orders', icon: ShoppingBag },
    { label: 'All Products', href: '/dashboard/admin/products', icon: Package },
    { label: 'Categories', href: '/dashboard/admin/categories', icon: Layers },
    { label: 'Moderate Reviews', href: '/dashboard/admin/reviews', icon: Star },
    { label: 'Announcements / Marquee', href: '/dashboard/admin/announcements', icon: Megaphone },
  ];

  const links = role === 'ADMIN' ? adminLinks : sellerLinks;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 flex flex-col shrink-0 transition-colors duration-150">
      <div>
        <div className="px-3 py-2 mb-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
            {role === 'ADMIN' ? 'Admin Portal' : 'Seller Portal'}
          </p>
          <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate mt-0.5">
            {role === 'ADMIN' ? 'OoruMart Admin' : shopName || 'My Shop'}
          </h2>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 ease-out select-none border border-transparent',
                  isActive
                    ? 'bg-brand-50 dark:bg-emerald-950/80 text-brand-800 dark:text-emerald-200 border-brand-200 dark:border-emerald-700/70 shadow-sm'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-emerald-300 hover:border-gray-200 dark:hover:border-slate-700/80'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors duration-150 ease-out',
                    isActive
                      ? 'text-brand-700 dark:text-emerald-400'
                      : 'text-gray-400 dark:text-slate-400 group-hover:text-gray-800 dark:group-hover:text-emerald-300'
                  )}
                />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
