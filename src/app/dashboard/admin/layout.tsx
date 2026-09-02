import React from 'react';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { requireRole } from '@/lib/auth';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole('ADMIN');
  } catch (e) {
    redirect('/login?callbackUrl=/dashboard/admin');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 flex transition-colors duration-150">
      <DashboardSidebar role="ADMIN" />
      <div className="flex-1 p-6 sm:p-10 max-w-7xl overflow-y-auto">{children}</div>
    </div>
  );
}
