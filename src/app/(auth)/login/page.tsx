'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, AlertCircle, Lock, Mail, Store, UserCheck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      if (data.user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (data.user.role === 'SELLER') {
        router.push('/dashboard/seller');
      } else {
        router.push(callbackUrl);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Account Selector
  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-3.5 group mb-2">
          <div className="relative h-20 w-28 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Village Mart"
              fill
              priority
              className="object-contain"
              sizes="112px"
            />
          </div>
          <div className="text-left">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 dark:text-emerald-400 block">
              Village<span className="text-amber-500">Mart</span>
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold block -mt-0.5">Your Village • Your Mart • Your Way</span>
          </div>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Sign in to your account</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          Or{' '}
          <Link href="/register" className="font-semibold text-brand-700 hover:underline">
            create a new customer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-6 sm:px-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-xl space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-slate-100 focus:border-brand-500 outline-none transition-colors"
              />
            </div>

            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick One-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@example.com', 'Admin@123')}
                className="p-2 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-900 dark:text-purple-300 text-center transition-colors duration-150"
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-purple-700 dark:text-purple-400" />
                <span className="text-[10px] font-bold block">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('seller1@example.com', 'password123')}
                className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-300 text-center transition-colors duration-150"
              >
                <Store className="w-4 h-4 mx-auto mb-1 text-emerald-700 dark:text-emerald-400" />
                <span className="text-[10px] font-bold block">Seller</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('customer1@example.com', 'password123')}
                className="p-2 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-900 dark:text-blue-300 text-center transition-colors duration-150"
              >
                <UserCheck className="w-4 h-4 mx-auto mb-1 text-blue-700 dark:text-blue-400" />
                <span className="text-[10px] font-bold block">Customer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
