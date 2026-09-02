import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Clock, AlertTriangle, Home } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { Megaphone, ArrowRight } from 'lucide-react';

export default async function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await requireRole(['SELLER', 'ADMIN']);
  } catch (e) {
    redirect('/login?callbackUrl=/dashboard/seller');
  }

  let adminSellerAnnouncement = null;
  try {
    if (prisma?.announcement) {
      adminSellerAnnouncement = await prisma.announcement.findFirst({
        where: {
          sellerId: null,
          targetAudience: { in: ['SELLERS', 'ALL'] },
          isActive: true,
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });
    }
  } catch (e) {
    // ignore if table / model is initializing
  }

  // If seller is not yet approved by Admin (and not system Admin)
  if (session.role === 'SELLER' && session.sellerApprovalStatus !== 'APPROVED') {
    const isRejected = session.sellerApprovalStatus === 'REJECTED';

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-150">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8 text-center shadow-xl">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
              isRejected ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            }`}
          >
            {isRejected ? <AlertTriangle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>

          <Badge
            variant={isRejected ? 'danger' : 'warning'}
            size="md"
            className="mb-3 font-bold"
          >
            {isRejected ? 'APPLICATION REJECTED' : 'UNDER ADMIN REVIEW'}
          </Badge>

          <h2 className="text-xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
            {isRejected
              ? 'Seller Account Not Approved'
              : 'Your Seller Account is Under Review'}
          </h2>

          <p className="text-xs text-gray-600 dark:text-slate-300 mt-2 leading-relaxed">
            {isRejected
              ? 'Your seller application could not be approved at this time. Please contact Village Mart platform support for more details.'
              : 'Thank you for registering your shop on Village Mart! Our platform admin is currently verifying your shop details. Once approved, you will have full access to add products and receive customer orders.'}
          </p>

          {/* Shop Details Summary */}
          <div className="my-6 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Shop Name:</span>
              <span className="font-bold text-gray-900 dark:text-slate-100">{session.shopName || session.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Seller Name:</span>
              <span className="font-semibold text-gray-900 dark:text-slate-100">{session.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Email:</span>
              <span className="text-gray-900 dark:text-slate-100">{session.email}</span>
            </div>
            {session.phone && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Phone:</span>
                <span className="text-gray-900 dark:text-slate-100">{session.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Approval Status:</span>
              <span
                className={`font-bold ${
                  isRejected ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {session.sellerApprovalStatus || 'PENDING'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Link href="/" className="block w-full">
              <Button variant="outline" size="md" className="w-full gap-2">
                <Home className="w-4 h-4" /> Back to Village Mart Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 flex transition-colors duration-150">
      <DashboardSidebar role="SELLER" shopName={session.shopName} />
      <div className="flex-1 p-6 sm:p-10 max-w-7xl overflow-y-auto space-y-6">
        {/* Admin Broadcast Announcement to Sellers */}
        {adminSellerAnnouncement && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-900 via-emerald-800 to-brand-950 text-white shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Megaphone className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-xs">
                <span className="font-bold uppercase tracking-wider text-amber-300 mr-2 text-[10px] bg-black/30 px-2 py-0.5 rounded">
                  {adminSellerAnnouncement.title || 'Platform Notice'}
                </span>
                <span className="font-semibold">{adminSellerAnnouncement.content}</span>
                {adminSellerAnnouncement.contentTamil && (
                  <span className="opacity-80 font-tamil ml-2 hidden md:inline">
                    {adminSellerAnnouncement.contentTamil}
                  </span>
                )}
              </div>
            </div>
            {adminSellerAnnouncement.linkUrl && (
              <Link
                href={adminSellerAnnouncement.linkUrl}
                className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition"
              >
                <span>{adminSellerAnnouncement.linkLabel || 'Read More'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
