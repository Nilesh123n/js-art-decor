import React from 'react';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Truck, AlertTriangle } from 'lucide-react';
import { CartItem, SiteSettings } from '../types/ecommerce';

interface CartPageProps {
  cart: CartItem[];
  settings: SiteSettings;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onNavigate: (view: string, param?: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  cart,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate
}) => {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const freeShippingThreshold = settings.free_shipping_threshold;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : settings.standard_shipping_fee;
  const totalAmount = subtotal + shippingFee;

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Check if any wholesale MOQ violation exists
  const moqViolations = cart.filter(item => item.pricingType === 'Wholesale' && item.quantity < item.product.min_wholesale_qty);

  return (
    <div id="shopping-cart-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-screen text-white">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-[#D4A017]/30 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">Your Shopping Cart</h1>
          <p className="text-xs text-[#A3A3A3] mt-0.5">{cart.length} item(s) currently selected</p>
        </div>

        <button
          onClick={() => onNavigate('catalog')}
          className="text-xs font-semibold text-[#D4A017] hover:text-[#E5B842] flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-[#D4A017] rounded-2xl p-16 text-center space-y-4 max-w-md mx-auto shadow-[0_0_20px_rgba(212,160,23,0.15)]">
          <ShoppingBag className="w-12 h-12 text-[#D4A017]/60 mx-auto" />
          <h2 className="text-lg font-bold text-white">Your Cart is Currently Empty</h2>
          <p className="text-xs text-[#A3A3A3]">Discover our handcrafted bedsheets and art decor collections to add items.</p>
          <button
            onClick={() => onNavigate('catalog')}
            className="bg-[#D4A017] hover:bg-[#E5B842] text-black font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Progress Meter */}
            <div className="p-4 bg-[#0A0A0A] border border-[#D4A017] rounded-xl space-y-2 shadow-[0_0_15px_rgba(212,160,23,0.15)]">
              <div className="flex justify-between text-xs font-bold text-[#E5B842]">
                <span>
                  {amountNeededForFreeShipping > 0
                    ? `Add ₹${amountNeededForFreeShipping.toLocaleString('en-IN')} more for FREE Express Shipping!`
                    : '🎉 You have unlocked FREE Express Shipping!'}
                </span>
                <span className="font-mono">{Math.round(freeShippingProgress)}%</span>
              </div>
              <div className="w-full bg-[#1A1A1A] border border-[#D4A017]/30 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#D4A017] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#D4A017]"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* MOQ Violation Warning Box */}
            {moqViolations.length > 0 && (
              <div className="p-4 bg-[#1F0A0A] border border-red-500/60 rounded-xl flex items-start gap-3 text-xs text-red-300">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-red-200">Wholesale Minimum Order Quantity (MOQ) Alert:</span>
                  <p className="mt-0.5">
                    Some items in your cart do not meet the required wholesale bulk MOQ. Please adjust quantities before proceeding to checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="divide-y divide-[#D4A017]/30 bg-[#0A0A0A] border border-[#D4A017] rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(212,160,23,0.15)]">
              {cart.map((item) => {
                const isWholesale = item.pricingType === 'Wholesale';
                const moqUnmet = isWholesale && item.quantity < item.product.min_wholesale_qty;

                return (
                  <div key={item.product.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg bg-[#141414] border border-[#D4A017] shrink-0"
                      />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isWholesale ? 'bg-[#D4A017] text-black' : 'bg-[#1A1A1A] text-white border border-[#D4A017]/50'
                          }`}>
                            {item.pricingType} Tier
                          </span>
                          <span className="text-xs text-[#A3A3A3] font-mono">SKU: {item.product.sku}</span>
                        </div>

                        <h3 className="text-sm font-bold text-white">{item.product.name}</h3>

                        <p className="text-xs text-[#E5B842]">
                          ₹{item.unitPrice.toLocaleString('en-IN')} per unit
                          {isWholesale && ` (MOQ: ${item.product.min_wholesale_qty} pcs)`}
                        </p>

                        {moqUnmet && (
                          <div className="text-[11px] text-red-400 font-bold">
                            ⚠️ Increase quantity to at least {item.product.min_wholesale_qty} pcs
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#222222]">
                      <div className="flex items-center border border-[#D4A017]/60 rounded-lg overflow-hidden bg-[#141414]">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs font-bold text-[#D4A017] hover:bg-[#222222]"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs font-bold text-[#D4A017] hover:bg-[#222222]"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-[#E5B842] font-mono">
                          ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 mt-0.5 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Order Summary */}
          <div className="space-y-4">
            <div className="bg-[#0A0A0A] text-white p-6 rounded-2xl border border-[#D4A017] space-y-4 shadow-[0_0_20px_rgba(212,160,23,0.2)]">
              <h2 className="text-lg font-serif font-bold border-b border-[#D4A017]/30 pb-3 text-white">Order Summary</h2>

              <div className="space-y-2.5 text-xs text-[#CCCCCC]">
                <div className="flex justify-between">
                  <span>Items Subtotal ({cart.length})</span>
                  <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping & Handling</span>
                  <span className="font-mono text-white">
                    {shippingFee === 0 ? <span className="text-[#D4A017] font-bold uppercase">Free</span> : `₹${shippingFee}`}
                  </span>
                </div>

                <div className="border-t border-[#D4A017]/30 pt-3 flex justify-between text-sm font-bold text-white">
                  <span>Total Payable</span>
                  <span className="font-mono text-[#E5B842] text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkout')}
                disabled={moqViolations.length > 0}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  moqViolations.length > 0
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                    : 'bg-[#D4A017] hover:bg-[#E5B842] text-black shadow-[0_0_15px_rgba(212,160,23,0.4)]'
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {moqViolations.length > 0 && (
                <p className="text-[10px] text-red-400 text-center">
                  Resolve wholesale MOQ requirement alerts above to continue.
                </p>
              )}
            </div>

            <div className="p-4 bg-[#0A0A0A] border border-[#D4A017]/50 rounded-xl space-y-2 text-xs text-[#A3A3A3]">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-[#D4A017]" />
                <span>Secure Checkout Guaranteed</span>
              </div>
              <p className="text-[11px] text-[#A3A3A3] leading-normal">
                Supported payment options: Online Payment via Razorpay (UPI, Credit/Debit Cards, NetBanking) or Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
