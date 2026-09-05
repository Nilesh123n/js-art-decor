import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Image, Layers, Sparkles, ArrowUpDown, Check, X, AlertCircle } from 'lucide-react';
import { Banner } from '../../types/ecommerce';
import { ApiService } from '../../services/api';
import { ImageKitUploader } from '../../components/admin/ImageKitUploader';

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getBanners(true);
      setBanners(data);
    } catch (err: any) {
      console.error('Failed to load banners:', err);
      setMessage({ type: 'error', text: 'Failed to load banners from MySQL database.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBanner({
      title: '',
      subtitle: '',
      highlight_text: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
      link_url: 'catalog',
      button_text: 'EXPLORE COLLECTION',
      banner_type: 'hero',
      display_order: banners.length + 1,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner({ ...banner });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner || !editingBanner.title || !editingBanner.image_url) {
      setMessage({ type: 'error', text: 'Title and image URL are required.' });
      return;
    }

    setSubmitting(true);
    try {
      await ApiService.saveBanner(editingBanner);
      setMessage({ type: 'success', text: 'Banner saved successfully to MySQL!' });
      setIsModalOpen(false);
      setEditingBanner(null);
      await fetchBanners();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save banner.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await ApiService.saveBanner({
        ...banner,
        is_active: !banner.is_active
      });
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
      );
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update banner status.' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ApiService.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      setDeleteConfirmId(null);
      setMessage({ type: 'success', text: 'Banner deleted successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete banner.' });
    }
  };

  const filteredBanners = banners.filter((b) => {
    if (filterType === 'all') return true;
    return b.banner_type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-700" />
            <span>Storefront Banners & Sliders</span>
          </h1>
          <p className="text-xs text-neutral-500">
            Manage hero carousel slides, promotional offer banners, and curated collection visuals powered by ImageKit CDN & Hostinger MySQL.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-2 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-white/50 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'All Banners' },
            { id: 'hero', label: 'Hero Slides' },
            { id: 'promo', label: 'Promotions' },
            { id: 'curated', label: 'Curated Series' },
            { id: 'category', label: 'Category Banners' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === tab.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-neutral-500 font-mono">
          Total: <span className="font-bold text-neutral-900">{filteredBanners.length}</span> banners
        </div>
      </div>

      {/* Banner Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
          <p className="text-xs text-neutral-500">Loading banners from MySQL...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
            <Image className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-neutral-800">No banners found</p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Create your first hero slider or promotion banner to showcase textiles on the homepage and catalog.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition"
          >
            Create Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-white rounded-2xl border overflow-hidden transition shadow-sm hover:shadow-md ${
                banner.is_active ? 'border-neutral-200' : 'border-neutral-200 opacity-60 bg-neutral-50'
              }`}
            >
              {/* Visual Banner Preview */}
              <div className="relative h-48 sm:h-56 w-full bg-neutral-900 overflow-hidden group">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 flex flex-col justify-end text-white">
                  {banner.subtitle && (
                    <span className="text-[10px] tracking-widest uppercase font-bold text-amber-300 mb-1">
                      {banner.subtitle}
                    </span>
                  )}
                  <h3 className="text-base sm:text-lg font-serif font-bold leading-snug">
                    {banner.title}
                  </h3>
                  {banner.highlight_text && (
                    <span className="inline-block mt-1 text-xs text-amber-200 font-medium">
                      ✦ {banner.highlight_text}
                    </span>
                  )}
                  {banner.description && (
                    <p className="text-[11px] text-neutral-300 line-clamp-2 mt-1">
                      {banner.description}
                    </p>
                  )}
                  {banner.button_text && (
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-white text-neutral-900 text-[10px] font-bold rounded tracking-wider uppercase">
                        {banner.button_text} →
                      </span>
                    </div>
                  )}
                </div>

                {/* Badges on preview */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                    {banner.banner_type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-mono font-bold">
                    #{banner.display_order}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      banner.is_active
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {banner.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Controls Footer */}
              <div className="p-4 flex items-center justify-between bg-white border-t border-neutral-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition ${
                      banner.is_active
                        ? 'text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}
                    title={banner.is_active ? 'Disable banner' : 'Enable banner'}
                  >
                    {banner.is_active ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-neutral-400 font-mono truncate max-w-[160px]">
                    Link: /{banner.link_url || 'home'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(banner)}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                    title="Edit Banner"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {deleteConfirmId === banner.id ? (
                    <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-0.5 text-neutral-500 hover:text-neutral-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(banner.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200 my-8">
            <div className="p-5 bg-neutral-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">
                  {editingBanner.id ? 'Edit Storefront Banner' : 'Create Storefront Banner'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Synced directly to Hostinger MySQL & optimized via ImageKit
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-800 mb-1">Banner Title *</label>
                  <input
                    type="text"
                    required
                    value={editingBanner.title || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    placeholder="e.g. Crafted Luxury Textiles & Artisan Decor"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Subtitle / Overline</label>
                  <input
                    type="text"
                    value={editingBanner.subtitle || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                    placeholder="e.g. PREMIUM QUALITY • TIMELESS ELEGANCE"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Highlight Badge Text</label>
                  <input
                    type="text"
                    value={editingBanner.highlight_text || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, highlight_text: e.target.value })
                    }
                    placeholder="e.g. 40% Off Wholesale MOQ"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Description / Summary</label>
                  <textarea
                    rows={2}
                    value={editingBanner.description || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, description: e.target.value })
                    }
                    placeholder="Short description shown below title on slider"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                {/* ImageKit Uploader Integration */}
                <div className="sm:col-span-2 border-t pt-3">
                  <ImageKitUploader
                    value={editingBanner.image_url || ''}
                    onChange={(url) => setEditingBanner({ ...editingBanner, image_url: url })}
                    label="Banner Background Image (ImageKit CDN) *"
                    folder="/jsartdecor/banners"
                    hint="High-resolution landscape image (1600x600 recommended). Directly hosted via ImageKit CDN."
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={editingBanner.button_text || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, button_text: e.target.value })
                    }
                    placeholder="e.g. EXPLORE COLLECTION"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Button Target Link</label>
                  <input
                    type="text"
                    value={editingBanner.link_url || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, link_url: e.target.value })}
                    placeholder="e.g. catalog, wholesale-tree, contact"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Banner Type</label>
                  <select
                    value={editingBanner.banner_type || 'hero'}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        banner_type: e.target.value as any
                      })
                    }
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-semibold"
                  >
                    <option value="hero">Hero Main Slider</option>
                    <option value="promo">Promotional Banner</option>
                    <option value="curated">Curated Series Banner</option>
                    <option value="category">Category Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Display Sequence Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editingBanner.display_order || 1}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        display_order: Number(e.target.value)
                      })
                    }
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                    <input
                      type="checkbox"
                      checked={editingBanner.is_active !== false}
                      onChange={(e) =>
                        setEditingBanner({ ...editingBanner, is_active: e.target.checked })
                      }
                      className="accent-amber-700"
                    />
                    <span>Active on Live Storefront</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save to MySQL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
