import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { Partner } from '../../types/ecommerce';
import { ApiService } from '../../services/api';

interface AdminPartnersProps {
  partners: Partner[];
  onRefreshPartners: () => void;
}

export const AdminPartners: React.FC<AdminPartnersProps> = ({ partners, onRefreshPartners }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partial<Partner> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingPartner({
      name: '',
      logo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
      description: '',
      website: 'https://example.com',
      display_order: partners.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Partner) => {
    setEditingPartner({ ...p });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this partner from MySQL?')) {
      try {
        await ApiService.saveAdminPartners(partners.filter(p => p.id !== id));
        onRefreshPartners();
      } catch (err: any) {
        alert(err.message || 'Failed to delete partner.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner || !editingPartner.name) return;

    setSubmitting(true);
    try {
      const partnerToSave = { ...editingPartner } as Partner;
      const idx = partners.findIndex(p => p.id === partnerToSave.id);
      let updated = [...partners];
      if (idx > -1) {
        updated[idx] = partnerToSave;
      } else {
        updated.push(partnerToSave);
      }

      await ApiService.saveAdminPartners(updated);
      onRefreshPartners();
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save partner.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">B2B Hospitality Partners</h1>
          <p className="text-xs text-neutral-500">Manage client logos stored in MySQL database.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Partner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={p.logo_url} alt={p.name} className="w-16 h-16 object-contain rounded bg-neutral-50 p-2 border shrink-0" />
              <div className="space-y-1 text-xs">
                <h2 className="font-bold text-neutral-900">{p.name}</h2>
                <p className="text-neutral-500 line-clamp-1">{p.description}</p>
                <a href={p.website} target="_blank" rel="noreferrer" className="text-amber-700 font-mono text-[10px] underline">
                  {p.website}
                </a>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleOpenEdit(p)} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && editingPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="font-bold text-neutral-900 text-base">
                  {editingPartner.id ? 'Edit Partner Details' : 'Add New Partner'}
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Update B2B client branding and partnership details.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs text-neutral-900">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Partner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taj Hotels & Resorts, Oberoi"
                  value={editingPartner.name ?? ''}
                  onChange={(e) => setEditingPartner(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 font-medium placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Logo URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/... or /logo.png"
                  value={editingPartner.logo_url ?? ''}
                  onChange={(e) => setEditingPartner(prev => prev ? { ...prev, logo_url: e.target.value } : null)}
                  className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 font-mono text-[11px] placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                {editingPartner.logo_url && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    <img
                      src={editingPartner.logo_url}
                      alt="Logo Preview"
                      className="w-12 h-12 object-contain bg-white rounded border p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                    <div className="text-[11px] text-neutral-500">
                      <div className="font-semibold text-neutral-700">Logo Preview</div>
                      <div className="truncate max-w-[200px] text-[10px] text-neutral-400 font-mono">{editingPartner.logo_url}</div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Description / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury 5-Star Heritage Hospitality Partner"
                  value={editingPartner.description ?? ''}
                  onChange={(e) => setEditingPartner(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={editingPartner.website ?? ''}
                  onChange={(e) => setEditingPartner(prev => prev ? { ...prev, website: e.target.value } : null)}
                  className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 font-mono text-[11px] placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingPartner.display_order ?? 1}
                    onChange={(e) => setEditingPartner(prev => prev ? { ...prev, display_order: Number(e.target.value) || 1 } : null)}
                    className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition">
                    <input
                      type="checkbox"
                      checked={editingPartner.is_active ?? true}
                      onChange={(e) => setEditingPartner(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500"
                    />
                    <span className="font-bold text-neutral-800 text-[11px]">Active on Store</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Partner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
