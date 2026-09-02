import React from 'react';
import type { Metadata } from 'next';
import { SellerApprovalTable } from './seller-approval-table';
import { SellerService } from '@/lib/services/seller-service';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Seller Approvals & Management | Village Mart Admin',
  description: 'Review new seller onboarding applications, accept genuine village shops, and manage seller permissions.',
};

export default async function AdminSellersPage() {
  await requireRole('ADMIN');
  const sellers = await SellerService.getAllSellers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Seller Approvals & Verification</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Review new village seller onboarding applications, click <strong className="text-gray-900 dark:text-slate-200">Accept</strong> to approve genuine shops and grant access to the seller dashboard.
        </p>
      </div>

      <SellerApprovalTable initialSellers={sellers} />
    </div>
  );
}
