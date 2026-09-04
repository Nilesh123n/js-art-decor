import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown, Filter, RotateCcw } from 'lucide-react';
import { Product, ProductionType, Segment, ProductType } from '../types/ecommerce';
import { ProductCard } from '../components/common/ProductCard';

interface CatalogPageProps {
  products: Product[];
  initialFilters?: {
    production_type?: string;
    segment?: string;
    product_type?: string;
    search?: string;
  };
  mode: 'Retail' | 'Wholesale';
  setMode: (mode: 'Retail' | 'Wholesale') => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, pricingType: 'Retail' | 'Wholesale') => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  initialFilters,
  mode,
  setMode,
  onSelectProduct,
  onAddToCart
}) => {
  const [selectedProduction, setSelectedProduction] = useState<string>(initialFilters?.production_type || 'All');
  const [selectedSegment, setSelectedSegment] = useState<string>(initialFilters?.segment || 'All');
  const [selectedProductType, setSelectedProductType] = useState<string>(initialFilters?.product_type || 'All');
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters?.search || '');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filtered & Sorted Products
  const processedProducts = useMemo(() => {
    return products
      .filter(p => p.is_active)
      .filter(p => {
        if (selectedProduction !== 'All' && p.production_type !== selectedProduction) return false;
        if (selectedSegment !== 'All' && p.segment !== selectedSegment) return false;
        if (selectedProductType !== 'All' && p.product_type !== selectedProductType) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSku) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = mode === 'Wholesale' ? a.wholesale_price : a.retail_price;
        const priceB = mode === 'Wholesale' ? b.wholesale_price : b.retail_price;

        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, selectedProduction, selectedSegment, selectedProductType, searchQuery, sortBy, mode]);

  const hasActiveFilters = selectedProduction !== 'All' || selectedSegment !== 'All' || selectedProductType !== 'All' || searchQuery !== '';

  const clearAllFilters = () => {
    setSelectedProduction('All');
    setSelectedSegment('All');
    setSelectedProductType('All');
    setSearchQuery('');
  };

  return (
    <div id="catalog-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen text-white space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#D4A017]/30 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            {mode === 'Wholesale' ? 'Wholesale Bulk Catalog' : 'Retail Shop Catalog'}
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Displaying {processedProducts.length} verified items with real-time stock & specs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="bg-[#0A0A0A] p-1 rounded-lg border border-[#D4A017] flex text-xs">
            <button
              onClick={() => setMode('Retail')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                mode === 'Retail' ? 'bg-[#D4A017] text-black shadow-sm' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              Retail
            </button>
            <button
              onClick={() => setMode('Wholesale')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                mode === 'Wholesale' ? 'bg-[#D4A017] text-black shadow-sm' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              Wholesale
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 border border-[#D4A017]/60 rounded-lg px-3 py-1.5 bg-[#0A0A0A] text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#D4A017]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none text-white font-medium"
            >
              <option value="featured" className="bg-[#0A0A0A] text-white">Sort: Featured</option>
              <option value="price-low" className="bg-[#0A0A0A] text-white">Price: Low to High</option>
              <option value="price-high" className="bg-[#0A0A0A] text-white">Price: High to Low</option>
              <option value="newest" className="bg-[#0A0A0A] text-white">Newest Arrivals</option>
            </select>
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden p-2 border border-[#D4A017] rounded-lg bg-[#0A0A0A] text-[#D4A017] flex items-center gap-1.5 text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* HORIZONTAL FILTER CATALOG SECTION (Shifted Horizontally Above Catalog) */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-[#0A0A0A] border border-[#D4A017] rounded-xl p-4 sm:p-5 shadow-[0_0_15px_rgba(212,160,23,0.18)] space-y-4">
        {/* Top Row: Primary Category Tabs (HOME DECOR, ART DECOR, ELECTRIC DECOR) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#D4A017]" />
            <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">Product Categories:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'ALL CATEGORIES', value: 'All' },
              { label: 'HOME DECOR', value: 'HOME DECOR' },
              { label: 'ART DECOR', value: 'ART DECOR' },
              { label: 'ELECTRIC DECOR', value: 'ELECTRIC DECOR' },
            ].map((cat) => {
              const active = selectedProductType === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedProductType(cat.value)}
                  className={`px-3.5 py-1.5 text-xs rounded-lg font-bold tracking-wider transition-all duration-200 ${
                    active
                      ? 'bg-[#D4A017] text-black shadow-[0_0_12px_rgba(212,160,23,0.4)]'
                      : 'bg-[#141414] text-[#CCCCCC] border border-[#333333] hover:border-[#D4A017]/70 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: Horizontal Filters Bar (Search + Production + Segment + Clear) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Keyword Search Input */}
          <div className="lg:col-span-5 relative">
            <input
              type="text"
              placeholder="Search products by title, SKU, or specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-[#D4A017]/50 rounded-lg pl-9 pr-8 py-2 text-xs text-white focus:bg-[#1A1A1A] focus:outline-none focus:border-[#D4A017] placeholder-[#666666]"
            />
            <Search className="w-4 h-4 text-[#D4A017] absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Production Method Horizontal Select */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-1.5 bg-[#141414] border border-[#333333] hover:border-[#D4A017]/60 rounded-lg px-3 py-2 text-xs">
              <span className="text-[#A3A3A3] text-[11px] whitespace-nowrap">Method:</span>
              <select
                value={selectedProduction}
                onChange={(e) => setSelectedProduction(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none w-full cursor-pointer"
              >
                <option value="All" className="bg-[#0A0A0A] text-white">All Methods</option>
                <option value="Handmade" className="bg-[#0A0A0A] text-white">Handmade / Artisanal</option>
                <option value="Factory" className="bg-[#0A0A0A] text-white">Factory / Precision</option>
              </select>
            </div>
          </div>

          {/* Segment Collection Horizontal Select */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-1.5 bg-[#141414] border border-[#333333] hover:border-[#D4A017]/60 rounded-lg px-3 py-2 text-xs">
              <span className="text-[#A3A3A3] text-[11px] whitespace-nowrap">Segment:</span>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none w-full cursor-pointer"
              >
                <option value="All" className="bg-[#0A0A0A] text-white">All Segments</option>
                <option value="Home" className="bg-[#0A0A0A] text-white">Home Collection</option>
                <option value="Hotel" className="bg-[#0A0A0A] text-white">Hotel Collection</option>
                <option value="Event" className="bg-[#0A0A0A] text-white">Event / Banquet</option>
              </select>
            </div>
          </div>

          {/* Reset Filters Action */}
          <div className="lg:col-span-1 flex justify-end">
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                title="Reset all filters"
                className="w-full lg:w-auto px-3 py-2 rounded-lg bg-red-950/40 border border-red-500/50 hover:bg-red-900/60 text-red-300 text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="lg:hidden">Reset</span>
              </button>
            ) : (
              <div className="hidden lg:block text-[11px] text-[#666666] italic text-right px-2">
                Ready
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Pill Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1C1C1C] text-[11px]">
            <span className="text-[#A3A3A3]">Active Filters:</span>
            {selectedProductType !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-[#141414] border border-[#D4A017] text-[#D4A017] px-2.5 py-0.5 rounded-full font-semibold">
                Category: {selectedProductType}
                <button onClick={() => setSelectedProductType('All')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedProduction !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-[#141414] border border-[#D4A017] text-[#D4A017] px-2.5 py-0.5 rounded-full font-semibold">
                Method: {selectedProduction}
                <button onClick={() => setSelectedProduction('All')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSegment !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-[#141414] border border-[#D4A017] text-[#D4A017] px-2.5 py-0.5 rounded-full font-semibold">
                Segment: {selectedSegment}
                <button onClick={() => setSelectedSegment('All')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-[#141414] border border-[#D4A017] text-[#D4A017] px-2.5 py-0.5 rounded-full font-semibold">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-[#D4A017] hover:underline text-[11px] font-bold ml-1"
            >
              Clear All
            </button>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* PRODUCT GRID AREA (Full-Width Responsive 4-Column Layout) */}
      {/* ---------------------------------------------------------------- */}
      <main className="space-y-6">
        {processedProducts.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-[#D4A017] rounded-2xl p-12 text-center space-y-3 shadow-[0_0_15px_rgba(212,160,23,0.15)]">
            <Search className="w-8 h-8 text-[#D4A017] mx-auto" />
            <h3 className="text-sm font-bold text-white">No Products Matched Your Filters</h3>
            <p className="text-xs text-[#A3A3A3]">Try adjusting search keywords or category filters above.</p>
            <button
              onClick={clearAllFilters}
              className="mt-2 inline-block bg-[#D4A017] text-black text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#E5B842] transition shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {processedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                mode={mode}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex justify-end">
          <div className="bg-[#0A0A0A] border-l border-[#D4A017] w-80 h-full p-6 space-y-6 overflow-y-auto text-white">
            <div className="flex items-center justify-between border-b pb-3 border-[#D4A017]/30">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#D4A017]">Filter Catalog</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-[#A3A3A3] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filter Options */}
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-[#D4A017] mb-2 uppercase">Product Category</h3>
                {['All', 'HOME DECOR', 'ART DECOR', 'ELECTRIC DECOR'].map(c => (
                  <label key={c} className="block py-1 text-[#CCCCCC] hover:text-white cursor-pointer">
                    <input
                      type="radio"
                      name="m_cat"
                      checked={selectedProductType === c}
                      onChange={() => setSelectedProductType(c)}
                      className="mr-2 accent-[#D4A017]"
                    />
                    {c === 'All' ? 'All Categories' : c}
                  </label>
                ))}
              </div>

              <div>
                <h3 className="font-bold text-[#D4A017] mb-2 uppercase">Production Method</h3>
                {['All', 'Handmade', 'Factory'].map(t => (
                  <label key={t} className="block py-1 text-[#CCCCCC] hover:text-white cursor-pointer">
                    <input
                      type="radio"
                      name="m_prod"
                      checked={selectedProduction === t}
                      onChange={() => setSelectedProduction(t)}
                      className="mr-2 accent-[#D4A017]"
                    />
                    {t}
                  </label>
                ))}
              </div>

              <div>
                <h3 className="font-bold text-[#D4A017] mb-2 uppercase">Segment</h3>
                {['All', 'Home', 'Hotel', 'Event'].map(s => (
                  <label key={s} className="block py-1 text-[#CCCCCC] hover:text-white cursor-pointer">
                    <input
                      type="radio"
                      name="m_seg"
                      checked={selectedSegment === s}
                      onChange={() => setSelectedSegment(s)}
                      className="mr-2 accent-[#D4A017]"
                    />
                    {s}
                  </label>
                ))}
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-[#D4A017] hover:bg-[#E5B842] text-black font-bold py-3 rounded-lg text-xs transition shadow-md"
                >
                  Apply Filters ({processedProducts.length})
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={() => { clearAllFilters(); setMobileFilterOpen(false); }}
                    className="w-full bg-[#141414] border border-[#333333] hover:border-red-500 text-red-300 font-semibold py-2.5 rounded-lg text-xs transition"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
