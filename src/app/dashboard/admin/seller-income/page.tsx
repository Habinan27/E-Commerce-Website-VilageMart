import React from 'react';
import type { Metadata } from 'next';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { SellerIncomeReport } from '@/components/dashboard/seller-income-report';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Seller Sales & Income Report | Admin Dashboard | Village Mart',
};

export default async function AdminSellerIncomePage() {
  const report = await AnalyticsService.getSellerIncomeReport();

  return <SellerIncomeReport initialReport={report} />;
}

