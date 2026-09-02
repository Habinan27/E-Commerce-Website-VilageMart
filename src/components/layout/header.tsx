'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  Store,
  ShieldAlert,
  LogOut,
  MapPin,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AnnouncementBar } from './announcement-bar';
import type { UserSession } from '@/types';

interface HeaderProps {
  user?: UserSession | null;
  cartCount?: number;
  initialAnnouncement?: any;
}

export function Header({ user: initialUser, cartCount = 0, initialAnnouncement }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get('query') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(initialUser || null);
  const [cartBadge, setCartBadge] = useState(cartCount);
  const [wishlistBadge, setWishlistBadge] = useState(0);
  const [cartBumping, setCartBumping] = useState(false);

  // Sync state if initial changes & subscribe to real-time custom events
  useEffect(() => {
    if (initialUser !== undefined) setUser(initialUser);

    // 1. Immediate local cache read for instant 0ms badge rendering
    if (typeof window !== 'undefined') {
      const cachedCart = localStorage.getItem('vm_cart_count');
      if (cachedCart) setCartBadge(parseInt(cachedCart, 10));
      const cachedWish = localStorage.getItem('vm_wishlist_count');
      if (cachedWish) setWishlistBadge(parseInt(cachedWish, 10));
    }

    // 2. Fetch authoritative database counts
    async function syncCounts() {
      try {
        const [cartRes, wishRes] = await Promise.all([
          fetch('/api/cart'),
          fetch('/api/wishlist'),
        ]);
        if (cartRes.ok) {
          const cart = await cartRes.json();
          const count = cart.itemCount || cart.items?.reduce((a: number, b: any) => a + b.quantity, 0) || 0;
          setCartBadge(count);
          localStorage.setItem('vm_cart_count', count.toString());
        }
        if (wishRes.ok) {
          const wish = await wishRes.json();
          const count = wish.count || wish.items?.length || 0;
          setWishlistBadge(count);
          localStorage.setItem('vm_wishlist_count', count.toString());
        }
      } catch (e) {
        // ignore
      }
    }
    syncCounts();

    // 3. Real-time custom event listeners
    const handleCartUpdate = (e: any) => {
      if (typeof e.detail?.count === 'number') {
        setCartBadge(e.detail.count);
        setCartBumping(true);
        setTimeout(() => setCartBumping(false), 800);
      } else {
        syncCounts();
      }
    };

    const handleWishlistUpdate = (e: any) => {
      if (typeof e.detail?.count === 'number') {
        setWishlistBadge(e.detail.count);
      } else {
        syncCounts();
      }
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, [initialUser, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?query=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setCartBadge(0);
      setWishlistBadge(0);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
      {/* Dynamic Announcement Bar & Promotional Marquee */}
      <AnnouncementBar initialAnnouncement={initialAnnouncement} />

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-5 sm:gap-8">
          {/* Logo with Brand Name on the side */}
          <Link href="/" className="flex items-center gap-3 shrink-0 py-1">
            <div className="relative h-14 w-20 sm:h-16 sm:w-24 overflow-hidden flex items-center justify-center shrink-0">
              <Image
                src="/images/logo.png"
                alt="Village Mart Logo"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 640px) 80px, 96px"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-400">
                  Village<span className="text-amber-500">Mart</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-slate-400 font-semibold tracking-tight -mt-0.5 whitespace-nowrap">
                Your Village • Your Mart • Your Way
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder='Search products...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full pl-11 pr-24 py-2 text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 transition-colors outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors duration-150"
              >
                Search
              </button>
            </div>
          </form>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/products"
              className="hidden lg:inline-flex text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-brand-700 dark:hover:text-brand-400 transition-colors duration-150"
            >
              All Products
            </Link>
            <Link
              href="/categories"
              className="hidden lg:inline-flex text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-brand-700 dark:hover:text-brand-400 transition-colors duration-150"
            >
              Categories
            </Link>
            <Link
              href="/sellers"
              className="hidden lg:inline-flex text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-brand-700 dark:hover:text-brand-400 transition-colors duration-150"
            >
              Sellers
            </Link>

            {/* Dark / Light Mode Toggle */}
            <ThemeToggle />

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors duration-150 relative"
              title="Saved Products"
            >
              <Heart className={`w-5 h-5 ${wishlistBadge > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlistBadge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {wishlistBadge}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              prefetch={false}
              className="p-2 text-gray-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors duration-150 relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartBadge > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow bg-brand-700 text-white">
                  {cartBadge}
                </span>
              )}
            </Link>

            {/* User Account / Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150 border border-gray-200 dark:border-slate-700"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 hidden xl:inline-block max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-xs text-gray-500 dark:text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{user.name}</p>
                      <Badge variant="neutral" size="sm" className="mt-1 text-[10px]">
                        {user.role}
                      </Badge>
                    </div>

                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-150"
                    >
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      My Orders & Tracking
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-150"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      Profile & Addresses
                    </Link>

                    {user.role === 'SELLER' && (
                      <Link
                        href="/dashboard/seller"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-brand-800 dark:text-brand-300 bg-brand-50/50 dark:bg-brand-900/30 hover:bg-brand-50 dark:hover:bg-brand-900/50 transition-colors duration-150"
                      >
                        <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        Seller Dashboard
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-purple-800 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors duration-150"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700/60 text-left transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white md:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full pl-10 pr-20 py-2 text-xs text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-600 outline-none transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-700 hover:bg-brand-800 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors duration-150"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-150"
          >
            All Products
          </Link>
          <Link
            href="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-150"
          >
            Categories
          </Link>
          <Link
            href="/sellers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-150"
          >
            Local Sellers
          </Link>
        </div>
      )}
    </header>
  );
}
