import React, { useState } from 'react';
import { ShoppingBag, Eye, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types/ecommerce';

interface ProductCardProps {
  product: Product;
  mode: 'Retail' | 'Wholesale';
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, pricingType: 'Retail' | 'Wholesale') => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  mode,
  onSelectProduct,
  onAddToCart
}) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const displayPrice = mode === 'Wholesale' ? product.wholesale_price : product.retail_price;
  const isWholesaleMode = mode === 'Wholesale';
  const minQty = isWholesaleMode ? product.min_wholesale_qty : 1;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, minQty, isWholesaleMode ? 'Wholesale' : 'Retail');
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  // Determine badge type matching reference image
  const isFeatured = product.is_featured;
  const isNew = product.is_new_arrival;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelectProduct(product)}
      className="group bg-[#0A0A0A] rounded-lg border border-[#D4A017] hover:border-[#E5B842] shadow-[0_0_12px_rgba(212,160,23,0.2)] hover:shadow-[0_0_22px_rgba(212,160,23,0.45)] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      <div>
        {/* Product Image Container */}
        <div 
          className="relative aspect-square bg-[#141414] border-b border-[#D4A017]/40 overflow-hidden"
          onMouseEnter={() => product.images.length > 1 && setCurrentImageIdx(1)}
          onMouseLeave={() => setCurrentImageIdx(0)}
        >
          <img
            src={product.images[currentImageIdx] || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges Overlay matching reference image */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {isFeatured ? (
              <span className="bg-[#D4A017] text-[#000000] text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
                FEATURED
              </span>
            ) : isNew ? (
              <span className="bg-[#14B8A6] text-white text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
                NEW
              </span>
            ) : (
              <span className="bg-[#D4A017] text-[#000000] text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
                {product.production_type || 'FEATURED'}
              </span>
            )}
          </div>

          {/* Wholesale MOQ Badge if wholesale mode */}
          {isWholesaleMode && (
            <div className="absolute bottom-2 left-2 bg-[#000000]/90 text-[#D4A017] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#D4A017]/60">
              MOQ: {product.min_wholesale_qty} pcs
            </div>
          )}

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="absolute top-2.5 right-2.5 p-2 bg-[#000000]/80 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017]/60 rounded-full shadow transition-all opacity-0 group-hover:opacity-100"
            title="Quick view product details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Details Section matching reference image */}
        <div className="p-3.5 space-y-1">
          <h3 className="text-xs sm:text-sm font-sans font-semibold text-white line-clamp-1 group-hover:text-[#D4A017] transition-colors leading-tight">
            {product.name}
          </h3>

          <div className="text-[11px] text-[#A3A3A3] font-sans">
            {product.product_type || product.category || 'Home Decor'}
          </div>

          <div className="pt-1.5 flex items-baseline justify-between">
            <div className="text-xs sm:text-sm font-bold font-sans text-[#E5B842]">
              ₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Add To Cart Hover / Bottom Button */}
      <div className="p-3.5 pt-0">
        <button
          onClick={handleQuickAdd}
          disabled={product.stock_quantity <= 0}
          className={`w-full py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
            addedAnimation
              ? 'bg-emerald-600 text-white'
              : product.stock_quantity <= 0
              ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
              : 'bg-[#1A1A1A] hover:bg-[#D4A017] hover:text-black text-white border border-[#D4A017]/60'
          }`}
        >
          {addedAnimation ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Added!</span>
            </>
          ) : product.stock_quantity <= 0 ? (
            <span>Out of Stock</span>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isWholesaleMode ? `Add Bulk (${product.min_wholesale_qty})` : 'Add to Cart'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
