'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Check,
  X,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { SellerApprovalStatus } from '@/types';

interface SellerApprovalTableProps {
  initialSellers: any[];
}

export function SellerApprovalTable({ initialSellers }: SellerApprovalTableProps) {
  const [sellers, setSellers] = useState<any[]>(initialSellers);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: sellers.length,
      pending: sellers.filter((s) => s.approvalStatus === 'PENDING').length,
      approved: sellers.filter((s) => s.approvalStatus === 'APPROVED').length,
      rejected: sellers.filter((s) => s.approvalStatus === 'REJECTED').length,
    };
  }, [sellers]);

  // Filter & Search
  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      const matchesFilter =
        activeFilter === 'ALL' ? true : s.approvalStatus === activeFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.shopName?.toLowerCase().includes(q) ||
        s.user?.name?.toLowerCase().includes(q) ||
        s.user?.email?.toLowerCase().includes(q) ||
        s.user?.phone?.toLowerCase().includes(q) ||
        s.location?.name?.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [sellers, activeFilter, searchQuery]);

  const handleUpdateStatus = async (sellerId: string, shopName: string, newStatus: SellerApprovalStatus) => {
    try {
      setUpdatingId(sellerId);
      setActionMessage(null);

      const res = await fetch(`/api/admin/sellers/${sellerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Update local state
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, approvalStatus: newStatus } : s))
      );

      const actionWord = newStatus === 'APPROVED' ? 'accepted and approved' : newStatus === 'REJECTED' ? 'rejected' : 'suspended';
      setActionMessage({
        type: 'success',
        text: `Shop "${shopName}" has been successfully ${actionWord}.`,
      });

      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'An error occurred while updating seller status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 shadow-sm ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-150">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-slate-950 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 ${
              activeFilter === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            All ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 ${
              activeFilter === 'PENDING'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Review ({counts.pending})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 ${
              activeFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            Approved ({counts.approved})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 ${
              activeFilter === 'REJECTED'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            Rejected ({counts.rejected})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search shop, seller, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-600 dark:focus:border-emerald-500 outline-none transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-150">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Shop & Owner</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Contact Details</th>
                <th className="px-6 py-3.5">Products</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Registered</th>
                <th className="px-6 py-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 text-xs">
                    No seller onboarding records found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredSellers.map((s) => {
                  const isPending = s.approvalStatus === 'PENDING';
                  const isApproved = s.approvalStatus === 'APPROVED';
                  const isUpdating = updatingId === s.id;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150 ${
                        isPending ? 'bg-amber-50/30 dark:bg-amber-950/20 font-medium' : ''
                      }`}
                    >
                      {/* Shop Name & Logo */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 overflow-hidden border border-brand-200 dark:border-slate-700 shrink-0">
                            <Image
                              src={
                                s.logoUrl ||
                                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'
                              }
                              alt={s.shopName}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/sellers/${s.slug}`}
                              className="font-bold text-gray-900 dark:text-slate-100 hover:text-brand-700 dark:hover:text-emerald-400"
                            >
                              {s.shopName}
                            </Link>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400">{s.user.name}</p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-slate-100">{s.location?.name || 'Sri Lanka'}</div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400">{s.location?.parent?.name}</div>
                      </td>

                      {/* Contact Details */}
                      <td className="px-6 py-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-gray-900 dark:text-slate-100">
                          <Mail className="w-3 h-3 text-gray-400 dark:text-slate-500 shrink-0" />
                          <span>{s.user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                          <Phone className="w-3 h-3 text-gray-400 dark:text-slate-500 shrink-0" />
                          <span>{s.user.phone || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Products Count */}
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100">
                        {s._count?.products ?? 0}
                      </td>

                      {/* Current Status Badge */}
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            s.approvalStatus === 'APPROVED'
                              ? 'success'
                              : s.approvalStatus === 'PENDING'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {s.approvalStatus === 'PENDING'
                            ? '⏳ PENDING REVIEW'
                            : s.approvalStatus === 'APPROVED'
                            ? '✓ APPROVED'
                            : s.approvalStatus}
                        </Badge>
                      </td>

                      {/* Registered Date */}
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(s.createdAt)}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.approvalStatus !== 'APPROVED' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="primary"
                              isLoading={isUpdating}
                              onClick={() => handleUpdateStatus(s.id, s.shopName, 'APPROVED')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1 shadow-sm px-2.5 py-1"
                              title="Accept and approve this seller"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Accept
                            </Button>
                          )}

                          {s.approvalStatus !== 'REJECTED' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              isLoading={isUpdating}
                              onClick={() => handleUpdateStatus(s.id, s.shopName, 'REJECTED')}
                              className="border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold gap-1 px-2 py-1"
                              title="Reject seller application"
                            >
                              <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" /> Reject
                            </Button>
                          )}

                          {s.approvalStatus === 'APPROVED' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(s.id, s.shopName, 'SUSPENDED')}
                              className="text-gray-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                              title="Suspend seller shop"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
