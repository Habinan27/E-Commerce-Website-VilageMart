import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { User, MapPin, Phone, Mail, ShoppingBag, Shield } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProfileAddressesList } from './profile-addresses-list';

export const metadata: Metadata = {
  title: 'My Profile & Addresses',
};

export default async function ProfilePage() {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login?callbackUrl=/profile');
  }

  const [user, addresses, ordersCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: BigInt(session.id) },
      include: { sellerProfile: true },
    }),
    prisma.address.findMany({
      where: { userId: BigInt(session.id) },
      include: {
        location: {
          include: { parent: true },
        },
      },
      orderBy: { isDefault: 'desc' },
    }),
    prisma.order.count({
      where: { userId: BigInt(session.id) },
    }),
  ]);

  const serializedUser = serializeBigInt(user);
  const serializedAddresses = serializeBigInt(addresses);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">
        My Account & Profile
      </h1>

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-700 dark:bg-brand-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
              {serializedUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">{serializedUser?.name}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">{serializedUser?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="brand" size="sm">
                  {serializedUser?.role}
                </Badge>
                <Badge variant="success" size="sm">
                  {serializedUser?.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-gray-500 dark:text-slate-400">
            <span className="font-bold text-base text-gray-900 dark:text-slate-100 block">{ordersCount}</span>
            Total Orders Placed
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs text-gray-700 dark:text-slate-300">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{serializedUser?.email}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{serializedUser?.phone || 'No phone number added'}</span>
          </div>
        </div>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-700 dark:text-brand-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Saved Delivery Addresses</h3>
          </div>
        </div>

        <ProfileAddressesList initialAddresses={serializedAddresses} />
      </div>
    </div>
  );
}
