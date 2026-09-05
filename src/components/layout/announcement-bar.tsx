'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  sellerId?: string | null;
  sellerShopName?: string | null;
  sellerSlug?: string | null;
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
  initialAnnouncements?: AnnouncementItem[] | null;
  initialAnnouncement?: AnnouncementItem | null;
}

const THEME_CLASSES: Record<string, { bar: string; badge: string; linkBtn: string }> = {
  emerald: {
    bar: 'bg-emerald-800 dark:bg-emerald-950 text-emerald-50 border-b border-emerald-700/50',
    badge: 'bg-emerald-950/70 text-emerald-200 border border-emerald-700/80',
    linkBtn: 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600/60 shadow-sm',
  },
  amber: {
    bar: 'bg-amber-700 dark:bg-amber-950 text-amber-50 border-b border-amber-600/50',
    badge: 'bg-amber-900/70 text-amber-200 border border-amber-500/80',
    linkBtn: 'bg-amber-800 hover:bg-amber-700 text-white border border-amber-500/60 shadow-sm',
  },
  brand: {
    bar: 'bg-brand-900 dark:bg-slate-950 text-brand-50 border-b border-brand-800/60',
    badge: 'bg-brand-950/80 text-brand-200 border border-brand-700',
    linkBtn: 'bg-brand-800 hover:bg-brand-700 text-white border border-brand-600/60 shadow-sm',
  },
  indigo: {
    bar: 'bg-indigo-700 dark:bg-indigo-950 text-indigo-50 border-b border-indigo-600/50',
    badge: 'bg-indigo-900/70 text-indigo-200 border border-indigo-500/80',
    linkBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/60 shadow-sm',
  },
  blue: {
    bar: 'bg-blue-800 dark:bg-blue-950 text-blue-50 border-b border-blue-700/50',
    badge: 'bg-blue-950/80 text-blue-200 border border-blue-600/80',
    linkBtn: 'bg-blue-700 hover:bg-blue-600 text-white border border-blue-500/60 shadow-sm',
  },
  purple: {
    bar: 'bg-purple-800 dark:bg-purple-950 text-purple-50 border-b border-purple-700/50',
    badge: 'bg-purple-950/80 text-purple-200 border border-purple-600/80',
    linkBtn: 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-500/60 shadow-sm',
  },
  rose: {
    bar: 'bg-rose-700 dark:bg-rose-950 text-rose-50 border-b border-rose-600/50',
    badge: 'bg-rose-900/70 text-rose-200 border border-rose-500/80',
    linkBtn: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/60 shadow-sm',
  },
  red: {
    bar: 'bg-rose-800 dark:bg-rose-950 text-rose-50 border-b border-rose-700/50',
    badge: 'bg-rose-950/80 text-rose-200 border border-rose-600/80',
    linkBtn: 'bg-rose-700 hover:bg-rose-600 text-white border border-rose-500/60 shadow-sm',
  },
  slate: {
    bar: 'bg-slate-900 dark:bg-slate-950 text-slate-100 border-b border-slate-800',
    badge: 'bg-slate-800 text-slate-300 border border-slate-700',
    linkBtn: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 shadow-sm',
  },
  gold: {
    bar: 'bg-yellow-800 dark:bg-yellow-950 text-yellow-50 border-b border-yellow-700/50',
    badge: 'bg-yellow-950/80 text-yellow-200 border border-yellow-600/80',
    linkBtn: 'bg-yellow-700 hover:bg-yellow-600 text-white border border-yellow-500/60 shadow-sm',
  },
  gradient: {
    bar: 'bg-gradient-to-r from-emerald-900 via-amber-800 to-emerald-900 text-white border-b border-amber-600/40',
    badge: 'bg-black/40 text-amber-200 border border-white/20',
    linkBtn: 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm shadow-sm',
  },
};

export function AnnouncementBar({ initialAnnouncements, initialAnnouncement }: AnnouncementBarProps) {
  const initialList = initialAnnouncements || (initialAnnouncement ? [initialAnnouncement] : []);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialList);
  const [lastActiveList, setLastActiveList] = useState<AnnouncementItem[]>(
    initialList.filter((a) => a.isActive)
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (initialAnnouncements && initialAnnouncements.length > 0) {
      setAnnouncements(initialAnnouncements);
    } else if (initialAnnouncement) {
      setAnnouncements([initialAnnouncement]);
    }

    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/announcements', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.announcements)) {
            setAnnouncements(data.announcements);
          }
        }
      } catch (e) {
        console.error('Failed to load announcements', e);
      }
    }

    fetchAnnouncements();

    const handleRefresh = () => fetchAnnouncements();
    window.addEventListener('announcements-updated', handleRefresh);
    return () => window.removeEventListener('announcements-updated', handleRefresh);
  }, [initialAnnouncements, initialAnnouncement]);

  const activeList = announcements.filter((a) => a.isActive);

  // Keep a cached copy of the last known active list so exiting/closing animations don't abruptly blank out
  useEffect(() => {
    if (activeList.length > 0) {
      setLastActiveList(activeList);
    }
  }, [announcements]);

  const isVisible = !dismissed && activeList.length > 0;
  const renderList = activeList.length > 0 ? activeList : lastActiveList;

  if (renderList.length === 0) return null;

  // Single static banner check (only when 1 item and marquee is explicitly set to false)
  const isStaticSingle = renderList.length === 1 && renderList[0].isMarquee === false;

  const primaryThemeKey = renderList[0]?.theme || 'emerald';
  const primaryTheme = THEME_CLASSES[primaryThemeKey] || THEME_CLASSES.emerald;

  // For continuous seamless marquee loop (0% -> -50%):
  let repeatCount = 1;
  if (renderList.length === 1) {
    repeatCount = 6;
  } else if (renderList.length === 2) {
    repeatCount = 3;
  } else if (renderList.length <= 4) {
    repeatCount = 2;
  } else {
    repeatCount = 1;
  }

  const loopSet: AnnouncementItem[] = [];
  for (let i = 0; i < repeatCount; i++) {
    loopSet.push(...renderList);
  }

  // Calculate speed based on total number of items in the set
  const baseSpeed = renderList.reduce((acc, it) => acc + (it.speed || 28), 0) / renderList.length;
  const totalDuration = Math.max(22, Math.round(baseSpeed * (loopSet.length / 2)));

  const renderItemContent = (item: AnnouncementItem, keyPrefix: string, index: number) => {
    const itemTheme = THEME_CLASSES[item.theme] || THEME_CLASSES.emerald;
    const badgeText = item.title || (item.sellerShopName ? `🌾 ${item.sellerShopName}` : null);

    return (
      <div key={`${keyPrefix}-${item.id}-${index}`} className="flex items-center gap-4 shrink-0">
        {badgeText && (
          <span
            className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase shrink-0 transition-colors duration-200 ${itemTheme.badge}`}
          >
            {badgeText}
          </span>
        )}

        <span className="font-semibold text-xs tracking-tight text-white/95 dark:text-emerald-50">
          {item.content}
        </span>

        {item.contentTamil && (
          <>
            <span className="opacity-40 select-none">•</span>
            <span className="font-medium text-xs font-tamil tracking-normal text-white/85 dark:text-emerald-100/90">
              {item.contentTamil}
            </span>
          </>
        )}

        {item.linkUrl && (
          <Link
            href={item.linkUrl}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all duration-150 ml-1 hover:scale-105 active:scale-95 ${itemTheme.linkBtn}`}
          >
            <span>{item.linkLabel || 'Explore Now'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}

        <span className="opacity-35 mx-3 select-none text-[10px]">✦</span>
      </div>
    );
  };

  return (
    <div
      className={`announcement-marquee-container group relative overflow-hidden z-40 transition-all duration-300 ease-in-out text-xs font-medium ${primaryTheme.bar} ${
        isVisible
          ? 'max-h-16 opacity-100 translate-y-0'
          : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none py-0 my-0 border-b-0'
      }`}
    >
      {!isStaticSingle ? (
        // Continuous Non-Stop Seamless Scrolling Marquee Loop with Instant Hover Freeze
        <div className="relative flex items-center py-2 sm:py-2.5 overflow-hidden select-none">
          <div
            className="flex items-center whitespace-nowrap will-change-transform animate-marquee transition-opacity duration-300"
            style={{ animationDuration: `${totalDuration}s` }}
          >
            {/* Set 1 (First Half - 0% to -50%) */}
            <div className="flex items-center shrink-0">
              {loopSet.map((item, idx) => renderItemContent(item, 'set1', idx))}
            </div>

            {/* Set 2 (Identical Duplicate Half - Smooth Seamless Infinite Loop) */}
            <div className="flex items-center shrink-0" aria-hidden="true">
              {loopSet.map((item, idx) => renderItemContent(item, 'set2', idx))}
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-white/70 hover:text-white hover:bg-black/20 dark:hover:bg-white/10 transition-colors duration-150 z-10"
            title="Close banner"
            aria-label="Close announcement bar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        // Static Centered Banner Mode (only when 1 single static announcement is active)
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center justify-center flex-wrap gap-2 sm:gap-3 text-center">
            {(renderList[0]?.title || renderList[0]?.sellerShopName) && (
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase shrink-0 transition-colors duration-200 ${primaryTheme.badge}`}
              >
                {renderList[0]?.title || `🌾 ${renderList[0]?.sellerShopName}`}
              </span>
            )}
            <span className="font-semibold text-xs tracking-tight">
              {renderList[0]?.content}
            </span>
            {renderList[0]?.contentTamil && (
              <span className="font-medium text-xs font-tamil hidden md:inline">
                {renderList[0]?.contentTamil}
              </span>
            )}
            {renderList[0]?.linkUrl && (
              <Link
                href={renderList[0].linkUrl}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all duration-150 ml-1 hover:scale-105 active:scale-95 ${primaryTheme.linkBtn}`}
              >
                <span>{renderList[0].linkLabel || 'Explore Now'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-black/20 dark:hover:bg-white/10 transition-colors duration-150 shrink-0"
            title="Close banner"
            aria-label="Close announcement bar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
