'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Eye,
  Palette,
  Loader2,
  AlertCircle,
  Store,
  Play,
  Pause,
  Image as ImageIcon,
  Upload,
  X,
  Sliders,
  RefreshCw,
  Sparkle,
  Sparkles,
  ShoppingBag,
  Search,
  Link2,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/modal';

interface Announcement {
  id: string;
  sellerId?: string | null;
  productId?: string | null;
  productName?: string | null;
  productSlug?: string | null;
  productPrice?: number | null;
  title: string | null;
  content: string;
  contentTamil: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
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
  createdAt: string;
  updatedAt: string;
}

interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: string;
  primaryImage: string | null;
  sellerId: string;
  sellerShopName: string;
  sellerSlug: string;
}

const GRADIENT_PRESETS = [
  {
    id: 'emerald_glow',
    name: '🍃 Fresh Emerald (Brand)',
    gradient: 'linear-gradient(90deg, #022c22 0%, #065f46 50%, #022c22 100%)',
    textColor: '#ffffff',
    accentColor: '#064e3b',
    buttonColor: '#059669',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'golden_palmyra',
    name: '🌾 Golden Palmyra',
    gradient: 'linear-gradient(90deg, #022c22 0%, #854d0e 50%, #022c22 100%)',
    textColor: '#ffffff',
    accentColor: '#422006',
    buttonColor: '#ca8a04',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'sunset_harvest',
    name: '🌅 Sunset Harvest',
    gradient: 'linear-gradient(90deg, #451a03 0%, #b45309 50%, #78350f 100%)',
    textColor: '#ffffff',
    accentColor: '#451a03',
    buttonColor: '#d97706',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'ocean_twilight',
    name: '🌊 Ocean Twilight',
    gradient: 'linear-gradient(90deg, #0f172a 0%, #1e40af 50%, #0284c7 100%)',
    textColor: '#ffffff',
    accentColor: '#172554',
    buttonColor: '#0284c7',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'heritage_purple',
    name: '🍇 Heritage Purple',
    gradient: 'linear-gradient(90deg, #3b0764 0%, #86198f 50%, #4a044e 100%)',
    textColor: '#ffffff',
    accentColor: '#3b0764',
    buttonColor: '#9333ea',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'festival_crimson',
    name: '🏮 Festival Crimson',
    gradient: 'linear-gradient(90deg, #4c0519 0%, #be123c 50%, #881337 100%)',
    textColor: '#ffffff',
    accentColor: '#4c0519',
    buttonColor: '#e11d48',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'midnight_aurora',
    name: '🌌 Midnight Aurora',
    gradient: 'linear-gradient(90deg, #020617 0%, #065f46 50%, #0f172a 100%)',
    textColor: '#ffffff',
    accentColor: '#020617',
    buttonColor: '#047857',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'fiery_amber',
    name: '🔥 Fiery Amber',
    gradient: 'linear-gradient(90deg, #7f1d1d 0%, #c2410c 50%, #9a3412 100%)',
    textColor: '#ffffff',
    accentColor: '#450a0a',
    buttonColor: '#ea580c',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'royal_berry',
    name: '🌸 Royal Berry',
    gradient: 'linear-gradient(90deg, #831843 0%, #db2777 50%, #9d174d 100%)',
    textColor: '#ffffff',
    accentColor: '#500724',
    buttonColor: '#db2777',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'cyber_indigo',
    name: '⚡ Cyber Indigo',
    gradient: 'linear-gradient(90deg, #1e1b4b 0%, #4338ca 50%, #312e81 100%)',
    textColor: '#ffffff',
    accentColor: '#1e1b4b',
    buttonColor: '#6366f1',
    buttonTextColor: '#ffffff',
  },
];

const SOLID_PRESETS = [
  { id: 'emerald', name: 'Fresh Emerald', color: '#064e3b', text: '#ffffff', accent: '#022c22', button: '#059669', buttonText: '#ffffff' },
  { id: 'amber', name: 'Harvest Amber', color: '#78350f', text: '#ffffff', accent: '#451a03', button: '#d97706', buttonText: '#ffffff' },
  { id: 'blue', name: 'Deep Ocean', color: '#1e3a8a', text: '#ffffff', accent: '#172554', button: '#2563eb', buttonText: '#ffffff' },
  { id: 'purple', name: 'Heritage Purple', color: '#581c87', text: '#ffffff', accent: '#3b0764', button: '#9333ea', buttonText: '#ffffff' },
  { id: 'crimson', name: 'Festival Crimson', color: '#881337', text: '#ffffff', accent: '#4c0519', button: '#e11d48', buttonText: '#ffffff' },
  { id: 'slate', name: 'Midnight Slate', color: '#0f172a', text: '#ffffff', accent: '#020617', button: '#475569', buttonText: '#ffffff' },
  { id: 'gold', name: 'Golden Palmyra', color: '#713f12', text: '#ffffff', accent: '#422006', button: '#ca8a04', buttonText: '#ffffff' },
];

const BUTTON_PRESETS = [
  'View Product',
  'Shop Now',
  'Order Today',
  'Buy Now',
  'Explore Offers',
  'Pre-Order Now',
  'Special Deal',
  'Learn More',
];

const BUTTON_THEME_PRESETS = [
  { name: 'Pure White (Pop)', bg: '#ffffff', text: '#022c22', border: '#ffffff' },
  { name: 'Golden Palmyra', bg: '#f59e0b', text: '#451a03', border: '#fbbf24' },
  { name: 'Emerald Glow', bg: '#10b981', text: '#ffffff', border: '#34d399' },
  { name: 'Frosted Glass', bg: 'rgba(255, 255, 255, 0.22)', text: '#ffffff', border: 'rgba(255, 255, 255, 0.4)' },
  { name: 'Festival Crimson', bg: '#e11d48', text: '#ffffff', border: '#f43f5e' },
  { name: 'Electric Indigo', bg: '#4f46e5', text: '#ffffff', border: '#6366f1' },
  { name: 'Midnight Dark', bg: '#0f172a', text: '#ffffff', border: '#334155' },
];

export default function SellerAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [shopName, setShopName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentTamil, setContentTamil] = useState('');
  const [theme, setTheme] = useState('emerald_glow');
  const [isMarquee, setIsMarquee] = useState(true);
  const [speed, setSpeed] = useState(28);
  const [isActive, setIsActive] = useState(true);

  // Product Link & Action Button States
  const [linkType, setLinkType] = useState<'PRODUCT' | 'CUSTOM' | 'NONE'>('PRODUCT');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<ProductSearchResult[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [linkUrl, setLinkUrl] = useState('/products');
  const [linkLabel, setLinkLabel] = useState('View Product');
  const [buttonTextColor, setButtonTextColor] = useState('#022c22');
  const [buttonColor, setButtonColor] = useState('#ffffff');

  // Custom Theme & Background Mode ('GRADIENT' | 'COLOR' | 'IMAGE')
  const [bgType, setBgType] = useState<'GRADIENT' | 'COLOR' | 'IMAGE'>('GRADIENT');
  const [bgColor, setBgColor] = useState(GRADIENT_PRESETS[0].gradient);
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#064e3b');
  const [borderColor, setBorderColor] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(60);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Gradient Generator State
  const [gradientColor1, setGradientColor1] = useState('#022c22');
  const [gradientColor2, setGradientColor2] = useState('#065f46');
  const [gradientAngle, setGradientAngle] = useState('90deg');

  // Messages & Modals
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/seller/announcements');
      if (!res.ok) throw new Error('Failed to load shop announcements');
      const data = await res.json();
      setAnnouncements(data.announcements || []);
      if (data.shopName) setShopName(data.shopName);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not load announcements from server.');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (q: string) => {
    try {
      setSearchingProducts(true);
      const params = new URLSearchParams();
      params.set('sellerOnly', 'true');
      if (q) params.set('q', q);
      const res = await fetch(`/api/products/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProductSearchResults(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching seller products:', err);
    } finally {
      setSearchingProducts(false);
    }
  };

  const handleApplyGradientPreset = (preset: (typeof GRADIENT_PRESETS)[0]) => {
    setBgType('GRADIENT');
    setTheme(preset.id);
    setBgColor(preset.gradient);
    setTextColor(preset.textColor);
    setAccentColor(preset.accentColor);
    setButtonColor(preset.buttonColor);
    setButtonTextColor(preset.buttonTextColor || '#ffffff');
  };

  const handleApplySolidPreset = (preset: (typeof SOLID_PRESETS)[0]) => {
    setBgType('COLOR');
    setTheme(preset.id);
    setBgColor(preset.color);
    setTextColor(preset.text);
    setAccentColor(preset.accent);
    setButtonColor(preset.button);
    setButtonTextColor(preset.buttonText || '#ffffff');
  };

  const handleUpdateCustomGradient = (c1: string, c2: string, angle: string) => {
    setGradientColor1(c1);
    setGradientColor2(c2);
    setGradientAngle(angle);
    const gradStr = `linear-gradient(${angle}, ${c1} 0%, ${c2} 100%)`;
    setBgColor(gradStr);
    setBgType('GRADIENT');
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('🌾 Fresh Harvest Offer');
    setContent('Welcome to our shop! Fresh authentic village items harvested directly from our local farmers.');
    setContentTamil('எங்கள் கடைக்கு வரவேற்கிறோம்! புதிய தூய கிராமத்து உற்பத்திப் பொருட்கள்.');
    setLinkType('PRODUCT');
    setSelectedProductId(null);
    setSelectedProduct(null);
    setProductSearchQuery('');
    setProductSearchResults([]);
    searchProducts('');
    setLinkUrl('/products');
    setLinkLabel('View Product');
    setTheme('emerald_glow');
    setBgType('GRADIENT');
    setBgColor(GRADIENT_PRESETS[0].gradient);
    setTextColor('#ffffff');
    setAccentColor('#064e3b');
    setBorderColor('');
    setButtonColor('#ffffff');
    setButtonTextColor('#022c22');
    setBgImage('');
    setOverlayOpacity(60);
    setIsMarquee(true);
    setSpeed(28);
    setIsActive(true);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setContent(item.content);
    setContentTamil(item.contentTamil || '');
    const cleanEditLabel = (item.linkLabel || 'View Product').replace(/\s*(?:→|->|›|>|—)\s*$/, '').trim();
    setLinkLabel(cleanEditLabel || 'View Product');
    setTheme(item.theme || 'emerald');

    if (item.productId) {
      setLinkType('PRODUCT');
      setSelectedProductId(item.productId);
      setSelectedProduct({
        id: item.productId,
        name: item.productName || 'Linked Product',
        slug: item.productSlug || '',
        price: item.productPrice || 0,
        stock: 1,
        status: 'ACTIVE',
        primaryImage: null,
        sellerId: item.sellerId || '',
        sellerShopName: shopName || 'My Shop',
        sellerSlug: '',
      });
      setLinkUrl(`/products/${item.productSlug || ''}`);
    } else if (item.linkUrl) {
      setLinkType('CUSTOM');
      setSelectedProductId(null);
      setSelectedProduct(null);
      setLinkUrl(item.linkUrl);
    } else {
      setLinkType('NONE');
      setSelectedProductId(null);
      setSelectedProduct(null);
      setLinkUrl('');
    }

    setProductSearchQuery('');
    searchProducts('');

    const itemBgType = (item.bgType as 'GRADIENT' | 'COLOR' | 'IMAGE') || (item.bgColor?.includes('gradient') ? 'GRADIENT' : 'COLOR');
    setBgType(itemBgType);
    setBgColor(item.bgColor || GRADIENT_PRESETS[0].gradient);
    setTextColor(item.textColor || '#ffffff');
    setAccentColor(item.accentColor || '#064e3b');
    setBorderColor(item.borderColor || '');
    const editBtnBg = item.buttonColor || '#ffffff';
    setButtonColor(editBtnBg);
    setButtonTextColor(item.buttonTextColor || (editBtnBg.toLowerCase() === '#ffffff' || editBtnBg.toLowerCase() === '#fff' ? '#022c22' : '#ffffff'));
    setBgImage(item.bgImage || '');
    setOverlayOpacity(
      item.overlayOpacity !== undefined && item.overlayOpacity !== null ? item.overlayOpacity : 60
    );
    setIsMarquee(item.isMarquee);
    setSpeed(item.speed || 28);
    setIsActive(item.isActive);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setErrorMessage(null);
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || (!data.urls?.length && !data.url)) {
        throw new Error(data.error || 'Failed to upload background image');
      }

      const uploadedUrl = data.url || data.urls[0];
      setBgImage(uploadedUrl);
      setBgType('IMAGE');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('Please enter the announcement message');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      let finalProductId: string | null = null;
      let finalLinkUrl: string | null = null;
      let finalLinkLabel: string | null = null;

      if (linkType === 'PRODUCT') {
        finalProductId = selectedProductId;
        finalLinkUrl = selectedProduct?.slug ? `/products/${selectedProduct.slug}` : (linkUrl.trim() || null);
        finalLinkLabel = linkLabel.trim() || 'View Product →';
      } else if (linkType === 'CUSTOM') {
        finalProductId = null;
        finalLinkUrl = linkUrl.trim() || null;
        finalLinkLabel = linkLabel.trim() || 'Explore Products →';
      } else {
        finalProductId = null;
        finalLinkUrl = null;
        finalLinkLabel = null;
      }

      const payload = {
        productId: finalProductId,
        title: title.trim() || null,
        content: content.trim(),
        contentTamil: contentTamil.trim() || null,
        linkUrl: finalLinkUrl,
        linkLabel: finalLinkLabel,
        theme,
        bgType,
        bgColor: bgType === 'IMAGE' ? null : bgColor,
        textColor: textColor || null,
        accentColor: accentColor || null,
        borderColor: borderColor || null,
        buttonColor: buttonColor || null,
        buttonTextColor: buttonTextColor || null,
        bgImage: bgType === 'IMAGE' ? bgImage : null,
        overlayOpacity: Number(overlayOpacity),
        isMarquee,
        speed: Number(speed),
        isActive,
      };

      const url = editingId ? `/api/seller/announcements/${editingId}` : '/api/seller/announcements';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save announcement');
      }

      setSuccessMessage(editingId ? 'Shop announcement updated!' : 'Shop announcement published successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);

      setIsFormOpen(false);
      await fetchAnnouncements();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('announcements-updated'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: Announcement, specificStatus?: boolean) => {
    try {
      const nextStatus = specificStatus !== undefined ? specificStatus : !item.isActive;
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, isActive: nextStatus } : a))
      );

      const res = await fetch(`/api/seller/announcements/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      if (!res.ok) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, isActive: item.isActive } : a))
        );
        setErrorMessage('Failed to update shop announcement status');
      } else {
        setSuccessMessage(
          nextStatus
            ? 'Shop announcement started and is now LIVE on top bar!'
            : 'Shop announcement stopped and temporarily hidden from top bar.'
        );
        setTimeout(() => setSuccessMessage(null), 3500);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('announcements-updated'));
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error changing announcement status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    const targetId = deleteModalId;
    try {
      setIsDeleting(true);
      setDeletingIds((prev) => [...prev, targetId]);
      setDeleteModalId(null);

      const res = await fetch(`/api/seller/announcements/${targetId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setDeletingIds((prev) => prev.filter((id) => id !== targetId));
        throw new Error(data.error || 'Failed to delete announcement');
      }

      setTimeout(() => {
        setAnnouncements((prev) => prev.filter((a) => a.id !== targetId));
        setDeletingIds((prev) => prev.filter((id) => id !== targetId));
      }, 300);

      setSuccessMessage('Shop announcement deleted.');
      setTimeout(() => setSuccessMessage(null), 3000);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('announcements-updated'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete announcement');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActionButton = linkType !== 'NONE' && (linkType === 'PRODUCT' ? (selectedProduct || linkLabel) : (linkUrl || linkLabel));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Shop Storefront Announcement
            </h1>
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Store className="w-3 h-3" /> Storefront Top Banner
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Display continuous scrolling announcements with direct product links, custom gradient themes, and action buttons on the top bar.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 font-bold shadow-sm">
          <Plus className="w-4 h-4" /> Create Shop Announcement
        </Button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Create / Edit Form Panel */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-6 transition-colors duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                {editingId ? 'Edit Shop Announcement' : 'Create Shop Announcement / Marquee'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Shown to all buyers across the site top bar and your seller storefront.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Live Storefront Unified Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-700 dark:text-emerald-400" /> Live Storefront Banner Preview:
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500">
                Mode: {isMarquee ? 'Continuous Scrolling Marquee' : 'Static Highlight Banner'} • Style: {bgType}
              </span>
            </div>

            {/* Continuous Full-Width Top Bar Preview */}
            <div
              className="relative rounded-2xl overflow-hidden py-3 px-6 shadow-sm border border-black/20 transition-all duration-200 flex items-center justify-center text-center text-white"
              style={{
                background: bgType === 'IMAGE' && bgImage ? undefined : bgColor,
                backgroundImage: bgType === 'IMAGE' && bgImage ? `url("${bgImage}")` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderColor: borderColor || 'rgba(0,0,0,0.2)',
              }}
            >
              {/* Overlay for Image Background */}
              {bgType === 'IMAGE' && bgImage && (
                <div
                  className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85 pointer-events-none transition-opacity duration-200"
                  style={{ opacity: overlayOpacity / 100 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-center flex-wrap gap-2.5 sm:gap-3 text-xs font-medium">
                {title && (
                  <span
                    className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-xs border"
                    style={{
                      backgroundColor: accentColor || 'rgba(0,0,0,0.4)',
                      borderColor: borderColor || accentColor || 'rgba(255,255,255,0.25)',
                      color: '#ffffff',
                    }}
                  >
                    {title}
                  </span>
                )}
                <span className="font-semibold text-xs tracking-tight" style={{ color: textColor || '#ffffff' }}>
                  {content || 'Your shop message will appear here...'}
                </span>
                {contentTamil && (
                  <>
                    <span className="opacity-40 select-none text-white/70">•</span>
                    <span className="font-medium text-xs font-tamil text-white/90" style={{ color: textColor || '#ffffff' }}>
                      {contentTamil}
                    </span>
                  </>
                )}
                {hasActionButton && (() => {
                  const rawPreviewLabel = linkLabel || 'View Product';
                  const cleanPreviewLabel = rawPreviewLabel.replace(/\s*(?:→|->|›|>|—)\s*$/, '').trim();
                  const btnBg = buttonColor || '#ffffff';
                  const btnTxt = buttonTextColor || (btnBg.toLowerCase() === '#ffffff' || btnBg.toLowerCase() === '#fff' ? '#022c22' : '#ffffff');

                  return (
                    <span
                      className="group/btn inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-tight border border-white/25 shadow-xs backdrop-blur-xs transition-all duration-200 hover:scale-[1.03] hover:shadow-md cursor-pointer select-none"
                      style={{
                        backgroundColor: btnBg,
                        borderColor: borderColor || 'rgba(255,255,255,0.3)',
                        color: btnTxt,
                      }}
                    >
                      <span className="leading-none">{cleanPreviewLabel}</span>
                      <ArrowRight className="w-3 h-3 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6 pt-2">
            <div className="space-y-1.5">
              <Input
                label="Badge / Offer Tag (Optional)"
                placeholder="e.g. 🌾 Pure Harvest, 🔥 Fresh Stock"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">English Announcement Message *</label>
              <textarea
                rows={2}
                placeholder="e.g. 100% Pure Organic Palmyra Jaggery & Sweet Honey now in stock! Free sample with every order."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Tamil Message (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. 100% தூய இயற்கை பனங்கற்கண்டு மற்றும் தேன் இப்போது கிடைக்கும்!"
                value={contentTamil}
                onChange={(e) => setContentTamil(e.target.value)}
                className="w-full text-xs font-tamil rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* PRODUCT REDIRECT BUTTON & DESTINATION SECTION */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100 dark:border-emerald-900/40">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Link to Your Shop Product / Page
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Connect this announcement to one of your shop's products so shoppers can view and purchase it directly.
                  </p>
                </div>

                {/* 3-Mode Destination Switcher */}
                <div className="inline-flex p-1 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setLinkType('PRODUCT');
                      if (!productSearchResults.length) searchProducts('');
                    }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      linkType === 'PRODUCT'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>My Product</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkType('CUSTOM')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      linkType === 'CUSTOM'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Custom URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkType('NONE')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      linkType === 'NONE'
                        ? 'bg-gray-700 text-white shadow-xs'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>No Button</span>
                  </button>
                </div>
              </div>

              {/* Mode 1: Link to Product */}
              {linkType === 'PRODUCT' && (
                <div className="space-y-3">
                  {selectedProduct ? (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {selectedProduct.primaryImage ? (
                          <img
                            src={selectedProduct.primaryImage}
                            alt={selectedProduct.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                              {selectedProduct.name}
                            </p>
                            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              Rs. {selectedProduct.price.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                            Target URL: /products/{selectedProduct.slug}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId(null);
                            setSelectedProduct(null);
                            searchProducts('');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId(null);
                            setSelectedProduct(null);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Remove product link"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300">
                        Select a Product from Your Shop:
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Filter your products by title or keyword..."
                          value={productSearchQuery}
                          onChange={(e) => {
                            setProductSearchQuery(e.target.value);
                            searchProducts(e.target.value);
                          }}
                          className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-emerald-500"
                        />
                        {searchingProducts && (
                          <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-brand-600" />
                        )}
                      </div>

                      {/* Product Search Results Dropdown List */}
                      <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700/60 shadow-xs">
                        {productSearchResults.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400">
                            {searchingProducts ? 'Searching shop products...' : 'No products found in your shop.'}
                          </div>
                        ) : (
                          productSearchResults.map((prod) => (
                            <div
                              key={prod.id}
                              onClick={() => {
                                setSelectedProductId(prod.id);
                                setSelectedProduct(prod);
                                setLinkUrl(`/products/${prod.slug}`);
                                if (!linkLabel || linkLabel === 'Explore Products →') {
                                  setLinkLabel('View Product →');
                                }
                              }}
                              className="p-2.5 flex items-center justify-between gap-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {prod.primaryImage ? (
                                  <img
                                    src={prod.primaryImage}
                                    alt={prod.name}
                                    className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 shrink-0">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                                    {prod.name}
                                  </p>
                                  <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                                    Rs. {prod.price.toLocaleString()} • In stock
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors shrink-0"
                              >
                                Select
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Custom URL */}
              {linkType === 'CUSTOM' && (
                <div className="space-y-1.5">
                  <Input
                    label="Custom Page Link URL"
                    placeholder="e.g. /products, #products"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>
              )}

              {/* Button Label & Presets (if button enabled) */}
              {linkType !== 'NONE' && (
                <div className="space-y-3 pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                        Action Button Label
                      </label>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">
                        Quick presets below
                      </span>
                    </div>
                    <Input
                      placeholder="e.g. View Product →, Shop Now →, Buy Now →"
                      value={linkLabel}
                      onChange={(e) => setLinkLabel(e.target.value)}
                    />
                  </div>

                  {/* Preset Pills */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 block">
                      Quick Label Suggestions:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {BUTTON_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setLinkLabel(preset)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                            linkLabel === preset
                              ? 'bg-brand-600 dark:bg-emerald-600 text-white border-brand-600 dark:border-emerald-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-brand-400'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Button Theme Presets */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 block">
                      1-Click Button Theme Presets:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {BUTTON_THEME_PRESETS.map((themePreset) => {
                        const isSelected =
                          buttonColor.toLowerCase() === themePreset.bg.toLowerCase() &&
                          buttonTextColor.toLowerCase() === themePreset.text.toLowerCase();

                        return (
                          <button
                            key={themePreset.name}
                            type="button"
                            onClick={() => {
                              setButtonColor(themePreset.bg);
                              setButtonTextColor(themePreset.text);
                            }}
                            className={`p-2 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                              isSelected
                                ? 'border-brand-500 dark:border-emerald-500 ring-2 ring-brand-500/20 bg-brand-50/50 dark:bg-emerald-950/30'
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-gray-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300 truncate">
                              {themePreset.name}
                            </span>
                            <div className="flex items-center">
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs"
                                style={{
                                  backgroundColor: themePreset.bg,
                                  color: themePreset.text,
                                  borderColor: themePreset.border || 'rgba(0,0,0,0.1)',
                                }}
                              >
                                <span>Preview</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Button Colors Fine-Tuning */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300 block">
                        Custom Background Color
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={buttonColor.startsWith('#') ? buttonColor : '#ffffff'}
                          onChange={(e) => setButtonColor(e.target.value)}
                          className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          value={buttonColor}
                          onChange={(e) => setButtonColor(e.target.value)}
                          className="w-full text-[11px] font-mono rounded-lg border border-gray-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300 block">
                        Custom Text Color
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={buttonTextColor.startsWith('#') ? buttonTextColor : '#022c22'}
                          onChange={(e) => setButtonTextColor(e.target.value)}
                          className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          value={buttonTextColor}
                          onChange={(e) => setButtonTextColor(e.target.value)}
                          className="w-full text-[11px] font-mono rounded-lg border border-gray-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Display & Speed Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Display Style</label>
                <select
                  value={isMarquee ? 'marquee' : 'static'}
                  onChange={(e) => setIsMarquee(e.target.value === 'marquee')}
                  className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 dark:focus:ring-emerald-500 transition-colors"
                >
                  <option value="marquee">Scrolling Marquee (Animated Loop)</option>
                  <option value="static">Static Highlight Banner (Centered)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Scroll Speed</label>
                <select
                  value={speed}
                  disabled={!isMarquee}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 dark:focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                >
                  <option value={18}>Fast (18s per loop)</option>
                  <option value={28}>Normal (28s per loop)</option>
                  <option value={42}>Slow (42s per loop)</option>
                  <option value={60}>Gentle & Slow (60s)</option>
                </select>
              </div>
            </div>

            {/* Custom Theme & Background Customization Section */}
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Announcement Color Theme & Background
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Choose a vibrant gradient theme, solid brand color, or an uploaded background image.
                  </p>
                </div>

                {/* 3-Mode Toggle: Gradient Theme vs Solid Color vs Image */}
                <div className="inline-flex p-1 bg-gray-200 dark:bg-slate-700 rounded-xl text-xs font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setBgType('GRADIENT');
                      if (!bgColor.includes('gradient')) {
                        setBgColor(GRADIENT_PRESETS[0].gradient);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      bgType === 'GRADIENT'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>Gradient Theme</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBgType('COLOR');
                      if (bgColor.includes('gradient')) {
                        setBgColor('#064e3b');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      bgType === 'COLOR'
                        ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 shadow-xs'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Solid Color</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgType('IMAGE')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      bgType === 'IMAGE'
                        ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 shadow-xs'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image</span>
                  </button>
                </div>
              </div>

              {/* Option 1: Gradient Theme Mode */}
              {bgType === 'GRADIENT' && (
                <div className="space-y-4 pt-1">
                  {/* Preset Gradients Grid */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300">
                      Popular Gradient Themes:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                      {GRADIENT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyGradientPreset(preset)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            bgColor === preset.gradient
                              ? 'border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/30 dark:ring-emerald-400/30 shadow-sm'
                              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div
                            className="h-6 w-full rounded-lg mb-1.5 shadow-xs border border-white/20"
                            style={{ background: preset.gradient }}
                          />
                          <p className="text-[10px] font-bold text-gray-900 dark:text-slate-100 truncate">
                            {preset.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom 2-Color Gradient Builder */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-3">
                    <label className="text-[11px] font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Custom 2-Color Gradient Generator:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Start Color */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">
                          Start Color (From)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={gradientColor1}
                            onChange={(e) => handleUpdateCustomGradient(e.target.value, gradientColor2, gradientAngle)}
                            className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={gradientColor1}
                            onChange={(e) => handleUpdateCustomGradient(e.target.value, gradientColor2, gradientAngle)}
                            className="w-full text-[11px] font-mono rounded-lg border border-gray-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      {/* End Color */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">
                          End Color (To)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={gradientColor2}
                            onChange={(e) => handleUpdateCustomGradient(gradientColor1, e.target.value, gradientAngle)}
                            className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={gradientColor2}
                            onChange={(e) => handleUpdateCustomGradient(gradientColor1, e.target.value, gradientAngle)}
                            className="w-full text-[11px] font-mono rounded-lg border border-gray-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      {/* Direction */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">
                          Direction / Angle
                        </span>
                        <select
                          value={gradientAngle}
                          onChange={(e) => handleUpdateCustomGradient(gradientColor1, gradientColor2, e.target.value)}
                          className="w-full text-[11px] rounded-lg border border-gray-300 dark:border-slate-700 p-1.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                        >
                          <option value="90deg">Horizontal (Left → Right)</option>
                          <option value="135deg">Diagonal (Top-Left → Bottom-Right)</option>
                          <option value="180deg">Vertical (Top → Bottom)</option>
                          <option value="45deg">Diagonal (Bottom-Left → Top-Right)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Text, Badge Colors */}
                  <div className="space-y-2 pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300">
                      Element Colors:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Text Color */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">Text</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full text-[11px] font-mono rounded-lg border border-gray-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      {/* Accent / Badge Color */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">Badge Tag</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-full text-[11px] font-mono rounded-lg border border-gray-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      {/* Border Color */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">Border (Optional)</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={borderColor || '#000000'}
                            onChange={(e) => setBorderColor(e.target.value)}
                            className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            placeholder="Optional"
                            value={borderColor}
                            onChange={(e) => setBorderColor(e.target.value)}
                            className="w-full text-[11px] font-mono rounded-lg border border-gray-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Option 2: Solid Color Mode */}
              {bgType === 'COLOR' && (
                <div className="space-y-4 pt-1">
                  {/* Preset Themes Grid */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300">
                      Solid Color Presets:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {SOLID_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplySolidPreset(preset)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            bgColor === preset.color
                              ? 'border-brand-600 dark:border-emerald-500 ring-2 ring-brand-500/30 dark:ring-emerald-400/30 shadow-xs'
                              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div
                            className="h-5 w-full rounded-md mb-1.5 shadow-xs border border-black/10"
                            style={{ backgroundColor: preset.color }}
                          />
                          <p className="text-[10px] font-bold text-gray-900 dark:text-slate-100 truncate">
                            {preset.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fine-Tuned Custom Color Pickers */}
                  <div className="space-y-2 pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300">
                      Fine-Tune Colors:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Background Color */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">
                          Background Color
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-full text-[11px] font-mono rounded-lg border border-gray-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      {/* Text Color */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">
                          Text Color
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full text-[11px] font-mono rounded-lg border border-gray-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      {/* Accent / Badge Color */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">
                          Badge Tag
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-7 h-7 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-full text-[11px] font-mono rounded-lg border border-gray-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Option 3: Image Background Mode */}
              {bgType === 'IMAGE' && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Upload / Image Picker */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Background Image:</span>
                        {bgImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setBgImage('');
                              setBgType('GRADIENT');
                            }}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 text-[10px] font-semibold"
                          >
                            Remove Image
                          </button>
                        )}
                      </label>

                      {bgImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 h-28 group">
                          <img
                            src={bgImage}
                            alt="Background Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 bg-white/90 hover:bg-white text-gray-900 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBgImage('');
                                setBgType('GRADIENT');
                              }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-brand-500 dark:hover:border-emerald-500 cursor-pointer bg-white dark:bg-slate-800 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            {uploadingImage ? (
                              <Loader2 className="w-6 h-6 animate-spin text-brand-600 dark:text-emerald-400" />
                            ) : (
                              <Upload className="w-6 h-6 text-gray-400 dark:text-slate-500" />
                            )}
                            <p className="text-xs font-bold text-gray-700 dark:text-slate-300">
                              {uploadingImage ? 'Uploading image...' : 'Click or drop to upload background image'}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500">
                              PNG, JPG, WebP up to 5MB (Panoramic banner aspect ratio works best)
                            </p>
                          </div>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-gray-500 dark:text-slate-400">
                          Or direct image URL:
                        </label>
                        <Input
                          placeholder="e.g. /uploads/banner.jpg or https://..."
                          value={bgImage}
                          onChange={(e) => {
                            setBgImage(e.target.value);
                            if (e.target.value) setBgType('IMAGE');
                          }}
                        />
                      </div>
                    </div>

                    {/* Image Settings: Overlay Opacity */}
                    <div className="space-y-3">
                      <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-slate-200">
                          <span className="flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5 text-brand-600 dark:text-emerald-400" />
                            Dark Contrast Overlay Opacity:
                          </span>
                          <span className="font-mono text-brand-700 dark:text-emerald-400 font-black">
                            {overlayOpacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={95}
                          step={5}
                          value={overlayOpacity}
                          onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                          className="w-full accent-brand-600 dark:accent-emerald-500 cursor-pointer"
                        />
                        <p className="text-[10px] text-gray-400 dark:text-slate-500">
                          Darkens the image automatically so text and buttons remain easily readable on any image.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">
                            Text Color
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-6 h-6 rounded border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent"
                            />
                            <span className="text-[10px] font-mono text-gray-600 dark:text-slate-300 truncate">
                              {textColor}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block">
                            Badge Color
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="w-6 h-6 rounded border border-gray-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent"
                            />
                            <span className="text-[10px] font-mono text-gray-600 dark:text-slate-300 truncate">
                              {accentColor}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active Switch & Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-900 dark:text-slate-100">
                  Enable & Display Live on Top Announcement Bar
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={saving} className="gap-2 font-bold">
                  {editingId ? 'Save Changes' : 'Publish Announcement'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-150">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
              Your Shop Announcements ({announcements.length})
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              Active announcements from your shop are shown on both your seller storefront and the global top marquee bar.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-emerald-400" />
            <span>Loading shop announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 text-xs">
            No announcements created yet. Click "Create Shop Announcement" to highlight discounts and new arrivals!
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {announcements.map((item) => {
              const isDeletingThis = deletingIds.includes(item.id);
              const isImageBg = item.bgType === 'IMAGE' && Boolean(item.bgImage);
              const isGradient = item.bgType === 'GRADIENT' || item.bgColor?.includes('gradient');

              return (
                <div
                  key={item.id}
                  className={`p-6 transition-all duration-300 ease-in-out flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                    isDeletingThis
                      ? 'opacity-0 -translate-x-8 max-h-0 py-0 my-0 overflow-hidden pointer-events-none'
                      : 'opacity-100 translate-x-0 hover:bg-gray-50/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="space-y-2.5 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Active Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300 shadow-xs ${
                          item.isActive
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100/70 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'
                        }`}
                      >
                        {item.isActive ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                            <span>Active on Storefront</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                            <span>Stopped / Hidden</span>
                          </>
                        )}
                      </span>

                      {/* Mode Badge */}
                      <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                        {item.isMarquee ? '🔄 Scrolling Marquee' : '📌 Static Banner'}
                      </span>

                      {/* Theme / BG Preview Badge */}
                      {isImageBg ? (
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                          <ImageIcon className="w-3 h-3" />
                          <span>Image BG</span>
                          {item.bgImage && (
                            <img
                              src={item.bgImage}
                              alt="thumb"
                              className="w-3.5 h-3.5 rounded-full object-cover border border-indigo-300"
                            />
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                            style={{ background: item.bgColor || '#064e3b' }}
                          />
                          <span className="capitalize">
                            {isGradient ? '🌈 Gradient' : item.theme}
                          </span>
                        </span>
                      )}
                    </div>

                    <div>
                      {item.title && (
                        <span className="text-xs font-bold text-gray-900 dark:text-slate-100 mr-2 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700">
                          {item.title}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 leading-relaxed">
                        {item.content}
                      </span>
                    </div>

                    {item.contentTamil && (
                      <p className="text-xs font-tamil text-gray-500 dark:text-slate-400">
                        {item.contentTamil}
                      </p>
                    )}

                    {/* Linked Product / URL & Action Button Preview */}
                    <div className="flex items-center gap-3 flex-wrap pt-1">
                      {item.productName ? (
                        <Link
                          href={item.linkUrl || `/products/${item.productSlug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full hover:underline shadow-2xs"
                        >
                          <ShoppingBag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Product: {item.productName} {item.productPrice ? `(Rs. ${item.productPrice.toLocaleString()})` : ''}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </Link>
                      ) : item.linkUrl ? (
                        <div className="flex items-center gap-1 text-[11px] text-brand-700 dark:text-emerald-400 font-semibold">
                          <ExternalLink className="w-3 h-3" />
                          <span>Link: {item.linkUrl}</span>
                        </div>
                      ) : null}

                      {item.linkLabel && (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs"
                          style={{
                            backgroundColor: item.buttonColor || '#059669',
                            color: item.buttonTextColor || '#ffffff',
                            borderColor: item.borderColor || item.buttonColor || 'rgba(255,255,255,0.3)',
                          }}
                        >
                          <span>{item.linkLabel}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Explicit Action Controls: Stop / Start, Edit, Delete */}
                  <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-slate-800 flex-wrap">
                    {item.isActive ? (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item, false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all shadow-xs active:scale-95"
                        title="Temporarily stop and hide announcement from storefront"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item, true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-xs active:scale-95"
                        title="Start and display announcement live on storefront"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start / Resume</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95"
                      title="Edit shop announcement details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteModalId(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all shadow-xs active:scale-95"
                      title="Permanently delete shop announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteModalId}
        onClose={() => setDeleteModalId(null)}
        onConfirm={handleDelete}
        title="Delete Shop Announcement"
        message="Are you sure you want to permanently delete this storefront announcement?"
        confirmText="Yes, Delete Announcement"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
