'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  sellerId?: string | null;
  title?: string | null;
  content: string;
  contentTamil?: string | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
  theme: string;
  isMarquee: boolean;
  speed: number;
  isActive: boolean;
  displayOrder: number;
}

interface AnnouncementBarProps {
  initialAnnouncement?: AnnouncementItem | null;
}

export function AnnouncementBar({ initialAnnouncement }: AnnouncementBarProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(
    initialAnnouncement ? [initialAnnouncement] : []
  );
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(!initialAnnouncement);

  useEffect(() => {
    if (initialAnnouncement) {
      setAnnouncements([initialAnnouncement]);
      setLoading(false);
    }

    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/announcements', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.announcements && data.announcements.length > 0) {
            setAnnouncements(data.announcements);
          }
        }
      } catch (e) {
        console.error('Failed to load announcements', e);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();

    const handleRefresh = () => fetchAnnouncements();
    window.addEventListener('announcements-updated', handleRefresh);
    return () => window.removeEventListener('announcements-updated', handleRefresh);
  }, [initialAnnouncement]);

  const activeList = announcements.filter((a) => a.isActive);

  if (dismissed || activeList.length === 0) return null;

  const item = activeList[0];

  const themeClasses: Record<string, { bar: string; badge: string; linkBtn: string }> = {
    emerald: {
      bar: 'bg-emerald-800 dark:bg-emerald-950 text-emerald-50 border-b border-emerald-700/50',
      badge: 'bg-emerald-950/70 text-emerald-200 border border-emerald-700',
      linkBtn: 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600/60',
    },
    amber: {
      bar: 'bg-amber-600 dark:bg-amber-950 text-amber-50 border-b border-amber-500/50',
      badge: 'bg-amber-900/70 text-amber-200 border border-amber-500',
      linkBtn: 'bg-amber-700 hover:bg-amber-600 text-white border border-amber-400/60',
    },
    brand: {
      bar: 'bg-brand-900 dark:bg-slate-950 text-brand-50 border-b border-brand-800/60',
      badge: 'bg-brand-950/80 text-brand-200 border border-brand-700',
      linkBtn: 'bg-brand-800 hover:bg-brand-700 text-white border border-brand-600/60',
    },
    indigo: {
      bar: 'bg-indigo-700 dark:bg-indigo-950 text-indigo-50 border-b border-indigo-600/50',
      badge: 'bg-indigo-900/70 text-indigo-200 border border-indigo-500',
      linkBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/60',
    },
    rose: {
      bar: 'bg-rose-700 dark:bg-rose-950 text-rose-50 border-b border-rose-600/50',
      badge: 'bg-rose-900/70 text-rose-200 border border-rose-500',
      linkBtn: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/60',
    },
    slate: {
      bar: 'bg-slate-900 dark:bg-slate-950 text-slate-100 border-b border-slate-800',
      badge: 'bg-slate-800 text-slate-300 border border-slate-700',
      linkBtn: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600',
    },
    gradient: {
      bar: 'bg-gradient-to-r from-emerald-900 via-amber-700 to-emerald-900 text-white border-b border-amber-600/40',
      badge: 'bg-black/40 text-amber-200 border border-white/20',
      linkBtn: 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm',
    },
  };

  const selectedTheme = themeClasses[item.theme] || themeClasses.emerald;

  return (
    <div className={`relative overflow-hidden z-40 transition-all text-xs font-medium ${selectedTheme.bar}`}>
      {item.isMarquee ? (
        // Continuous Non-Stop Scrolling Marquee
        <div className="relative flex items-center py-2 sm:py-2.5 overflow-hidden select-none">
          <div
            className="flex items-center gap-12 whitespace-nowrap will-change-transform animate-marquee"
            style={{ animationDuration: `${item.speed || 28}s` }}
          >
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-4 shrink-0">
                {item.title && (
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase shrink-0 ${selectedTheme.badge}`}>
                    {item.title}
                  </span>
                )}
                <span className="font-semibold text-xs tracking-tight">
                  {item.content}
                </span>
                {item.contentTamil && (
                  <>
                    <span className="opacity-40">•</span>
                    <span className="font-medium text-xs font-tamil tracking-normal">
                      {item.contentTamil}
                    </span>
                  </>
                )}
                {item.linkUrl && (
                  <Link
                    href={item.linkUrl}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all ml-1 ${selectedTheme.linkBtn}`}
                  >
                    <span>{item.linkLabel || 'View Offer'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
                <span className="opacity-40 ml-4">•</span>
              </div>
            ))}
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
            title="Close banner for now"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        // Static Centered Banner Mode
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center justify-center flex-wrap gap-2 sm:gap-3 text-center">
            {item.title && (
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase shrink-0 ${selectedTheme.badge}`}>
                {item.title}
              </span>
            )}
            <span className="font-semibold text-xs tracking-tight">
              {item.content}
            </span>
            {item.contentTamil && (
              <span className="font-medium text-xs font-tamil hidden md:inline">
                {item.contentTamil}
              </span>
            )}
            {item.linkUrl && (
              <Link
                href={item.linkUrl}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all ml-1 ${selectedTheme.linkBtn}`}
              >
                <span>{item.linkLabel || 'Explore Now'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Close banner for now"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
