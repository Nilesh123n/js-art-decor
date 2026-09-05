import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Edit3, Trash2, Check, X, Loader2, Sparkles, Image as ImageIcon, ExternalLink, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PageSection } from '../../types/ecommerce';
import { ApiService } from '../../services/api';
import { ImageKitUploader } from '../../components/admin/ImageKitUploader';

const AVAILABLE_PAGES = [
  { id: 'all', label: 'All Pages' },
  { id: 'home', label: 'Home Page' },
  { id: 'wholesale-tree', label: 'Wholesale & B2B' },
  { id: 'catalog', label: 'Catalog & Shop' },
  { id: 'contact', label: 'Contact Us' },
  { id: 'policies', label: 'Policies & Shipping' }
];

export const AdminSections: React.FC = () => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSection, setEditingSection] = useState<Partial<PageSection> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getSections(undefined, true);
      setSections(data);
    } catch (err: any) {
      console.error('Failed to load sections:', err);
      setMessage({ type: 'error', text: 'Failed to load page sections from MySQL.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingSection({
      page_name: selectedPage === 'all' ? 'home' : selectedPage,
      section_key: `${selectedPage === 'all' ? 'home' : selectedPage}_section_${Date.now().toString().slice(-4)}`,
      title: '',
      subtitle: '',
      badge: 'FEATURED SECTION',
      content: '',
      image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
      button_text: 'Explore Collection',
      button_url: 'catalog',
      display_order: sections.length + 1,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (section: PageSection) => {
    setEditingSection({ ...section });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editingSection.section_key || !editingSection.title) {
      setMessage({ type: 'error', text: 'Section key and title are required.' });
      return;
    }

    setSubmitting(true);
    try {
      await ApiService.saveSection(editingSection);
      setMessage({ type: 'success', text: 'Page section saved to Hostinger MySQL!' });
      setIsModalOpen(false);
      setEditingSection(null);
      await fetchSections();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save section.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (section: PageSection) => {
    try {
      await ApiService.saveSection({
        ...section,
        is_active: !section.is_active
      });
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, is_active: !s.is_active } : s))
      );
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update section status.' });
    }
  };

  const filteredSections = sections.filter((s) => {
    const matchesPage = selectedPage === 'all' || s.page_name === selectedPage;
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.section_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.content && s.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPage && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-amber-700" />
            <span>Pages & Section Content CMS</span>
          </h1>
          <p className="text-xs text-neutral-500">
            Control headlines, story copy, artisan highlights, and promotional blocks across all storefront pages with ImageKit image hosting.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Section</span>
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

      {/* Page Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {AVAILABLE_PAGES.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedPage === page.id
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search section title or key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-neutral-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sections List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
          <p className="text-xs text-neutral-500">Retrieving page sections from MySQL...</p>
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-neutral-800">No sections found</p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Configure headlines, narrative stories, or promotional sections for this page.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition"
          >
            Create New Section
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <div
              key={section.id || section.section_key}
              className={`bg-white rounded-2xl border transition shadow-sm hover:shadow-md p-5 ${
                section.is_active ? 'border-neutral-200' : 'border-neutral-200 opacity-60 bg-neutral-50'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                {/* Left Thumbnail (if image present) */}
                {section.image_url && (
                  <div className="w-full md:w-48 h-32 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 relative group">
                    <img
                      src={section.image_url}
                      alt={section.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {section.image_url.includes('imagekit') ? 'ImageKit CDN' : 'Image'}
                    </div>
                  </div>
                )}

                {/* Center Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-mono text-[10px] font-bold rounded">
                      {section.page_name}
                    </span>
                    <span className="font-mono text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                      #{section.section_key}
                    </span>
                    {section.badge && (
                      <span className="px-2 py-0.5 bg-neutral-900 text-amber-300 text-[10px] font-bold rounded tracking-wider uppercase">
                        {section.badge}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-neutral-400">
                      Order: #{section.display_order || 1}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-neutral-900">
                    {section.title}
                  </h3>

                  {section.subtitle && (
                    <p className="text-xs text-amber-800 font-medium">
                      {section.subtitle}
                    </p>
                  )}

                  {section.content && (
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {section.content}
                    </p>
                  )}

                  {(section.button_text || section.button_url) && (
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-1">
                      <span className="font-bold text-neutral-800">CTA:</span>
                      <span className="bg-neutral-100 px-2 py-0.5 rounded font-medium text-neutral-700">
                        {section.button_text || 'Button'} → /{section.button_url || 'catalog'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center md:flex-col gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
                  <button
                    onClick={() => handleToggleActive(section)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition w-full justify-center ${
                      section.is_active
                        ? 'text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}
                  >
                    {section.is_active ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(section)}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition w-full justify-center"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Content</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200 my-8">
            <div className="p-5 bg-neutral-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">
                  {editingSection.id ? 'Edit Page Section' : 'Create New Page Section'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Syncing to table <code className="text-amber-400">page_sections</code> in Hostinger MySQL
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
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Target Page *</label>
                  <select
                    value={editingSection.page_name || 'home'}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, page_name: e.target.value })
                    }
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-semibold"
                  >
                    <option value="home">Home Page</option>
                    <option value="wholesale-tree">Wholesale & B2B (Wholesale Tree)</option>
                    <option value="catalog">Catalog & Shop</option>
                    <option value="contact">Contact Us Page</option>
                    <option value="policies">Policies & Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Section Key (Unique Identifier) *</label>
                  <input
                    type="text"
                    required
                    value={editingSection.section_key || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, section_key: e.target.value })
                    }
                    placeholder="e.g. home_hero, home_story, wholesale_intro"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-800 mb-1">Section Title *</label>
                  <input
                    type="text"
                    required
                    value={editingSection.title || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, title: e.target.value })
                    }
                    placeholder="e.g. Crafted Luxury Textiles & Artisan Decor"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={editingSection.subtitle || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, subtitle: e.target.value })
                    }
                    placeholder="Secondary supporting headline"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Badge / Overline Label</label>
                  <input
                    type="text"
                    value={editingSection.badge || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, badge: e.target.value })
                    }
                    placeholder="e.g. JAIPUR HERITAGE CRAFT"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Content / Story Copy</label>
                  <textarea
                    rows={4}
                    value={editingSection.content || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, content: e.target.value })
                    }
                    placeholder="Full textual narrative, descriptions, or feature list..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 leading-relaxed"
                  />
                </div>

                {/* ImageKit Uploader */}
                <div className="sm:col-span-2 border-t pt-3">
                  <ImageKitUploader
                    value={editingSection.image_url || ''}
                    onChange={(url) => setEditingSection({ ...editingSection, image_url: url })}
                    label="Section Feature Image (ImageKit CDN)"
                    folder={`/jsartdecor/sections/${editingSection.page_name || 'home'}`}
                    hint="High-performance CDN hosted visual for this section"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Button Call-to-Action Text</label>
                  <input
                    type="text"
                    value={editingSection.button_text || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, button_text: e.target.value })
                    }
                    placeholder="e.g. Explore Catalog, Request Quote"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Button Target Link</label>
                  <input
                    type="text"
                    value={editingSection.button_url || ''}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, button_url: e.target.value })
                    }
                    placeholder="e.g. catalog, wholesale-tree, contact"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editingSection.display_order || 1}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        display_order: Number(e.target.value)
                      })
                    }
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
                  />
                </div>

                <div className="pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                    <input
                      type="checkbox"
                      checked={editingSection.is_active !== false}
                      onChange={(e) =>
                        setEditingSection({ ...editingSection, is_active: e.target.checked })
                      }
                      className="accent-amber-700"
                    />
                    <span>Active & Visible on Storefront</span>
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
                  <span>Save Section</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
