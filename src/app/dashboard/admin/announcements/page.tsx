'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/modal';

interface Announcement {
  id: string;
  sellerId?: string | null;
  title: string | null;
  content: string;
  contentTamil: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  theme: string;
  isMarquee: boolean;
  speed: number;
  isActive: boolean;
  displayOrder: number;
  targetAudience?: string;
  createdAt: string;
  updatedAt: string;
}

const THEME_OPTIONS = [
  { id: 'emerald', name: 'Fresh Green (Brand)', color: 'bg-emerald-900 text-emerald-100' },
  { id: 'amber', name: 'Harvest Amber', color: 'bg-amber-800 text-amber-100' },
  { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-900 text-blue-100' },
  { id: 'purple', name: 'Heritage Purple', color: 'bg-purple-900 text-purple-100' },
  { id: 'red', name: 'Festival Red', color: 'bg-rose-900 text-rose-100' },
  { id: 'slate', name: 'Midnight Charcoal', color: 'bg-slate-900 text-slate-100' },
  { id: 'gold', name: 'Golden Palmyra', color: 'bg-yellow-900 text-yellow-100' },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentTamil, setContentTamil] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('Explore →');
  const [theme, setTheme] = useState('emerald');
  const [isMarquee, setIsMarquee] = useState(true);
  const [speed, setSpeed] = useState(28);
  const [isActive, setIsActive] = useState(true);
  const [targetAudience, setTargetAudience] = useState('CUSTOMERS');

  // Messages & Modals
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/announcements');
      if (!res.ok) throw new Error('Failed to load announcements');
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not load announcements from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('🌾 Seasonal Offer');
    setContent('Special Sinhala & Tamil New Year Offer: Enjoy Free Delivery on orders over Rs. 3,500! • Use Code: VILLAGE2026');
    setContentTamil('ரூ. 3,500க்கு மேற்பட்ட அனைத்து கட்டளைகளுக்கும் இலவச விநியோகம்! • தூய கிராமத்து உற்பத்திப் பொருட்கள்.');
    setLinkUrl('/products');
    setLinkLabel('Shop Now →');
    setTheme('emerald');
    setIsMarquee(true);
    setSpeed(28);
    setIsActive(true);
    setTargetAudience('CUSTOMERS');
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setContent(item.content);
    setContentTamil(item.contentTamil || '');
    setLinkUrl(item.linkUrl || '');
    setLinkLabel(item.linkLabel || '');
    setTheme(item.theme || 'emerald');
    setIsMarquee(item.isMarquee);
    setSpeed(item.speed || 28);
    setIsActive(item.isActive);
    setTargetAudience(item.targetAudience || 'CUSTOMERS');
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('Please enter the announcement content text');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      const payload = {
        title: title.trim() || null,
        content: content.trim(),
        contentTamil: contentTamil.trim() || null,
        linkUrl: linkUrl.trim() || null,
        linkLabel: linkLabel.trim() || null,
        theme,
        isMarquee,
        speed: Number(speed),
        isActive,
        targetAudience,
      };

      const url = editingId ? `/api/admin/announcements/${editingId}` : '/api/admin/announcements';
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

      setSuccessMessage(editingId ? 'Announcement updated successfully!' : 'New announcement created and published!');
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

  const handleToggleStatus = async (item: Announcement) => {
    try {
      const nextStatus = !item.isActive;
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, isActive: nextStatus } : a))
      );

      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      if (!res.ok) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, isActive: item.isActive } : a))
        );
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('announcements-updated'));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/announcements/${deleteModalId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete announcement');
      }

      setAnnouncements((prev) => prev.filter((a) => a.id !== deleteModalId));
      setDeleteModalId(null);
      setSuccessMessage('Announcement deleted.');
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

  const previewTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Announcement Bar & Marquee
            </h1>
            <span className="bg-brand-50 dark:bg-emerald-950/60 text-brand-700 dark:text-emerald-400 border border-brand-200 dark:border-emerald-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live Promotional Ticker
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Display continuous scrolling promotional text, festival discounts, and broadcast alerts at the very top of the website.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 font-bold shadow-sm">
          <Plus className="w-4 h-4" /> Create Announcement
        </Button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Create / Edit Form Modal or Panel */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6 transition-colors duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                {editingId ? 'Edit Announcement' : 'Create New Promotional Announcement'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Configure content, display mode, animation speed, and color themes.
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

          {/* Live Preview Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-700 dark:text-emerald-400" /> Live Storefront Preview:
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500">
                Mode: {isMarquee ? 'Continuous Scrolling Marquee' : 'Static Highlight Banner'}
              </span>
            </div>

            <div className={`rounded-2xl overflow-hidden p-3.5 shadow-sm transition-all ${previewTheme.color}`}>
              <div className="flex items-center justify-center flex-wrap gap-2 text-xs font-medium">
                {title && (
                  <span className="bg-black/30 border border-white/20 text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {title}
                  </span>
                )}
                <span className="font-semibold">{content || 'Your announcement message will appear here...'}</span>
                {contentTamil && (
                  <>
                    <span className="opacity-40">•</span>
                    <span className="font-medium font-tamil">{contentTamil}</span>
                  </>
                )}
                {linkUrl && (
                  <span className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-white/20">
                    <span>{linkLabel || 'Explore'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Badge / Tag Title (Optional)"
                placeholder="e.g. 🌾 Seasonal Harvest Offer, 🔥 Limited Deal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Input
                label="Target Link URL (Optional)"
                placeholder="e.g. /products, /sellers/yarl-nature-organics"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">English Announcement Message *</label>
              <textarea
                rows={2}
                placeholder="e.g. Special Sinhala & Tamil New Year Offer: Enjoy Free Delivery on orders over Rs. 3,500! • Use Code: VILLAGE2026"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Tamil Translation (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. ரூ. 3,500க்கு மேற்பட்ட அனைத்து கட்டளைகளுக்கும் இலவச விநியோகம்! • தூய கிராமத்து தேன் மற்றும் பனங்கற்கண்டு."
                value={contentTamil}
                onChange={(e) => setContentTamil(e.target.value)}
                className="w-full text-xs font-tamil rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Input
                label="Link Button Text"
                placeholder="e.g. Shop Now →, View Offer"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
              />

              {/* Display Mode */}
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

              {/* Marquee Speed */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Scroll Speed (Seconds)</label>
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

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-brand-700 dark:text-emerald-400" /> Color Theme:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      theme === opt.id
                        ? 'border-brand-600 dark:border-emerald-500 ring-2 ring-brand-500 dark:ring-emerald-400 shadow-sm'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`h-4 w-full rounded-md mb-1.5 ${opt.color}`} />
                    <p className="text-[11px] font-bold text-gray-900 dark:text-slate-100 truncate">{opt.name}</p>
                  </button>
                ))}
              </div>
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
                  Enable & Publish Announcement to Storefront
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
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
            All Announcements ({announcements.length})
          </h2>
          <span className="text-xs text-gray-400 dark:text-slate-500">
            Top active announcement is displayed on customer storefront
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-emerald-400" />
            <span>Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 text-xs">
            No announcements created yet. Click "Create Announcement" to add your first promotional marquee.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {announcements.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Active Status Badge */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-sm ${
                        item.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                      title="Click to toggle status"
                    >
                      {item.isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                          <span>Active on Store</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>

                    {/* Mode Badge */}
                    <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                      {item.isMarquee ? '🔄 Marquee Ticker' : '📌 Static Banner'}
                    </span>

                    {/* Theme Badge */}
                    <span className="capitalize text-gray-500 dark:text-slate-400 text-[11px] font-medium">
                      Theme: <strong className="text-gray-900 dark:text-slate-200">{item.theme}</strong>
                    </span>
                  </div>

                  <div>
                    {item.title && (
                      <span className="text-xs font-bold text-gray-900 dark:text-slate-100 mr-2">
                        [{item.title}]
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

                  {item.linkUrl && (
                    <div className="flex items-center gap-1 text-[11px] text-brand-700 dark:text-emerald-400 font-semibold">
                      <ExternalLink className="w-3 h-3" />
                      <span>Link: {item.linkUrl} ({item.linkLabel || 'Button'})</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-gray-500 dark:text-slate-400 hover:text-brand-700 dark:hover:text-emerald-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Edit announcement"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteModalId(item.id)}
                    className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteModalId}
        onClose={() => setDeleteModalId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to permanently delete this announcement bar?"
        confirmText="Yes, Delete Announcement"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
