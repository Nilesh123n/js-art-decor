import React from 'react';
import { CheckCircle2, Printer, ShoppingBag, MessageSquare, PhoneCall } from 'lucide-react';
import { SiteSettings } from '../types/ecommerce';

interface OrderSuccessPageProps {
  orderId: number | string;
  settings?: SiteSettings;
  onNavigate: (view: string, param?: any) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, settings, onNavigate }) => {
  const handlePrint = () => {
    window.print();
  };

  const whatsappPhone = settings?.whatsapp_number
    ? settings.whatsapp_number.replace(/[^0-9]/g, '')
    : '919829012345';

  return (
    <div id="order-success-view" className="max-w-2xl mx-auto px-4 sm:px-6 py-16 space-y-8 min-h-screen text-white">
      {/* Success Badge Banner */}
      <div className="bg-[#0A0A0A] text-white p-8 sm:p-10 rounded-2xl border border-[#D4A017] shadow-[0_0_25px_rgba(212,160,23,0.25)] text-center space-y-4">
        <div className="w-16 h-16 bg-[#D4A017] text-black rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#D4A017]/30">
          <CheckCircle2 className="w-10 h-10 text-black" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">Order Confirmed Successfully!</h1>
          <p className="text-xs sm:text-sm text-[#CCCCCC]">
            Thank you for choosing JSArt&Decor. Your order reference number is:
          </p>
        </div>

        <div className="inline-block bg-[#141414] border border-[#D4A017] px-6 py-2.5 rounded-xl text-[#E5B842] font-mono text-lg font-bold tracking-wide shadow-[0_0_15px_rgba(212,160,23,0.2)]">
          {orderId}
        </div>

        <p className="text-xs text-[#A3A3A3] max-w-md mx-auto pt-2">
          Your order details have been securely recorded in our database. Our sales team will verify your items and contact you regarding delivery status.
        </p>
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
            <span>Confirm Order on WhatsApp</span>
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

        <div className="pt-2 flex justify-between items-center text-xs border-t border-[#D4A017]/30">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-[#D4A017] hover:bg-[#D4A017]/10 rounded-lg font-semibold text-[#D4A017] flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>Print Confirmation Page</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2 bg-[#D4A017] hover:bg-[#E5B842] text-black font-bold rounded-lg flex items-center gap-1.5 transition shadow-[0_0_10px_rgba(212,160,23,0.3)]"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-black" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
