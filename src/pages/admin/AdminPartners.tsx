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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-neutral-900">Partner Details</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Partner Name *</label>
                <input
                  type="text"
                  required
                  value={editingPartner.name || ''}
                  onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                  className="w-full bg-neutral-50 border rounded p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Logo URL *</label>
                <input
                  type="text"
                  required
                  value={editingPartner.logo_url || ''}
                  onChange={(e) => setEditingPartner({ ...editingPartner, logo_url: e.target.value })}
                  className="w-full bg-neutral-50 border rounded p-2 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editingPartner.description || ''}
                  onChange={(e) => setEditingPartner({ ...editingPartner, description: e.target.value })}
                  className="w-full bg-neutral-50 border rounded p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={editingPartner.website || ''}
                  onChange={(e) => setEditingPartner({ ...editingPartner, website: e.target.value })}
                  className="w-full bg-neutral-50 border rounded p-2 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-1.5 bg-neutral-900 text-white rounded font-bold flex items-center gap-1.5 disabled:opacity-50">
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
