import React, { useState } from 'react';
import { CheckCircle2, Printer, ShoppingBag, MessageSquare, PhoneCall, Truck, Copy, Check, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types/ecommerce';

interface OrderSuccessPageProps {
  orderId: number | string;
  settings?: SiteSettings;
  onNavigate: (view: string, param?: any) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, settings, onNavigate }) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(String(orderId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappPhone = settings?.whatsapp_number
    ? settings.whatsapp_number.replace(/[^0-9]/g, '')
    : '918602414046';

  return (
    <div id="order-success-view" className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6 min-h-screen text-white">
      {/* Success Badge Banner */}
      <div className="bg-[#0A0A0A] text-white p-8 sm:p-10 rounded-2xl border border-[#D4A017] shadow-[0_0_25px_rgba(212,160,23,0.25)] text-center space-y-4">
        <div className="w-16 h-16 bg-[#D4A017] text-black rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#D4A017]/30">
          <CheckCircle2 className="w-10 h-10 text-black" />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full">
            Payment Verified & Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white pt-2">Thank You for Your Order!</h1>
          <p className="text-xs sm:text-sm text-[#CCCCCC]">
            Your payment was received successfully. Your order is now being processed at our Jaipur workshop.
          </p>
        </div>

        {/* Order ID Box with Copy Action */}
        <div className="pt-2">
          <div className="text-[11px] text-[#888888] uppercase tracking-wider mb-1.5 font-medium">Your Order Reference Number</div>
          <div className="inline-flex items-center gap-3 bg-[#141414] border border-[#D4A017] px-6 py-3 rounded-xl text-[#E5B842] font-mono text-lg sm:text-xl font-bold tracking-wide shadow-[0_0_15px_rgba(212,160,23,0.2)]">
            <span>{orderId}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-[#222222] rounded text-white hover:text-[#D4A017] transition"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">Copied to clipboard!</p>
          )}
        </div>

        {/* PRIMARY TRACK ORDER CTA BUTTON */}
        <div className="pt-3 max-w-md mx-auto">
          <button
            onClick={() => onNavigate('track-order', { orderId })}
            className="w-full py-4 px-6 bg-[#D4A017] hover:bg-[#E5B842] text-black font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2.5 transition shadow-[0_0_20px_rgba(212,160,23,0.4)] group"
          >
            <Truck className="w-5 h-5 text-black" />
            <span>Track Your Order Now</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[11px] text-[#A3A3A3] mt-2">
            View live status updates, dispatch milestones & courier tracking details.
          </p>
        </div>
      </div>

      {/* Action Options */}
      <div className="bg-[#0A0A0A] p-6 sm:p-8 rounded-2xl border border-[#D4A017] shadow-[0_0_20px_rgba(212,160,23,0.2)] space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-[#D4A017]/30 pb-3">Next Steps & Customer Support</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <a
            href={`https://wa.me/${whatsappPhone}?text=Hello%20JSArt%26Decor,%20I%20have%20placed%20Order%20${orderId}%20and%20would%20like%20to%20confirm.`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Order Updates</span>
          </a>

          {settings?.contact_phone && (
            <a
              href={`tel:${settings.contact_phone}`}
              className="p-3.5 bg-[#141414] hover:bg-[#1f1f1f] text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-[#D4A017]/50 transition"
            >
              <PhoneCall className="w-4 h-4 text-[#D4A017]" />
              <span>Call Support: {settings.contact_phone}</span>
            </a>
          )}
        </div>

        <div className="pt-2 flex flex-wrap justify-between items-center gap-3 text-xs border-t border-[#D4A017]/30">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-[#D4A017] hover:bg-[#D4A017]/10 rounded-lg font-semibold text-[#D4A017] flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white font-bold rounded-lg flex items-center gap-1.5 transition border border-[#333333]"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
