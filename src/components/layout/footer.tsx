import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ShieldCheck, Truck, RefreshCw, HeartHandshake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-14 pb-10 border-t border-gray-800">
      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs">100% Authentic Products</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Direct from verified village farmers and makers.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs">Islandwide Delivery</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Reliable delivery across all provinces in Sri Lanka.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs">Cash on Delivery</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Pay in cash when you receive your package.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs">Support Local Farmers</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">90% of order money goes straight to the producer.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-24 bg-gray-800/80 border border-gray-700/60 rounded-2xl p-1.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Village Mart"
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white block">
                  Village<span className="text-amber-400">Mart</span>
                </span>
                <span className="text-xs text-gray-400 block font-medium">Your Village • Your Mart • Your Way</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed pr-6">
              Village Mart connects local village farmers, beekeepers, and craft makers across Sri Lanka directly with customers.
            </p>
            <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-brand-400">
              <span className="px-2.5 py-0.5 bg-gray-800 rounded-full border border-gray-700">தமிழ் (Tamil)</span>
              <span className="px-2.5 py-0.5 bg-gray-800 rounded-full border border-gray-700">සිංහල (Sinhala)</span>
              <span className="px-2.5 py-0.5 bg-gray-800 rounded-full border border-gray-700">English</span>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Popular Categories</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?category=traditional-foods" className="hover:text-white transition">Traditional Foods (பனங்கற்கண்டு)</Link></li>
              <li><Link href="/products?category=honey" className="hover:text-white transition">Pure Honey (தேன்)</Link></li>
              <li><Link href="/products?category=rice-grains" className="hover:text-white transition">Traditional Rice (அரிசி)</Link></li>
              <li><Link href="/products?category=coconut-products" className="hover:text-white transition">Coconut Oil</Link></li>
              <li><Link href="/products?category=handmade-products" className="hover:text-white transition">Handmade Baskets & Crafts</Link></li>
              <li><Link href="/products?category=spices" className="hover:text-white transition">Local Spices</Link></li>
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Shop by Region</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?district=jaffna" className="hover:text-white transition">Jaffna & Valvettithurai</Link></li>
              <li><Link href="/products?district=kilinochchi" className="hover:text-white transition">Kilinochchi & Vanni</Link></li>
              <li><Link href="/products?district=batticaloa" className="hover:text-white transition">Batticaloa & Eravur</Link></li>
              <li><Link href="/products?district=kandy" className="hover:text-white transition">Kandy & Peradeniya</Link></li>
              <li><Link href="/products?district=galle" className="hover:text-white transition">Galle Fort</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Links</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/register?role=seller" className="text-brand-400 font-medium hover:underline">🏪 Sell on Village Mart</Link></li>
              <li><Link href="/sellers" className="hover:text-white transition">All Sellers</Link></li>
              <li><Link href="/dashboard/seller" className="hover:text-white transition">Seller Portal</Link></li>
              <li><Link href="/dashboard/admin" className="hover:text-white transition">Admin Portal</Link></li>
              <li><Link href="/orders" className="hover:text-white transition">Track Orders</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© {new Date().getFullYear()} Village Mart Sri Lanka. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>🇱🇰 Sri Lanka Local Marketplace</span>
            <span>Unicode Tamil & Sinhala</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
