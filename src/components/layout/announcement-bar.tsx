'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  sellerId?: string | null;
  sellerShopName?: string | null;
  sellerSlug?: string | null;
  productId?: string | null;
  productName?: string | null;
  productSlug?: string | null;
  productPrice?: number | null;
  title?: string | null;
  content: string;
  contentTamil?: string | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
  theme: string;
  bgType?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  accentColor?: string | null;
  borderColor?: string | null;
  buttonColor?: string | null;
  buttonTextColor?: string | null;
  bgImage?: string | null;
  overlayOpacity?: number | null;
  isMarquee: boolean;
  speed: number;
  isActive: boolean;
  displayOrder: number;
}

interface AnnouncementBarProps {
  initialAnnouncements?: AnnouncementItem[] | null;
  initialAnnouncement?: AnnouncementItem | null;
}

const DEFAULT_GRADIENT = 'linear-gradient(90deg, #022c22 0%, #065f46 50%, #022c22 100%)';

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

  useEffect(() => {
    if (activeList.length > 0) {
      setLastActiveList(activeList);
    }
  }, [announcements]);

  const isVisible = !dismissed && activeList.length > 0;
  const renderList = activeList.length > 0 ? activeList : lastActiveList;

  if (renderList.length === 0) return null;

  const isSingle = renderList.length === 1;
  const isStaticSingle = isSingle && renderList[0].isMarquee === false;
  const primaryItem = renderList[0];

  // Build repeat loop for seamless non-stop marquee
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

  const baseSpeed = renderList.reduce((acc, it) => acc + (it.speed || 28), 0) / renderList.length;
  const totalDuration = Math.max(22, Math.round(baseSpeed * (loopSet.length / 2)));

  // Calculate Bar Container Background (Gradient / Solid / Image)
  const barContainerStyle: React.CSSProperties = {};
  const isImageBg = primaryItem?.bgType === 'IMAGE' && Boolean(primaryItem?.bgImage);

  if (isImageBg && primaryItem?.bgImage) {
    barContainerStyle.backgroundImage = `url("${primaryItem.bgImage}")`;
    barContainerStyle.backgroundSize = 'cover';
    barContainerStyle.backgroundPosition = 'center';
  } else if (primaryItem?.bgColor) {
    barContainerStyle.background = primaryItem.bgColor;
  } else {
    barContainerStyle.background = DEFAULT_GRADIENT;
  }

  if (primaryItem?.borderColor) {
    barContainerStyle.borderColor = primaryItem.borderColor;
  }

  const overlayOpacity =
    (primaryItem?.overlayOpacity !== undefined && primaryItem?.overlayOpacity !== null
      ? primaryItem.overlayOpacity
      : 60) / 100;

  const renderItemContent = (item: AnnouncementItem, keyPrefix: string, index: number) => {
    const badgeText = item.title || (item.sellerShopName ? `🌾 ${item.sellerShopName}` : null);

    const badgeStyle: React.CSSProperties = item.accentColor
      ? {
          backgroundColor: item.accentColor,
          borderColor: item.borderColor || item.accentColor,
          color: '#ffffff',
        }
      : {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderColor: 'rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
        };

    const textStyle: React.CSSProperties = item.textColor ? { color: item.textColor } : { color: '#ffffff' };

    const rawLabel = item.linkLabel || 'Explore';
    const cleanLabel = rawLabel.replace(/\s*(?:→|->|›|>|—)\s*$/, '').trim();

    const buttonBg = item.buttonColor || '#ffffff';
    const buttonText = item.buttonTextColor || (buttonBg.toLowerCase() === '#ffffff' || buttonBg.toLowerCase() === '#fff' ? '#022c22' : '#ffffff');

    const buttonStyle: React.CSSProperties = {
      backgroundColor: buttonBg,
      borderColor: item.borderColor || 'rgba(255, 255, 255, 0.3)',
      color: buttonText,
    };

    return (
      <div
        key={`${keyPrefix}-${item.id}-${index}`}
        className="inline-flex items-center gap-2.5 sm:gap-3 px-4 shrink-0 transition-opacity duration-200"
      >
        {badgeText && (
          <span
            className="px-2.5 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase shrink-0 shadow-xs border"
            style={badgeStyle}
          >
            {badgeText}
          </span>
        )}

        <span className="font-semibold text-xs tracking-tight text-white/95" style={textStyle}>
          {item.content}
        </span>

        {item.contentTamil && (
          <>
            <span className="opacity-40 select-none text-white/70">•</span>
            <span
              className="font-medium text-xs font-tamil tracking-normal text-white/90"
              style={textStyle}
            >
              {item.contentTamil}
            </span>
          </>
        )}

        {item.linkUrl && (
          <Link
            href={item.linkUrl}
            className="group/btn inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-bold text-[11px] tracking-tight transition-all duration-200 ml-1.5 hover:brightness-110 hover:shadow-md hover:scale-[1.03] active:scale-95 border border-white/25 shadow-xs backdrop-blur-xs select-none shrink-0 cursor-pointer"
            style={buttonStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="leading-none">{cleanLabel}</span>
            <ArrowRight className="w-3 h-3 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </Link>
        )}

        <span className="opacity-30 select-none text-[10px] text-white ml-2">✦</span>
      </div>
    );
  };

  return (
    <div
      className={`announcement-marquee-container group relative overflow-hidden z-40 transition-all duration-300 ease-in-out text-xs font-medium border-b border-black/20 text-white ${
        isVisible
          ? 'max-h-16 opacity-100 translate-y-0'
          : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none py-0 my-0 border-b-0'
      }`}
      style={barContainerStyle}
    >
      {/* Background Overlay for Image Banner */}
      {isImageBg && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85 pointer-events-none transition-opacity duration-300 z-0"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {!isStaticSingle ? (
        // Continuous Non-Stop Seamless Scrolling Marquee Loop with Instant Hover Freeze
        <div className="relative z-10 flex items-center py-2 sm:py-2.5 overflow-hidden select-none">
          <div
            className="flex items-center whitespace-nowrap will-change-transform animate-marquee transition-opacity duration-300 gap-0"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-white/70 hover:text-white hover:bg-black/40 transition-colors duration-150 z-20"
            title="Close banner"
            aria-label="Close announcement bar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        // Static Centered Banner Mode (only when 1 single static announcement is active)
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center justify-center flex-wrap gap-2 sm:gap-3 text-center">
            {(primaryItem?.title || primaryItem?.sellerShopName) && (
              <span
                className="px-2.5 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase shrink-0 border shadow-xs"
                style={
                  primaryItem.accentColor
                    ? {
                        backgroundColor: primaryItem.accentColor,
                        borderColor: primaryItem.borderColor || primaryItem.accentColor,
                        color: '#ffffff',
                      }
                    : {
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                        color: '#ffffff',
                      }
                }
              >
                {primaryItem.title || `🌾 ${primaryItem.sellerShopName}`}
              </span>
            )}
            <span
              className="font-semibold text-xs tracking-tight text-white/95"
              style={primaryItem?.textColor ? { color: primaryItem.textColor } : undefined}
            >
              {primaryItem?.content}
            </span>
            {primaryItem?.contentTamil && (
              <span
                className="font-medium text-xs font-tamil hidden md:inline opacity-90 text-white/90"
                style={primaryItem?.textColor ? { color: primaryItem.textColor } : undefined}
              >
                {primaryItem.contentTamil}
              </span>
            )}
            {primaryItem?.linkUrl && (() => {
              const rawStaticLabel = primaryItem.linkLabel || 'Explore';
              const cleanStaticLabel = rawStaticLabel.replace(/\s*(?:→|->|›|>|—)\s*$/, '').trim();
              const staticButtonBg = primaryItem.buttonColor || '#ffffff';
              const staticButtonText = primaryItem.buttonTextColor || (staticButtonBg.toLowerCase() === '#ffffff' || staticButtonBg.toLowerCase() === '#fff' ? '#022c22' : '#ffffff');

              return (
                <Link
                  href={primaryItem.linkUrl}
                  className="group/btn inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-bold text-[11px] tracking-tight transition-all duration-200 ml-1 hover:brightness-110 hover:shadow-md hover:scale-[1.03] active:scale-95 border border-white/25 shadow-xs backdrop-blur-xs select-none shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: staticButtonBg,
                    borderColor: primaryItem.borderColor || 'rgba(255, 255, 255, 0.3)',
                    color: staticButtonText,
                  }}
                >
                  <span className="leading-none">{cleanStaticLabel}</span>
                  <ArrowRight className="w-3 h-3 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                </Link>
              );
            })()}
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-black/40 transition-colors duration-150 shrink-0"
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

