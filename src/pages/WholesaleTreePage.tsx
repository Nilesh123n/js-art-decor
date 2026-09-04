import React, { useState } from 'react';
import { Layers, ArrowRight, Sparkles, Home, Building2, Calendar, Check, Filter } from 'lucide-react';
import { Product } from '../types/ecommerce';
import { ProductCard } from '../components/common/ProductCard';

interface WholesaleTreePageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, pricingType: 'Retail' | 'Wholesale') => void;
  onNavigate: (view: string, param?: any) => void;
}

export const WholesaleTreePage: React.FC<WholesaleTreePageProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onNavigate
}) => {
  const [selectedProduction, setSelectedProduction] = useState<'All' | 'Handmade' | 'Factory'>('All');
  const [selectedSegment, setSelectedSegment] = useState<'All' | 'Home' | 'Hotel' | 'Event'>('All');
  const [selectedProductType, setSelectedProductType] = useState<'All' | 'HOME DECOR' | 'ART DECOR' | 'ELECTRIC DECOR'>('All');

  // Filter products by tree selections
  const filteredProducts = products.filter(p => {
    if (selectedProduction !== 'All' && p.production_type !== selectedProduction) return false;
    if (selectedSegment !== 'All' && p.segment !== selectedSegment) return false;
    if (selectedProductType !== 'All' && p.product_type !== selectedProductType) return false;
    return true;
  });

  return (
    <div id="wholesale-tree-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-screen text-white">
      {/* Page Header */}
      <div className="bg-[#0A0A0A] text-white p-8 rounded-2xl border border-[#D4A017] shadow-[0_0_20px_rgba(212,160,23,0.2)] space-y-4">
        <div className="inline-flex items-center gap-2 bg-[#1A1500] text-[#E5B842] border border-[#D4A017]/60 px-3 py-1 rounded-full text-xs font-semibold">
          <Layers className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>Structured Wholesale Hierarchy Navigator</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white">
          B2B Wholesale Category Tree
        </h1>

        <p className="text-xs sm:text-sm text-[#CCCCCC] max-w-2xl leading-relaxed">
          Filter through our production pipelines, application segments, and product lines to view tier wholesale pricing and minimum order quantities (MOQ).
        </p>

        {/* Tree Path Indicator Breadcrumb */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="bg-[#141414] text-[#E5B842] px-3 py-1 rounded border border-[#D4A017] font-bold">
            1. Wholesale
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D4A017]" />

          <span className={`px-3 py-1 rounded border font-semibold ${
            selectedProduction !== 'All' ? 'bg-[#D4A017] text-black border-[#D4A017]' : 'bg-[#141414] text-[#CCCCCC] border-[#333333]'
          }`}>
            2. {selectedProduction === 'All' ? 'Handmade / Factory' : selectedProduction}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D4A017]" />

          <span className={`px-3 py-1 rounded border font-semibold ${
            selectedSegment !== 'All' ? 'bg-[#D4A017] text-black border-[#D4A017]' : 'bg-[#141414] text-[#CCCCCC] border-[#333333]'
          }`}>
            3. {selectedSegment === 'All' ? 'Home / Hotel / Event' : selectedSegment}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D4A017]" />

          <span className={`px-3 py-1 rounded border font-semibold ${
            selectedProductType !== 'All' ? 'bg-[#D4A017] text-black border-[#D4A017]' : 'bg-[#141414] text-[#CCCCCC] border-[#333333]'
          }`}>
            4. {selectedProductType === 'All' ? 'Home / Art / Electric Decor' : selectedProductType}
          </span>
        </div>
      </div>

      {/* Visual Tree Controller Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Production Method */}
        <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#D4A017] shadow-[0_0_15px_rgba(212,160,23,0.15)] space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D4A017] flex items-center justify-between">
            <span>Tier 1: Production Pipeline</span>
            <span className="text-[#E5B842] font-mono">01</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setSelectedProduction('All')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedProduction === 'All' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <span>All Production Lines</span>
              {selectedProduction === 'All' && <Check className="w-4 h-4 text-black" />}
            </button>

            <button
              onClick={() => setSelectedProduction('Handmade')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedProduction === 'Handmade' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <div>
                <div className="font-bold">Handmade / Artisanal</div>
                <div className="text-[10px] opacity-80 font-normal">Jaipur block-print, Kantha, Macrame</div>
              </div>
              {selectedProduction === 'Handmade' && <Check className="w-4 h-4 text-black" />}
            </button>

            <button
              onClick={() => setSelectedProduction('Factory')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedProduction === 'Factory' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <div>
                <div className="font-bold">Factory / Precision</div>
                <div className="text-[10px] opacity-80 font-normal">High TC Hotel linens, Chandeliers & Lamps</div>
              </div>
              {selectedProduction === 'Factory' && <Check className="w-4 h-4 text-black" />}
            </button>
          </div>
        </div>

        {/* Tier 2: Segment */}
        <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#D4A017] shadow-[0_0_15px_rgba(212,160,23,0.15)] space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D4A017] flex items-center justify-between">
            <span>Tier 2: Target Segment</span>
            <span className="text-[#E5B842] font-mono">02</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setSelectedSegment('All')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedSegment === 'All' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <span>All Segments</span>
              {selectedSegment === 'All' && <Check className="w-4 h-4 text-black" />}
            </button>

            <button
              onClick={() => setSelectedSegment('Home')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedSegment === 'Home' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>Home Segment</span>
              </div>
              {selectedSegment === 'Home' && <Check className="w-4 h-4 text-black" />}
            </button>

            <button
              onClick={() => setSelectedSegment('Hotel')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedSegment === 'Hotel' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Hotel / Hospitality</span>
              </div>
              {selectedSegment === 'Hotel' && <Check className="w-4 h-4 text-black" />}
            </button>

            <button
              onClick={() => setSelectedSegment('Event')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedSegment === 'Event' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Event & Banquet</span>
              </div>
              {selectedSegment === 'Event' && <Check className="w-4 h-4 text-black" />}
            </button>
          </div>
        </div>

        {/* Tier 3: Product Line */}
        <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#D4A017] shadow-[0_0_15px_rgba(212,160,23,0.15)] space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D4A017] flex items-center justify-between">
            <span>Tier 3: Product Category</span>
            <span className="text-[#E5B842] font-mono">03</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setSelectedProductType('All')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedProductType === 'All' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <span>All Product Categories</span>
              {selectedProductType === 'All' && <Check className="w-4 h-4 text-black" />}
            </button>

            <button
              onClick={() => setSelectedProductType('HOME DECOR')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedProductType === 'HOME DECOR' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <div>
                <div className="font-bold">HOME DECOR</div>
                <div className="text-[10px] opacity-80 font-normal">Bedsheets, Linens, Quilts & Velvet Cushions</div>
              </div>
              {selectedProductType === 'HOME DECOR' && <Check className="w-4 h-4 text-black" />}
            </button>

            <button
              onClick={() => setSelectedProductType('ART DECOR')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedProductType === 'ART DECOR' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <div>
                <div className="font-bold">ART DECOR</div>
                <div className="text-[10px] opacity-80 font-normal">Macrame, Brass Sculptures & Wall Art</div>
              </div>
              {selectedProductType === 'ART DECOR' && <Check className="w-4 h-4 text-black" />}
            </button>

            <button
              onClick={() => setSelectedProductType('ELECTRIC DECOR')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition flex items-center justify-between ${
                selectedProductType === 'ELECTRIC DECOR' ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:border-[#D4A017]/60'
              }`}
            >
              <div>
                <div className="font-bold">ELECTRIC DECOR</div>
                <div className="text-[10px] opacity-80 font-normal">Chandeliers, Mosaic Lamps & Floor Lights</div>
              </div>
              {selectedProductType === 'ELECTRIC DECOR' && <Check className="w-4 h-4 text-black" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Results Header */}
      <div className="flex items-center justify-between pt-4 border-t border-[#D4A017]/30">
        <div>
          <h2 className="text-lg font-bold text-white">
            Matching Wholesale Products ({filteredProducts.length})
          </h2>
          <p className="text-xs text-[#A3A3A3]">Prices below reflect wholesale tier with MOQ requirements.</p>
        </div>

        {(selectedProduction !== 'All' || selectedSegment !== 'All' || selectedProductType !== 'All') && (
          <button
            onClick={() => {
              setSelectedProduction('All');
              setSelectedSegment('All');
              setSelectedProductType('All');
            }}
            className="text-xs text-[#D4A017] hover:text-[#E5B842] hover:underline font-semibold"
          >
            Reset Tree Filters
          </button>
        )}
      </div>

      {/* Product Results Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-[#D4A017] rounded-xl p-12 text-center space-y-3">
          <Filter className="w-8 h-8 text-[#D4A017] mx-auto" />
          <h3 className="text-sm font-bold text-white">No Wholesale Products Match This Tree Combination</h3>
          <p className="text-xs text-[#A3A3A3]">Try relaxing tier filters to discover items across categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              mode="Wholesale"
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};
