import React from 'react';
import type { Metadata } from 'next';
import { Users, Mail, Phone, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth';
import { serializeBigInt, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Customer Accounts - Admin',
};

export default async function AdminCustomersPage() {
  await requireRole('ADMIN');

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: {
      addresses: {
        include: { location: true },
        take: 1,
      },
      _count: {
        select: { orders: true, reviews: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = serializeBigInt(customers);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Customer Accounts</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Registered shoppers, verified address details, and order history.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-150">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Customer Name</th>
                <th className="px-6 py-3">Email & Phone</th>
                <th className="px-6 py-3">Primary Location</th>
                <th className="px-6 py-3">Orders Placed</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
              {serialized.map((cust: any) => (
                <tr key={cust.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100">{cust.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 dark:text-slate-200 font-medium">{cust.email}</div>
                    <div className="text-gray-500 dark:text-slate-400 text-[11px]">{cust.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-300">
                    {cust.addresses[0]?.location?.name || 'Sri Lanka'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100">{cust._count.orders} orders</td>
                  <td className="px-6 py-4">
                    <Badge variant={cust.status === 'ACTIVE' ? 'success' : 'danger'}>{cust.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">{formatDate(cust.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
