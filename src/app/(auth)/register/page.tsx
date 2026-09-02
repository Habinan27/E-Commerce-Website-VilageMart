'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, AlertCircle, Store, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'seller' ? 'SELLER' : 'CUSTOMER';

  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Seller specific
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');

  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('role') === 'seller') {
      setRole('SELLER');
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await fetch('/api/locations');
        if (res.ok) {
          const data = await res.json();
          setLocations(data);
        }
      } catch (e) {
        // fallback
      }
    }
    loadLocations();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload =
        role === 'SELLER'
          ? {
              role: 'SELLER',
              name,
              email,
              phone,
              password,
              shopName,
              description: description || undefined,
              address,
              locationId: selectedCityId,
            }
          : {
              role: 'CUSTOMER',
              name,
              email,
              phone: phone || undefined,
              password,
            };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (role === 'SELLER') {
        router.push('/dashboard/seller?welcome=true');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Create your Village Mart account</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white dark:bg-slate-800 py-8 px-6 sm:px-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-xl space-y-6">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-slate-900 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center justify-center gap-2 ${
                role === 'CUSTOMER' ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" /> Customer Account
            </button>

            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center justify-center gap-2 ${
                role === 'SELLER' ? 'bg-brand-700 text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <Store className="w-4 h-4" /> Seller / Producer
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. Senthilvel Nadarajah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                placeholder="077 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={role === 'SELLER'}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password (min 6 characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Seller Specific Fields */}
            {role === 'SELLER' && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">
                  Village Shop Information
                </h4>

                <Input
                  label="Shop Name (e.g. Yarl Nature Organics)"
                  placeholder="e.g. Vanni Forest Honey Co."
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />

                <Input
                  label="Physical Shop / Farm Address"
                  placeholder="e.g. Coast Road, Valvettithurai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />

                {/* Location Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Province</label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value);
                        setSelectedDistrict('');
                        setSelectedCityId('');
                      }}
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:border-brand-500 outline-none"
                    >
                      <option value="">Province</option>
                      {locations.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setSelectedCityId('');
                      }}
                      disabled={!selectedProvince}
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:border-brand-500 outline-none disabled:bg-gray-50"
                    >
                      <option value="">District</option>
                      {locations
                        .find((p) => p.slug === selectedProvince)
                        ?.children?.map((d: any) => (
                          <option key={d.id} value={d.slug}>
                            {d.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City / Town</label>
                    <select
                      value={selectedCityId}
                      onChange={(e) => setSelectedCityId(e.target.value)}
                      disabled={!selectedDistrict}
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:border-brand-500 outline-none disabled:bg-gray-50"
                    >
                      <option value="">City</option>
                      {locations
                        .find((p) => p.slug === selectedProvince)
                        ?.children?.find((d: any) => d.slug === selectedDistrict)
                        ?.children?.map((city: any) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Shop Description (Specialty, local products)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell customers about your authentic village products..."
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:border-brand-500 outline-none"
                  ></textarea>
                </div>
              </div>
            )}

            <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2">
              {role === 'SELLER' ? 'Submit Seller Registration' : 'Create Customer Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
