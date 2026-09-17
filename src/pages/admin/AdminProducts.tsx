import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Search, Upload, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Product, ProductionType, Segment, ProductType, SalesAvailability } from '../../types/ecommerce';
import { ApiService } from '../../services/api';
import { ImageKitUploader } from '../../components/admin/ImageKitUploader';

interface AdminProductsProps {
  products: Product[];
  onRefreshProducts: () => void | Promise<void>;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ products, onRefreshProducts }) => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshProducts();
      showSuccess("Products reloaded directly from database.");
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

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
        await onRefreshProducts();
        showSuccess('Product deleted from database successfully.');
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

    // Validate discount price if retail mode is selected
    const isRetail = !editingProduct.sales_availability || editingProduct.sales_availability === 'Both' || editingProduct.sales_availability === 'Retail';
    const regPrice = Number(editingProduct.retail_price) || 0;
    const discPrice = editingProduct.discount_price !== undefined && editingProduct.discount_price !== null && !isNaN(Number(editingProduct.discount_price)) && Number(editingProduct.discount_price) > 0
      ? Number(editingProduct.discount_price)
      : null;

    if (discPrice !== null && isRetail) {
      if (regPrice <= 0) {
        setError('Please set a Regular Retail Price before setting a Discount Price.');
        return;
      }
      if (discPrice >= regPrice) {
        setError(`Discount Price (₹${discPrice}) must be lower than Regular Retail Price (₹${regPrice}).`);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const slug = editingProduct.slug || editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const validImages = editingProduct.images && editingProduct.images.length > 0 && editingProduct.images[0]
        ? editingProduct.images
        : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'];

      const payload = { 
        ...editingProduct, 
        slug,
        images: validImages,
        sales_availability: editingProduct.sales_availability || 'Both',
        retail_price: Number(editingProduct.retail_price) || 0,
        discount_price: isRetail && discPrice ? discPrice : undefined,
        wholesale_price: Number(editingProduct.wholesale_price) || 0,
        stock_quantity: Number(editingProduct.stock_quantity) || 0,
        min_wholesale_qty: Number(editingProduct.min_wholesale_qty) || 1,
        is_active: editingProduct.is_active !== undefined ? editingProduct.is_active : true,
        is_featured: !!editingProduct.is_featured,
        is_new_arrival: editingProduct.is_new_arrival !== undefined ? !!editingProduct.is_new_arrival : true
      };

      if (editingProduct.id) {
        await ApiService.updateAdminProduct(payload as Product);
        showSuccess(`Product "${payload.name}" updated and saved to database!`);
      } else {
        await ApiService.createAdminProduct(payload);
        showSuccess(`Product "${payload.name}" added to database and live on all devices!`);
      }

      await onRefreshProducts();
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
      {/* Toast Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Product Catalog Management</h1>
          <p className="text-xs text-neutral-500">Add, edit prices, wholesale MOQ, and manage database inventory (changes sync to all devices).</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
            title="Refresh from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.discount_price && Number(p.discount_price) > 0 && Number(p.discount_price) < Number(p.retail_price) ? (
                        <>
                          <span className="font-bold text-emerald-800">₹{Number(p.discount_price).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-neutral-400 line-through">₹{p.retail_price.toLocaleString('en-IN')}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                            {Math.round(((p.retail_price - Number(p.discount_price)) / p.retail_price) * 100)}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-neutral-900">₹{p.retail_price.toLocaleString('en-IN')}</span>
                      )}
                      <span className="text-[10px] text-neutral-500 font-sans">(Retail)</span>
                    </div>
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

            {(() => {
              const isRetailSelected = !editingProduct.sales_availability || editingProduct.sales_availability === 'Both' || editingProduct.sales_availability === 'Retail';
              const isWholesaleSelected = !editingProduct.sales_availability || editingProduct.sales_availability === 'Both' || editingProduct.sales_availability === 'Wholesale';
              const hasRetailPrice = isRetailSelected && Number(editingProduct.retail_price) > 0;
              const isDiscountFieldEnabled = isRetailSelected && hasRetailPrice;

              const retailPriceNum = Number(editingProduct.retail_price) || 0;
              const discountPriceNum = (editingProduct.discount_price !== undefined && editingProduct.discount_price !== null && !isNaN(Number(editingProduct.discount_price))) 
                ? Number(editingProduct.discount_price) 
                : 0;

              const hasValidDiscount = isDiscountFieldEnabled && discountPriceNum > 0 && discountPriceNum < retailPriceNum;
              const isDiscountInvalid = isDiscountFieldEnabled && discountPriceNum > 0 && discountPriceNum >= retailPriceNum;
              const discountPercent = hasValidDiscount ? Math.round(((retailPriceNum - discountPriceNum) / retailPriceNum) * 100) : 0;
              const discountSavings = hasValidDiscount ? retailPriceNum - discountPriceNum : 0;

              return (
                <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-neutral-800 mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                        placeholder="e.g. Royal Handblock Printed Bedcover Set"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">SKU Code *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.sku || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">Sales Availability / Channel *</label>
                      <select
                        value={editingProduct.sales_availability || 'Both'}
                        onChange={(e) => {
                          const val = e.target.value as SalesAvailability;
                          setEditingProduct({ 
                            ...editingProduct, 
                            sales_availability: val,
                            // If user selects Wholesale only, clear discount price
                            discount_price: val === 'Wholesale' ? undefined : editingProduct.discount_price
                          });
                        }}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-semibold"
                      >
                        <option value="Both">Both (Retail & Wholesale)</option>
                        <option value="Retail">Retail Only (Direct to Consumer)</option>
                        <option value="Wholesale">Wholesale Only (B2B Bulk)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">Production Type</label>
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
                      <label className="block font-bold text-neutral-800 mb-1">Segment</label>
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

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-neutral-800 mb-1">Product Type / Category</label>
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

                    {/* PRICING & DISCOUNT SECTION */}
                    <div className="sm:col-span-2 bg-neutral-50/70 border border-neutral-200 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                        <span className="font-bold text-neutral-900 text-xs uppercase tracking-wide">
                          Pricing & Retail Discount
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isRetailSelected ? 'bg-amber-100 text-amber-800' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {editingProduct.sales_availability === 'Wholesale' 
                            ? 'Wholesale Mode Only' 
                            : editingProduct.sales_availability === 'Retail'
                            ? 'Retail Mode Only'
                            : 'Retail & Wholesale Mode'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Regular Retail Price */}
                        <div className={`p-3 rounded-lg border transition ${
                          isRetailSelected ? 'bg-white border-neutral-300' : 'bg-neutral-100 border-neutral-200 opacity-60'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-neutral-900">
                              Regular Retail Price (₹) {isRetailSelected && '*'}
                            </label>
                            {!isRetailSelected && (
                              <span className="text-[10px] text-neutral-500 font-semibold">(Wholesale Only)</span>
                            )}
                          </div>
                          <input
                            type="number"
                            required={isRetailSelected}
                            disabled={!isRetailSelected}
                            placeholder={isRetailSelected ? "e.g. 2499" : "Wholesale only"}
                            value={editingProduct.retail_price ?? 0}
                            onChange={(e) => {
                              const newRetail = Number(e.target.value);
                              setEditingProduct({ 
                                ...editingProduct, 
                                retail_price: newRetail,
                                // If retail price cleared or 0, clear discount price as well
                                discount_price: newRetail <= 0 ? undefined : editingProduct.discount_price 
                              });
                            }}
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-neutral-900 font-mono text-sm font-semibold disabled:bg-neutral-100 disabled:cursor-not-allowed"
                          />
                          <p className="text-[10px] text-neutral-500 mt-1">
                            {isRetailSelected ? 'Standard printed MRP shown to retail buyers.' : 'Disabled because Wholesale Only is selected.'}
                          </p>
                        </div>

                        {/* Retail Discount Price Field - ONLY ENABLED WHEN RETAIL IS SELECTED & RETAIL PRICE > 0 */}
                        <div className={`p-3 rounded-lg border transition-all ${
                          isDiscountFieldEnabled 
                            ? 'bg-emerald-50/60 border-emerald-300 shadow-xs' 
                            : 'bg-neutral-100/90 border-neutral-200 opacity-65'
                        }`}>
                          <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                            <label className={`font-bold ${isDiscountFieldEnabled ? 'text-emerald-950' : 'text-neutral-500'}`}>
                              Retail Discount Price (₹)
                            </label>
                            {hasValidDiscount && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                                {discountPercent}% OFF (Save ₹{discountSavings.toLocaleString('en-IN')})
                              </span>
                            )}
                          </div>

                          <input
                            type="number"
                            disabled={!isDiscountFieldEnabled}
                            placeholder={
                              !isRetailSelected 
                                ? "Disabled (Wholesale Only)" 
                                : !hasRetailPrice 
                                ? "Enter Retail Price first" 
                                : "e.g. 1999 (Special offer price)"
                            }
                            value={editingProduct.discount_price !== undefined ? editingProduct.discount_price : ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : Number(e.target.value);
                              setEditingProduct({ ...editingProduct, discount_price: val });
                            }}
                            className={`w-full border rounded-lg p-2 font-mono text-sm font-semibold transition ${
                              isDiscountFieldEnabled 
                                ? 'bg-white border-emerald-400 text-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none' 
                                : 'bg-neutral-100 border-neutral-300 text-neutral-400 cursor-not-allowed'
                            }`}
                          />

                          <div className="text-[10px] mt-1.5 leading-tight">
                            {!isRetailSelected ? (
                              <span className="text-amber-800 font-medium">
                                🔒 Field is locked. Select <strong>Retail</strong> or <strong>Both</strong> in Sales Availability to enable.
                              </span>
                            ) : !hasRetailPrice ? (
                              <span className="text-neutral-600 font-medium">
                                🔒 Enter a <strong>Regular Retail Price</strong> above to unlock this discount field.
                              </span>
                            ) : isDiscountInvalid ? (
                              <span className="text-red-600 font-bold">
                                ⚠️ Discount price (₹{discountPriceNum}) must be less than regular price (₹{retailPriceNum}).
                              </span>
                            ) : hasValidDiscount ? (
                              <span className="text-emerald-800 font-semibold">
                                ✓ Special price active! Retail buyers will pay ₹{discountPriceNum.toLocaleString('en-IN')} with ₹{retailPriceNum.toLocaleString('en-IN')} struck through.
                              </span>
                            ) : (
                              <span className="text-neutral-500">
                                Optional discounted offer price for retail customers. Leave empty if selling at regular price.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Wholesale Price */}
                        <div className={`p-3 rounded-lg border transition ${
                          isWholesaleSelected ? 'bg-white border-neutral-300' : 'bg-neutral-100 border-neutral-200 opacity-60'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-neutral-900">
                              Wholesale Price (₹) {isWholesaleSelected && '*'}
                            </label>
                            {!isWholesaleSelected && (
                              <span className="text-[10px] text-neutral-500 font-semibold">(Retail Only)</span>
                            )}
                          </div>
                          <input
                            type="number"
                            required={isWholesaleSelected}
                            disabled={!isWholesaleSelected}
                            placeholder={isWholesaleSelected ? "e.g. 1299" : "Retail only"}
                            value={editingProduct.wholesale_price ?? 0}
                            onChange={(e) => setEditingProduct({ ...editingProduct, wholesale_price: Number(e.target.value) })}
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-neutral-900 font-mono text-sm font-semibold disabled:bg-neutral-100 disabled:cursor-not-allowed"
                          />
                          <p className="text-[10px] text-neutral-500 mt-1">
                            B2B wholesale price per unit for bulk buyers.
                          </p>
                        </div>

                        {/* Min Wholesale MOQ */}
                        <div className={`p-3 rounded-lg border transition ${
                          isWholesaleSelected ? 'bg-white border-neutral-300' : 'bg-neutral-100 border-neutral-200 opacity-60'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-neutral-900">
                              Min Wholesale MOQ (Pcs) {isWholesaleSelected && '*'}
                            </label>
                            {!isWholesaleSelected && (
                              <span className="text-[10px] text-neutral-500 font-semibold">(Retail Only)</span>
                            )}
                          </div>
                          <input
                            type="number"
                            required={isWholesaleSelected}
                            disabled={!isWholesaleSelected}
                            placeholder={isWholesaleSelected ? "e.g. 10" : "Retail only"}
                            value={editingProduct.min_wholesale_qty ?? 1}
                            onChange={(e) => setEditingProduct({ ...editingProduct, min_wholesale_qty: Number(e.target.value) })}
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-neutral-900 font-mono text-sm font-semibold disabled:bg-neutral-100 disabled:cursor-not-allowed"
                          />
                          <p className="text-[10px] text-neutral-500 mt-1">
                            Minimum bulk quantity required for B2B orders.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.stock_quantity ?? 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">Dimensions / Size</label>
                      <input
                        type="text"
                        value={editingProduct.size || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                        placeholder="e.g. King Size (108 x 108 inches)"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-neutral-800 mb-1">Material Composition</label>
                      <input
                        type="text"
                        value={editingProduct.material || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                        placeholder="e.g. 100% Pure Organic Cotton"
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
                      <label className="block font-bold text-neutral-800 mb-1">Full Description</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
                        placeholder="Detailed specifications, features, wash care instructions..."
                      />
                    </div>
                  </div>

                  {/* CHECKBOXES SECTION - HIGH CONTRAST & FULLY VISIBLE TEXT LABELS */}
                  <div className="pt-3 border-t border-neutral-200">
                    <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <span>Product Visibility & Display Badges</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Checkbox 1: Active in Catalog */}
                      <label
                        htmlFor="checkbox-is-active"
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                          editingProduct.is_active ?? true 
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs' 
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <input
                          id="checkbox-is-active"
                          type="checkbox"
                          checked={editingProduct.is_active ?? true}
                          onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded border-neutral-400 text-emerald-600 accent-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                        <div className="leading-tight">
                          <span className="block font-bold text-xs text-neutral-900">
                            Active in Catalog
                          </span>
                          <span className="block text-[11px] text-neutral-600 mt-0.5">
                            Visible to all customers across website
                          </span>
                        </div>
                      </label>

                      {/* Checkbox 2: Featured on Home */}
                      <label
                        htmlFor="checkbox-is-featured"
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                          editingProduct.is_featured ?? false 
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-xs' 
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <input
                          id="checkbox-is-featured"
                          type="checkbox"
                          checked={editingProduct.is_featured ?? false}
                          onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded border-neutral-400 text-amber-600 accent-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
                        />
                        <div className="leading-tight">
                          <span className="block font-bold text-xs text-neutral-900">
                            Featured on Home
                          </span>
                          <span className="block text-[11px] text-neutral-600 mt-0.5">
                            Showcase in curated homepage collection
                          </span>
                        </div>
                      </label>

                      {/* Checkbox 3: New Arrival Badge */}
                      <label
                        htmlFor="checkbox-is-new-arrival"
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                          editingProduct.is_new_arrival ?? true 
                            ? 'bg-blue-50/80 border-blue-300 text-blue-950 shadow-xs' 
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <input
                          id="checkbox-is-new-arrival"
                          type="checkbox"
                          checked={editingProduct.is_new_arrival ?? true}
                          onChange={(e) => setEditingProduct({ ...editingProduct, is_new_arrival: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded border-neutral-400 text-blue-600 accent-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <div className="leading-tight">
                          <span className="block font-bold text-xs text-neutral-900">
                            New Arrival Badge
                          </span>
                          <span className="block text-[11px] text-neutral-600 mt-0.5">
                            Displays vibrant 'NEW' tag on card
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 font-bold hover:bg-neutral-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || isDiscountInvalid}
                      className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition shadow-sm"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Save Product to Database</span>
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
