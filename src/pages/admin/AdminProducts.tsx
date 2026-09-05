import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Search, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Product, ProductionType, Segment, ProductType, SalesAvailability } from '../../types/ecommerce';
import { ApiService } from '../../services/api';
import { ImageKitUploader } from '../../components/admin/ImageKitUploader';

interface AdminProductsProps {
  products: Product[];
  onRefreshProducts: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ products, onRefreshProducts }) => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setError(null);
    setEditingProduct({
      name: '',
      slug: '',
      sku: 'JS-NEW-' + Math.floor(100 + Math.random() * 900),
      description: '',
      short_description: '',
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
      production_type: 'Handmade',
      segment: 'Home',
      product_type: 'HOME DECOR',
      sales_availability: 'Both',
      retail_price: 1999,
      wholesale_price: 1299,
      stock_quantity: 50,
      min_wholesale_qty: 10,
      size: 'King Size (108 x 108 inches)',
      material: '100% Organic Cotton',
      color: 'White & Multi',
      is_featured: false,
      is_new_arrival: true,
      is_active: true
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setError(null);
    setEditingProduct({ ...prod });
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product from the database?')) {
      try {
        await ApiService.deleteAdminProduct(id);
        onRefreshProducts();
      } catch (err: any) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await ApiService.uploadProductImage(file);
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [imageUrl, ...(editingProduct.images || []).slice(1)]
        });
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    setSubmitting(true);
    setError(null);

    try {
      const slug = editingProduct.slug || editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const payload = { ...editingProduct, slug };

      if (editingProduct.id) {
        await ApiService.updateAdminProduct(payload as Product);
      } else {
        await ApiService.createAdminProduct(payload);
      }

      onRefreshProducts();
      setModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save product to database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Product Catalog Management</h1>
          <p className="text-xs text-neutral-500">Add, edit prices, wholesale MOQ, and manage MySQL inventory.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Filter by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-neutral-300 rounded-lg pl-3 pr-8 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
        />
        <Search className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Pipeline & Segment</th>
                <th className="p-3.5">Prices (Retail / Wholesale)</th>
                <th className="p-3.5">Stock / MOQ</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50/80">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded bg-neutral-100 border border-neutral-200 shrink-0" />
                      <div>
                        <div className="font-bold text-neutral-900 line-clamp-1">{p.name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">SKU: {p.sku}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="space-y-0.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.production_type === 'Handmade' ? 'bg-amber-100 text-amber-900' : 'bg-neutral-900 text-white'
                      }`}>
                        {p.production_type}
                      </span>
                      <div className="text-[11px] text-neutral-600">{p.segment} • {p.product_type}</div>
                    </div>
                  </td>

                  <td className="p-3.5 font-mono">
                    <div className="font-bold text-neutral-900">₹{p.retail_price.toLocaleString('en-IN')} (Retail)</div>
                    <div className="text-[11px] text-amber-700 font-bold">₹{p.wholesale_price.toLocaleString('en-IN')} (Wholesale)</div>
                  </td>

                  <td className="p-3.5 font-mono">
                    <div className={`font-bold ${p.stock_quantity <= 10 ? 'text-red-600' : 'text-neutral-900'}`}>
                      {p.stock_quantity} units
                    </div>
                    <div className="text-[10px] text-neutral-500">MOQ: {p.min_wholesale_qty} pcs</div>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {modalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between border-b pb-3 border-neutral-200">
              <h2 className="text-base font-serif font-bold text-neutral-900">
                {editingProduct.id ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Production Type</label>
                  <select
                    value={editingProduct.production_type || 'Handmade'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, production_type: e.target.value as ProductionType })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  >
                    <option value="Handmade">Handmade</option>
                    <option value="Factory">Factory</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Segment</label>
                  <select
                    value={editingProduct.segment || 'Home'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, segment: e.target.value as Segment })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  >
                    <option value="Home">Home</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Event">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Product Type / Category</label>
                  <select
                    value={editingProduct.product_type || 'HOME DECOR'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, product_type: e.target.value as ProductType })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-semibold"
                  >
                    <option value="HOME DECOR">HOME DECOR</option>
                    <option value="ART DECOR">ART DECOR</option>
                    <option value="ELECTRIC DECOR">ELECTRIC DECOR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Retail Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.retail_price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, retail_price: Number(e.target.value) })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Wholesale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.wholesale_price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, wholesale_price: Number(e.target.value) })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock_quantity || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Min Wholesale MOQ (Pcs) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.min_wholesale_qty || 1}
                    onChange={(e) => setEditingProduct({ ...editingProduct, min_wholesale_qty: Number(e.target.value) })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Dimensions / Size</label>
                  <input
                    type="text"
                    value={editingProduct.size || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Material Composition</label>
                  <input
                    type="text"
                    value={editingProduct.material || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageKitUploader
                    value={editingProduct.images?.[0] || ''}
                    onChange={(url) =>
                      setEditingProduct({
                        ...editingProduct,
                        images: [url, ...(editingProduct.images || []).slice(1)]
                      })
                    }
                    label="Main Product Image (ImageKit CDN) *"
                    folder="/jsartdecor/products"
                    hint="Uploaded directly to ImageKit CDN and saved to Hostinger MySQL products table."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                    className="accent-neutral-900"
                  />
                  <span className="font-bold">Active in Catalog</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="accent-neutral-900"
                  />
                  <span className="font-bold">Featured on Home</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-neutral-900 text-white font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
