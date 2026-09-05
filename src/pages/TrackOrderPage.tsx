import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Home, 
  Clock, 
  MapPin, 
  CreditCard, 
  Copy, 
  Check, 
  Printer, 
  ArrowLeft, 
  MessageSquare, 
  PhoneCall, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { SiteSettings, OrderTrackingData } from '../types/ecommerce';
import { ApiService } from '../services/api';

interface TrackOrderPageProps {
  orderId?: string | number;
  settings?: SiteSettings;
  onNavigate: (view: string, param?: any) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ orderId, settings, onNavigate }) => {
  const [searchOrderNo, setSearchOrderNo] = useState<string>(orderId ? String(orderId) : '');
  const [searchContact, setSearchContact] = useState<string>('');
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchTracking = async (orderNo: string, contact?: string) => {
    if (!orderNo.trim() && !contact?.trim()) {
      setErrorMessage('Please enter your Order Number or Mobile Number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await ApiService.trackOrder(orderNo.trim(), contact?.trim());
      if (res.success && res.data) {
        setTrackingData(res.data);
      } else {
        setTrackingData(null);
        setErrorMessage(res.error || res.message || 'No order found with this reference. Please verify your order number.');
      }
    } catch (err: any) {
      setTrackingData(null);
      setErrorMessage(err.message || 'Unable to fetch tracking data at the moment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      const strId = String(orderId);
      setSearchOrderNo(strId);
      fetchTracking(strId);
    }
  }, [orderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(searchOrderNo, searchContact);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const whatsappPhone = settings?.whatsapp_number
    ? settings.whatsapp_number.replace(/[^0-9]/g, '')
    : '919829012345';

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <CheckCircle2 className="w-5 h-5" />;
      case 2:
        return <Sparkles className="w-5 h-5" />;
      case 3:
        return <ShieldCheck className="w-5 h-5" />;
      case 4:
        return <Truck className="w-5 h-5" />;
      case 5:
        return <Home className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div id="track-order-view" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 min-h-screen text-white">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D4A017]/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4A017] font-medium tracking-wide uppercase">
            <button onClick={() => onNavigate('home')} className="hover:underline">Home</button>
            <span>/</span>
            <span className="text-white">Track Order</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-[#D4A017]" />
            <span>Track Your Order</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#CCCCCC] mt-1">
            Real-time fulfillment & delivery status for your JSArt&Decor handicraft orders.
          </p>
        </div>

        <button
          onClick={() => onNavigate('catalog')}
          className="text-xs font-semibold text-[#D4A017] hover:text-[#E5B842] flex items-center gap-1.5 transition border border-[#D4A017]/40 px-3.5 py-2 rounded-lg bg-[#141414]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {/* Search Order Form */}
      <div className="bg-[#0A0A0A] p-6 sm:p-8 rounded-2xl border border-[#D4A017] shadow-[0_0_20px_rgba(212,160,23,0.2)] space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6 space-y-1.5">
              <label htmlFor="search-order-id" className="block text-xs font-bold text-[#E5B842] uppercase tracking-wider">
                Order Reference Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="search-order-id"
                  type="text"
                  placeholder="e.g. JSA-123456-7890"
                  value={searchOrderNo}
                  onChange={(e) => setSearchOrderNo(e.target.value)}
                  className="w-full bg-[#141414] border border-[#D4A017]/60 focus:border-[#D4A017] rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono placeholder-[#666666] focus:outline-none ring-1 ring-transparent focus:ring-[#D4A017]/40 transition"
                />
                <Package className="w-4 h-4 text-[#D4A017] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label htmlFor="search-contact" className="block text-xs font-bold text-[#E5B842] uppercase tracking-wider">
                Mobile Number / Email <span className="text-[#888888] font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="search-contact"
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#D4A017] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#666666] focus:outline-none transition"
                />
                <PhoneCall className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 bg-[#D4A017] hover:bg-[#E5B842] text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(212,160,23,0.3)] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-black" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {errorMessage && (
          <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-xl flex items-start gap-3 text-xs text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{errorMessage}</p>
              <p className="text-[#A3A3A3]">
                Need immediate help? Feel free to contact our support on WhatsApp at{' '}
                <a
                  href={`https://wa.me/${whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4A017] underline hover:text-[#E5B842]"
                >
                  +{whatsappPhone}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-[#0A0A0A] p-8 rounded-2xl border border-[#333333] text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 bg-[#D4A017]/20 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A017]" />
          </div>
          <p className="text-sm text-[#CCCCCC]">Fetching verified order status from server...</p>
        </div>
      )}

      {/* Tracking Results */}
      {trackingData && !isLoading && (
        <div className="space-y-6">
          {/* 1. Order Status Overview Card */}
          <div className="bg-[#0A0A0A] p-6 sm:p-8 rounded-2xl border border-[#D4A017] shadow-[0_0_25px_rgba(212,160,23,0.2)] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D4A017]/30 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#888888] uppercase tracking-wider">Order Reference</span>
                  <button
                    onClick={() => copyToClipboard(trackingData.orderNumber, 'order')}
                    className="flex items-center gap-1 text-xs text-[#D4A017] hover:text-[#E5B842] transition font-medium"
                    title="Copy Order ID"
                  >
                    {copiedText === 'order' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'order' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-mono font-bold text-[#E5B842] mt-0.5">
                  #{trackingData.orderNumber}
                </h2>
                <p className="text-xs text-[#888888] mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span>Placed on {new Date(trackingData.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-[#888888] uppercase tracking-wider">Estimated Delivery</div>
                  <div className="text-sm font-bold text-white">{trackingData.estimatedDelivery}</div>
                </div>
                <div className="h-8 w-px bg-[#333333] hidden sm:block" />
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{trackingData.orderStatus} & Paid Online</span>
                </span>
              </div>
            </div>

            {/* Courier & AWB Info */}
            <div className="bg-[#141414] p-4 rounded-xl border border-[#222222] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-[#888888]">Logistics Partner</div>
                  <div className="font-bold text-white">{trackingData.courierPartner}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[11px] text-[#888888]">Waybill / Tracking No (AWB)</div>
                  <div className="font-mono font-bold text-[#E5B842]">{trackingData.trackingAwb}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(trackingData.trackingAwb, 'awb')}
                  className="p-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] rounded border border-[#333333] text-[#CCCCCC] transition"
                  title="Copy AWB Code"
                >
                  {copiedText === 'awb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[11px] text-[#888888]">Payment Method</div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Razorpay Online Gateway</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Interactive Timeline Stepper */}
            <div className="pt-2 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D4A017]" />
                <span>Tracking Milestones</span>
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#222222]">
                {trackingData.timeline.map((step) => (
                  <div key={step.step} className="relative flex items-start gap-4">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                        step.completed
                          ? 'bg-[#D4A017] text-black ring-4 ring-[#D4A017]/20 shadow-[0_0_12px_rgba(212,160,23,0.5)]'
                          : step.current
                          ? 'bg-[#141414] border-2 border-[#D4A017] text-[#D4A017] animate-pulse'
                          : 'bg-[#141414] border border-[#333333] text-[#555555]'
                      }`}
                    >
                      {getStepIcon(step.step)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-[#141414] p-4 rounded-xl border border-[#222222] space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-sm font-bold ${step.completed ? 'text-white' : 'text-[#888888]'}`}>
                          {step.title}
                        </span>
                        {step.timestamp && (
                          <span className="text-[11px] font-mono text-[#888888]">
                            {new Date(step.timestamp).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#AAAAAA] leading-relaxed">
                        {step.description}
                      </p>
                      {step.current && (
                        <div className="pt-1">
                          <span className="inline-block text-[10px] bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/40 px-2 py-0.5 rounded-full font-semibold">
                            Current Stage
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Shipping Details & Order Items Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Items in Order */}
            <div className="lg:col-span-7 bg-[#0A0A0A] p-6 rounded-2xl border border-[#D4A017]/50 shadow-[0_0_15px_rgba(212,160,23,0.15)] space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#D4A017]/30 pb-3 flex items-center justify-between">
                <span>Items in this Order ({trackingData.items.length})</span>
                <span className="text-xs text-[#D4A017] font-mono">Jaipur Workshop Batch</span>
              </h3>

              <div className="divide-y divide-[#222222] space-y-3">
                {trackingData.items.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-xl border border-[#333333] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{item.productName}</h4>
                      <p className="text-[11px] text-[#888888] font-mono mt-0.5">SKU: {item.sku}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#CCCCCC]">
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span>₹{item.unitPrice.toLocaleString('en-IN')} each</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-mono font-bold text-[#E5B842]">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-[#D4A017]/30 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#AAAAAA]">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{trackingData.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#AAAAAA]">
                  <span>Shipping Fee</span>
                  <span className="font-mono">
                    {trackingData.shippingFee === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      `₹${trackingData.shippingFee.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#222222]">
                  <span>Total Amount Paid</span>
                  <span className="font-mono text-[#D4A017] text-base">
                    ₹{trackingData.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Payment verified via Razorpay Online ({trackingData.razorpayPaymentId})</span>
                </div>
              </div>
            </div>

            {/* Right: Shipping Address & Support */}
            <div className="lg:col-span-5 space-y-6">
              {/* Delivery Address Card */}
              <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#D4A017]/50 shadow-[0_0_15px_rgba(212,160,23,0.15)] space-y-3">
                <h3 className="text-sm font-bold text-white border-b border-[#D4A017]/30 pb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4A017]" />
                  <span>Shipping Address</span>
                </h3>

                <div className="text-xs text-[#CCCCCC] space-y-1.5 leading-relaxed">
                  <div className="font-bold text-white text-sm">{trackingData.customer.fullName}</div>
                  <div>{trackingData.customer.address}</div>
                  <div>
                    {trackingData.customer.city}, {trackingData.customer.state} -{' '}
                    <span className="font-mono text-white font-bold">{trackingData.customer.pinCode}</span>
                  </div>
                  <div className="pt-2 text-[#888888] flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-[#D4A017]" />
                    <span className="text-white font-mono">{trackingData.customer.mobileNumber}</span>
                  </div>
                  {trackingData.customer.email && (
                    <div className="text-[#888888]">
                      Email: <span className="text-white">{trackingData.customer.email}</span>
                    </div>
                  )}
                  {trackingData.customer.orderNotes && (
                    <div className="p-2.5 bg-[#141414] rounded-lg border border-[#222222] text-[11px] text-[#A3A3A3] mt-2">
                      <span className="font-bold text-white">Note: </span>
                      {trackingData.customer.orderNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Support Buttons */}
              <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#D4A017]/50 shadow-[0_0_15px_rgba(212,160,23,0.15)] space-y-3">
                <h3 className="text-sm font-bold text-white border-b border-[#D4A017]/30 pb-3">
                  Quick Actions & Support
                </h3>

                <div className="space-y-2.5 text-xs">
                  <a
                    href={`https://wa.me/${whatsappPhone}?text=Hello%20JSArt%26Decor,%20I%20am%20tracking%20Order%20${trackingData.orderNumber}%20and%20would%20like%20a%20delivery%20update.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Live Updates</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-3 px-4 bg-[#141414] hover:bg-[#1E1E1E] text-white font-semibold rounded-xl flex items-center justify-center gap-2 border border-[#D4A017]/40 transition"
                  >
                    <Printer className="w-4 h-4 text-[#D4A017]" />
                    <span>Print Order Invoice</span>
                  </button>

                  {settings?.contact_phone && (
                    <a
                      href={`tel:${settings.contact_phone}`}
                      className="w-full py-2.5 px-4 text-[#CCCCCC] hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 transition text-center"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#D4A017]" />
                      <span>Call Support: {settings.contact_phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
