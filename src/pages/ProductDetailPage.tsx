import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, CheckCircle2, ShieldCheck, Truck, MessageCircle, AlertCircle, Sparkles, Layers, Feather, Droplets, Info } from 'lucide-react';
import { Product, SiteSettings } from '../types/ecommerce';
import { ProductCarousel } from '../components/common/ProductCarousel';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  settings: SiteSettings;
  mode: 'Retail' | 'Wholesale';
  setMode: (mode: 'Retail' | 'Wholesale') => void;
  onAddToCart: (product: Product, quantity: number, pricingType: 'Retail' | 'Wholesale') => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  settings,
  mode,
  setMode,
  onAddToCart,
  onSelectProduct,
  onNavigate
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'material' | 'care'>('description');
  const isWholesaleMode = mode === 'Wholesale';
  const minQty = isWholesaleMode ? product.min_wholesale_qty : 1;
  const [quantity, setQuantity] = useState(minQty);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Material details helper based on material and product type
  const getMaterialInfo = (material: string) => {
    const mat = (material || '').toLowerCase();
    if (mat.includes('cotton') || mat.includes('linen') || mat.includes('handloom')) {
      return {
        category: 'Pure Natural Textile',
        texture: 'Breathable, skin-friendly, soft natural handfeel',
        durability: 'Pre-shrunk long-staple yarns with high tensile strength & colorfastness',
        care: 'Machine wash gentle cold (30°C) with mild detergent. Line dry in shade. Warm iron if desired.',
        benefits: ['100% Breathable & Hypoallergenic', 'Durable Colorfast Vegetable / Eco Dyes', 'Pre-tested Anti-Pilling Surface']
      };
    } else if (mat.includes('velvet') || mat.includes('silk') || mat.includes('zardozi') || mat.includes('zari')) {
      return {
        category: 'Luxury Embroidered Textile',
        texture: 'Dense plush pile with rich metallic zari and zardozi needlework',
        durability: 'Heavy GSM base textile with anti-fray bound border piping',
        care: 'Dry clean recommended. Gently spot clean with dry or slightly damp cloth. Avoid harsh rubbing.',
        benefits: ['High-density Royal Luster', 'Hand-stitched Metallic Accents', 'Luxury Soft Touch & Crease Resistant']
      };
    } else if (mat.includes('brass') || mat.includes('iron') || mat.includes('metal') || mat.includes('steel')) {
      return {
        category: 'Artisanal Metal & Alloy',
        texture: 'Substantial solid metal with brushed or electroplated antique gold finish',
        durability: 'Sealed with clear protective anti-rust and anti-tarnish lacquer coat',
        care: 'Dust with clean dry microfiber cloth. Avoid acidic metal polishes or harsh chemical abrasives.',
        benefits: ['Anti-Rust Protective Coating', 'Solid Non-Deforming Metal Body', 'Timeless Antique Golden Patina']
      };
    } else if (mat.includes('terracotta') || mat.includes('clay') || mat.includes('ceramic')) {
      return {
        category: 'Kiln-Baked Earthenware',
        texture: 'Natural matte earthy texture with handcrafted contours',
        durability: 'High-temperature fired clay for enhanced crack resistance',
        care: 'Wipe with a soft dry or slightly damp cloth. Store indoors and avoid prolonged water soaking.',
        benefits: ['100% Natural Earth Clay', 'Handcrafted by Master Potters', 'Non-Toxic Organic Formulation']
      };
    } else if (mat.includes('glass') || mat.includes('crystal')) {
      return {
        category: 'Precision Optical Glass & Metal',
        texture: 'High-clarity optical refraction with smooth beveled edges',
        durability: 'Thermal-resistant tempered glass / K9 optical crystal facets',
        care: 'Clean with specialized lint-free glass cloth. Ensure electricity is turned off before cleaning fixtures.',
        benefits: ['High-Clarity Faceted Crystal', 'Even Light Diffusion', 'Heat-Resistant Components']
      };
    }
    return {
      category: 'Premium Quality Material',
      texture: 'Refined finish meeting commercial hospitality standards',
      durability: 'Strict quality control testing for daily residential or commercial use',
      care: 'Regular light dusting or gentle wipe with a soft clean cloth.',
      benefits: ['Premium Grade Raw Materials', 'Quality Inspected', 'Long-lasting Aesthetic Durability']
    };
  };

  const materialInfo = getMaterialInfo(product.material);

  const displayUnitPrice = isWholesaleMode ? product.wholesale_price : product.retail_price;
  const totalPrice = displayUnitPrice * quantity;

  const handleQuantityChange = (newQty: number) => {
    if (isWholesaleMode && newQty < product.min_wholesale_qty) return;
    if (newQty < 1) return;
    if (newQty > product.stock_quantity) return;
    setQuantity(newQty);
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity, isWholesaleMode ? 'Wholesale' : 'Retail');
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleBuyNowClick = () => {
    onAddToCart(product, quantity, isWholesaleMode ? 'Wholesale' : 'Retail');
    onNavigate('checkout');
  };

  const relatedProducts = allProducts.filter(p => 
    p.id !== product.id && 
    (p.product_type === product.product_type || p.segment === product.segment)
  );

  return (
    <div id="product-detail-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12 min-h-screen text-white">
      {/* Back Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('catalog')}
          className="text-xs font-semibold text-[#D4A017] hover:text-[#E5B842] flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="text-xs font-mono text-[#A3A3A3]">
          SKU: <span className="font-bold text-[#E5B842]">{product.sku}</span>
        </div>
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Gallery View */}
        <div className="space-y-4">
          <div className="aspect-square bg-[#0A0A0A] rounded-2xl overflow-hidden border-2 border-[#D4A017] shadow-[0_0_20px_rgba(212,160,23,0.25)] relative">
            <img
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm bg-[#D4A017] text-black border border-[#D4A017]">
                {product.production_type}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded bg-black/80 backdrop-blur-sm text-white border border-[#D4A017]/60">
                {product.segment}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                    selectedImageIdx === idx ? 'border-[#D4A017] ring-2 ring-[#D4A017]/50 shadow-[0_0_10px_#D4A017]' : 'border-[#333333] opacity-60 hover:opacity-100 hover:border-[#D4A017]/60'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Specifications & Purchasing Block */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4A017] mb-1">
              <span>{product.product_type}</span>
              <span>•</span>
              <span>{product.sales_availability} Channel</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
              {product.name}
            </h1>

            <p className="text-xs text-[#CCCCCC] mt-2 leading-relaxed">
              {product.short_description}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-[#0A0A0A] border border-[#D4A017] rounded-xl space-y-2 shadow-[0_0_15px_rgba(212,160,23,0.15)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#E5B842]">
                  ₹{displayUnitPrice.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-[#A3A3A3] ml-1">
                    per unit ({isWholesaleMode ? 'Wholesale Price' : 'Retail Price'})
                  </span>
                </div>

                {isWholesaleMode ? (
                  <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                    Retail MSRP: ₹{product.retail_price.toLocaleString('en-IN')} (Save ₹{(product.retail_price - product.wholesale_price).toLocaleString('en-IN')}/unit)
                  </div>
                ) : (
                  <div className="text-xs text-[#D4A017] mt-0.5">
                    Wholesale Available at ₹{product.wholesale_price.toLocaleString('en-IN')} (MOQ: {product.min_wholesale_qty} pcs)
                  </div>
                )}
              </div>

              {/* Mode Toggle Switcher */}
              <div className="bg-[#141414] border border-[#D4A017]/60 rounded-lg p-1 flex text-xs">
                <button
                  onClick={() => {
                    setMode('Retail');
                    setQuantity(1);
                  }}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    !isWholesaleMode ? 'bg-[#D4A017] text-black font-bold' : 'text-[#A3A3A3] hover:text-white'
                  }`}
                >
                  Retail
                </button>
                <button
                  onClick={() => {
                    setMode('Wholesale');
                    setQuantity(product.min_wholesale_qty);
                  }}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    isWholesaleMode ? 'bg-[#D4A017] text-black font-bold' : 'text-[#A3A3A3] hover:text-white'
                  }`}
                >
                  Wholesale
                </button>
              </div>
            </div>

            {/* Wholesale MOQ Notice */}
            {isWholesaleMode && (
              <div className="mt-3 p-3 bg-[#1A1500] border border-[#D4A017]/50 rounded-lg flex items-start gap-2 text-xs text-[#E5B842]">
                <AlertCircle className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Wholesale Minimum Order Quantity (MOQ):</span> Minimum {product.min_wholesale_qty} units required for bulk pricing.
                </div>
              </div>
            )}
          </div>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#0A0A0A] border border-[#D4A017]/60 rounded-lg">
              <span className="text-[#A3A3A3] block font-mono text-[10px] uppercase">Dimensions / Size</span>
              <span className="font-bold text-white">{product.size}</span>
            </div>
            <div className="p-3 bg-[#0A0A0A] border border-[#D4A017]/60 rounded-lg">
              <span className="text-[#A3A3A3] block font-mono text-[10px] uppercase">Material Composition</span>
              <span className="font-bold text-white">{product.material}</span>
            </div>
            <div className="p-3 bg-[#0A0A0A] border border-[#D4A017]/60 rounded-lg">
              <span className="text-[#A3A3A3] block font-mono text-[10px] uppercase">Shade / Color</span>
              <span className="font-bold text-white">{product.color}</span>
            </div>
            <div className="p-3 bg-[#0A0A0A] border border-[#D4A017]/60 rounded-lg">
              <span className="text-[#A3A3A3] block font-mono text-[10px] uppercase">Stock Availability</span>
              <span className={`font-bold ${product.stock_quantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} units available` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Full Description & Material */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4A017] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Product Description</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* PRODUCT MATERIAL SECTION */}
            <div className="p-3.5 bg-[#0D0D0D] border border-[#D4A017]/70 rounded-xl space-y-2.5 shadow-[0_0_15px_rgba(212,160,23,0.15)]">
              <div className="flex items-center justify-between border-b border-[#D4A017]/30 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4A017]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5B842]">Product Material</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/50 uppercase font-semibold">
                  {materialInfo.category}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#A3A3A3] text-[10px] font-mono uppercase block">Primary Material:</span>
                  <span className="font-bold text-white text-sm tracking-wide">{product.material}</span>
                </div>

                <p className="text-[11px] text-[#CCCCCC] leading-relaxed">
                  {materialInfo.texture}
                </p>

                {/* Benefits / Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                  {materialInfo.benefits.map((b, i) => (
                    <div key={i} className="bg-[#141414] border border-[#222222] rounded px-2 py-1 text-[10px] text-[#DDDDDD] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D4A017] shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1 text-[11px] border-t border-[#222222] flex items-start gap-1.5 text-[#A3A3A3]">
                  <Droplets className="w-3.5 h-3.5 text-[#D4A017] shrink-0 mt-0.5" />
                  <span><strong className="text-white">Care Guide:</strong> {materialInfo.care}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity & Purchasing Controls */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A017] block">Quantity</span>
                <div className="flex items-center border border-[#D4A017]/60 rounded-lg overflow-hidden bg-[#0A0A0A]">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={isWholesaleMode ? quantity <= product.min_wholesale_qty : quantity <= 1}
                    className="px-3 py-2 text-sm font-bold text-[#D4A017] hover:bg-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-white font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock_quantity}
                    className="px-3 py-2 text-sm font-bold text-[#D4A017] hover:bg-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A017] block">Total Amount</span>
                <div className="text-xl font-bold text-[#E5B842] py-1.5">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCartClick}
                disabled={product.stock_quantity <= 0}
                className={`py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm border border-[#D4A017]/60 ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#141414] hover:bg-[#D4A017] hover:text-black text-white'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {quantity} Unit(s) to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNowClick}
                disabled={product.stock_quantity <= 0}
                className="py-3.5 px-4 bg-[#D4A017] hover:bg-[#E5B842] text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm border border-[#D4A017]"
              >
                <span>Instant Checkout</span>
              </button>
            </div>

            {/* WhatsApp Wholesale Sample Enquiry */}
            <a
              href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hello%20JSArt%26Decor,%20I%20am%20interested%20in%20a%20bulk/sample%20order%20for%20"${encodeURIComponent(product.name)}"%20(SKU:%20${product.sku}).`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 border border-emerald-500 text-emerald-400 hover:bg-emerald-950/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Inquire for Custom Bulk Customization on WhatsApp</span>
            </a>
          </div>

          {/* Assurance Guarantees */}
          <div className="border-t border-[#D4A017]/30 pt-4 grid grid-cols-2 gap-3 text-xs text-[#A3A3A3]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4A017] shrink-0" />
              <span>100% Quality Checked</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#D4A017] shrink-0" />
              <span>Insured Doorstep Freight</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Specifications & Material Story Tabs */}
      <div className="pt-6 border-t border-[#D4A017]/30 space-y-6">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#D4A017]/30 pb-2">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'description'
                ? 'border-[#D4A017] text-[#D4A017] bg-[#141414]'
                : 'border-transparent text-[#A3A3A3] hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Full Description</span>
          </button>
          <button
            onClick={() => setActiveTab('material')}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'material'
                ? 'border-[#D4A017] text-[#D4A017] bg-[#141414]'
                : 'border-transparent text-[#A3A3A3] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Product Material & Craft</span>
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'care'
                ? 'border-[#D4A017] text-[#D4A017] bg-[#141414]'
                : 'border-transparent text-[#A3A3A3] hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Care & Durability</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-[#0A0A0A] border border-[#D4A017]/50 rounded-xl">
          {activeTab === 'description' && (
            <div className="space-y-4 text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
              <h4 className="text-base font-serif font-bold text-white tracking-wide">
                {product.name} - Overview & Aesthetics
              </h4>
              <p>{product.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[#141414] rounded-lg border border-[#222222]">
                  <h5 className="font-bold text-[#D4A017] mb-1">Segment Application</h5>
                  <p className="text-xs text-[#A3A3A3]">
                    Designed specifically for <strong>{product.segment}</strong> spaces ({product.product_type}), perfectly bridging artisanal luxury with functional elegance.
                  </p>
                </div>
                <div className="p-4 bg-[#141414] rounded-lg border border-[#222222]">
                  <h5 className="font-bold text-[#D4A017] mb-1">Production Origin</h5>
                  <p className="text-xs text-[#A3A3A3]">
                    Crafted with <strong>{product.production_type}</strong> mastery, delivering reliable durability and exquisite tactile presence.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'material' && (
            <div className="space-y-4 text-xs sm:text-sm text-[#CCCCCC]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#D4A017] uppercase tracking-wider block">Material Composition</span>
                  <h4 className="text-lg font-bold text-white">{product.material}</h4>
                </div>
                <div className="text-xs font-mono text-[#A3A3A3]">
                  Grade: <span className="text-[#E5B842] font-semibold">{materialInfo.category}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-[#141414] border border-[#222222] rounded-lg space-y-1.5">
                  <span className="text-xs font-bold text-[#D4A017] block uppercase tracking-wider">Texture & Touch</span>
                  <p className="text-xs text-[#CCCCCC] leading-relaxed">{materialInfo.texture}</p>
                </div>
                <div className="p-4 bg-[#141414] border border-[#222222] rounded-lg space-y-1.5">
                  <span className="text-xs font-bold text-[#D4A017] block uppercase tracking-wider">Durability Standard</span>
                  <p className="text-xs text-[#CCCCCC] leading-relaxed">{materialInfo.durability}</p>
                </div>
                <div className="p-4 bg-[#141414] border border-[#222222] rounded-lg space-y-1.5">
                  <span className="text-xs font-bold text-[#D4A017] block uppercase tracking-wider">Quality Guarantee</span>
                  <p className="text-xs text-[#CCCCCC] leading-relaxed">
                    100% inspected for consistency, surface finish, structural strength, and color adherence.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#D4A017] mb-2">Key Material Benefits:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {materialInfo.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-[#141414] rounded border border-[#262626] text-xs text-white">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-4 text-xs sm:text-sm text-[#CCCCCC]">
              <h4 className="text-base font-serif font-bold text-white tracking-wide">
                Care & Maintenance Guide
              </h4>
              <div className="p-4 bg-[#141414] border border-[#D4A017]/40 rounded-lg flex items-start gap-3">
                <Droplets className="w-5 h-5 text-[#D4A017] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">Recommended Cleaning Routine:</span>
                  <p className="text-xs text-[#CCCCCC] leading-relaxed">{materialInfo.care}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 bg-[#141414] rounded-lg border border-[#222222] space-y-1">
                  <span className="font-bold text-white text-xs block">Proper Storage</span>
                  <p className="text-xs text-[#A3A3A3]">
                    Store in a dry, well-ventilated space shielded from dampness and prolonged extreme heat.
                  </p>
                </div>
                <div className="p-3.5 bg-[#141414] rounded-lg border border-[#222222] space-y-1">
                  <span className="font-bold text-white text-xs block">Commercial Longevity</span>
                  <p className="text-xs text-[#A3A3A3]">
                    Safe for repeated use in boutique hotels and event styling when serviced with specified care instructions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-[#D4A017]/30">
          <ProductCarousel
            title="Related Crafts & Textiles"
            subtitle="Explore complementary items in this category"
            products={relatedProducts}
            mode={mode}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
            variant="dark"
          />
        </div>
      )}
    </div>
  );
};
