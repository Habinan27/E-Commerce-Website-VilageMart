import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Store, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth';
import { serializeBigInt } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Shop Profile',
};

export default async function SellerProfilePage() {
  const session = await requireRole(['SELLER', 'ADMIN']);
  if (!session.sellerProfileId) return null;

  const profile = await prisma.sellerProfile.findUnique({
    where: { id: BigInt(session.sellerProfileId) },
    include: {
      location: {
        include: {
          parent: { include: { parent: true } },
        },
      },
      user: true,
    },
  });

  const serialized = serializeBigInt(profile);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Shop Profile & Settings</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Manage your village shop branding, location, and verified details.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm transition-colors duration-150">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
          <div className="relative w-16 h-16 rounded-2xl bg-brand-50 dark:bg-slate-800 overflow-hidden border border-brand-200 dark:border-slate-700 shrink-0">
            <Image
              src={serialized?.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'}
              alt={serialized?.shopName || 'Shop Logo'}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">{serialized?.shopName}</h2>
              <Badge variant="brand" size="sm">
                {serialized?.approvalStatus}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-0.5">/sellers/{serialized?.slug}</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-gray-400 dark:text-slate-400 font-bold block mb-1">Business Description</label>
            <p className="text-gray-800 dark:text-slate-200 bg-gray-50 dark:bg-slate-800/80 p-4 rounded-xl leading-relaxed border border-gray-100 dark:border-slate-700">
              {serialized?.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 dark:text-slate-400 font-bold block mb-1">Registered Location</label>
              <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-1.5 border border-gray-100 dark:border-slate-700">
                <MapPin className="w-4 h-4 text-brand-700 dark:text-emerald-400 shrink-0" />
                <span>
                  {serialized?.location?.name}, {serialized?.location?.parent?.name}
                </span>
              </div>
            </div>

            <div>
              <label className="text-gray-400 dark:text-slate-400 font-bold block mb-1">Physical Address</label>
              <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl font-medium text-gray-900 dark:text-slate-100 border border-gray-100 dark:border-slate-700">
                {serialized?.address}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
