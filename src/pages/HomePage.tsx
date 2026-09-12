import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Sparkles, ChevronLeft, ChevronRight, Award, Shield, Truck, RotateCcw, 
  Headphones, Layers, Tag, Percent, Gift, Copy, Check, Flame, Clock, BadgePercent 
} from 'lucide-react';
import { Product, Blog, Partner, SiteSettings, Banner, PageSection } from '../types/ecommerce';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { ProductCarousel } from '../components/common/ProductCarousel';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ApiService } from '../services/api';
import type { PlannerSegment } from '../components/planner/ArtDecorPlannerModal';

const ArtDecorPlannerModal = React.lazy(() => 
  import('../components/planner/ArtDecorPlannerModal').then(m => ({ default: m.ArtDecorPlannerModal }))
);

import heroGold1 from '../assets/images/hero_gold_decor_1_1786612841855.jpg';
import heroGold2 from '../assets/images/hero_gold_decor_2_1786612862864.jpg';
import heroGold3 from '../assets/images/hero_gold_decor_3_1786612875593.jpg';

interface HomePageProps {
  products: Product[];
  blogs: Blog[];
  partners: Partner[];
  settings: SiteSettings;
  mode: 'Retail' | 'Wholesale';
  setMode: (mode: 'Retail' | 'Wholesale') => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, pricingType: 'Retail' | 'Wholesale') => void;
  onNavigate: (view: string, param?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  blogs,
  partners,
  settings,
  mode,
  setMode,
  onSelectProduct,
  onAddToCart,
  onNavigate
}) => {
  const [heroSlide, setHeroSlide] = useState(0);
  const [dbBanners, setDbBanners] = useState<Banner[]>([]);
  const [dbSections, setDbSections] = useState<PageSection[]>([]);
  const [plannerModalOpen, setPlannerModalOpen] = useState<boolean>(false);
  const [plannerInitialSegment, setPlannerInitialSegment] = useState<PlannerSegment>('Home');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [activeOfferTicker, setActiveOfferTicker] = useState(0);

  const handleOpenPlanner = (segment: PlannerSegment) => {
    setPlannerInitialSegment(segment);
    setPlannerModalOpen(true);
  };

  const handleCopyCoupon = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code);
      } else {
        const el = document.createElement('textarea');
        el.value = code;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
    } catch {
      // Fallback
    }
    setCopiedCoupon(code);
    setTimeout(() => {
      setCopiedCoupon(null);
    }, 2500);
  };

  useEffect(() => {
    // Load dynamic banners and sections from MySQL
    ApiService.getBanners().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setDbBanners(data);
      }
    }).catch(console.error);

    ApiService.getSections('home').then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setDbSections(data);
      }
    }).catch(console.error);
  }, []);

  const defaultHeroSlides = [
    {
      subtitle: 'PREMIUM QUALITY • TIMELESS ELEGANCE',
      titleLine1: 'Crafted Luxury',
      titleLine2: 'Textiles &',
      titleHighlight: 'Artisan Decor',
      description: 'Manufacturer, Wholesaler & Retailer of premium home textiles & handcrafted decor items.',
      bgImage: heroGold1,
      linkUrl: 'catalog',
      buttonText: 'SHOP WHOLESALE'
    },
    {
      subtitle: 'EXCLUSIVE WHOLESALE & RETAIL COLLECTION',
      titleLine1: 'Royal Linens &',
      titleLine2: 'Hotel Quality',
      titleHighlight: 'Bedding Sets',
      description: 'Elevate your spaces with 100% fine cotton, handblock prints and designer quilts.',
      bgImage: heroGold2,
      linkUrl: 'catalog',
      buttonText: 'SHOP WHOLESALE'
    },
    {
      subtitle: 'HANDMADE BY SKILLED ARTISANS',
      titleLine1: 'Heritage Indian',
      titleLine2: 'Block Prints &',
      titleHighlight: 'Custom Decor',
      description: 'Direct factory pricing for bulk orders, hospitality partners and event decorators.',
      bgImage: heroGold3,
      linkUrl: 'wholesale-tree',
      buttonText: 'EXPLORE WHOLESALE'
    }
  ];

  const activeHeroBanners = dbBanners.filter((b) => b.banner_type === 'hero' && b.is_active);

  const heroSlides = activeHeroBanners.length > 0
    ? activeHeroBanners.map((b) => ({
        subtitle: b.subtitle || 'PREMIUM QUALITY • TIMELESS ELEGANCE',
        titleLine1: b.title,
        titleLine2: '',
        titleHighlight: b.highlight_text || '',
        description: b.description || 'Manufacturer, Wholesaler & Retailer of premium home textiles & handcrafted decor.',
        bgImage: b.image_url,
        linkUrl: b.link_url || 'catalog',
        buttonText: b.button_text || 'SHOP NOW'
      }))
    : defaultHeroSlides;

  React.useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const currentSlide = heroSlides[heroSlide];

  // 20% OFF Deal Products (Curated for the Golden Offer Bar)
  const dealProducts = (products && products.length > 0)
    ? products.slice(0, 6)
    : INITIAL_PRODUCTS.slice(0, 6);

  const [activeDealIndex, setActiveDealIndex] = useState(0);

  // Auto rotate 20% OFF featured deal every 6 seconds
  useEffect(() => {
    if (dealProducts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveDealIndex((prev) => (prev + 1) % dealProducts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [dealProducts.length]);

  const currentDealProduct = dealProducts[activeDealIndex] || dealProducts[0] || INITIAL_PRODUCTS[0];
  const dealOriginalPrice = currentDealProduct.retail_price || 2499;
  const dealDiscountedPrice = Math.round(dealOriginalPrice * 0.8); // 20% OFF
  const dealSavings = dealOriginalPrice - dealDiscountedPrice;
  const dealOneLineDetail = currentDealProduct.short_description || 
    (currentDealProduct.description ? `${currentDealProduct.description.slice(0, 95)}...` : '') || 
    `${currentDealProduct.material || '100% Pure Organic Cotton'} • ${currentDealProduct.size || 'King Size'} • Authentic Jaipur Handblock`;

  const activePromoBanners = dbBanners.filter((b) => b.banner_type === 'promo' && b.is_active);

  const handleNextHero = () => {
    setHeroSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevHero = () => {
    setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handmadeProducts = products.filter(p => p.production_type === 'Handmade');
  const factoryProducts = products.filter(p => p.production_type === 'Factory');

  const displayHomemade = handmadeProducts.length > 0 ? handmadeProducts : products.filter(p => p.is_featured);
  const displayFactory = factoryProducts.length > 0 ? factoryProducts : products.filter(p => p.is_new_arrival);

  return (
    <div className="bg-[#000000] text-white overflow-x-hidden font-sans min-h-screen">
      {/* -------------------------------------------------- */}
      {/* 1. HERO SECTION (FULL BACKGROUND IMAGE + GOLDEN THEME) */}
      {/* -------------------------------------------------- */}
      <section className="relative bg-[#000000] text-white overflow-hidden border-b border-[#D4A017]/40 min-h-[520px] lg:min-h-[620px] flex flex-col justify-between">
        {/* Full Hero Background Image with Smooth Golden Crossfade */}
        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === heroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <ImageWithFallback
                src={slide.bgImage}
                alt={slide.titleLine1}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
          {/* Dark Overlay Gradient (Fade from black on left to transparent on right) */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#000000] via-[#000000]/90 lg:via-[#000000]/75 to-transparent w-full lg:w-3/4" />
          <div className="absolute inset-0 z-10 bg-black/25" />
          {/* Golden Ambient Glow Accent */}
          <div className="absolute inset-0 z-10 bg-[#D4A017]/10 pointer-events-none mix-blend-overlay" />
        </div>

        {/* Hero Navigation Arrows */}
        <button 
          onClick={handlePrevHero}
          aria-label="Previous Slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-[#D4A017] hover:text-white bg-black/70 hover:bg-[#D4A017] hover:text-black transition-all p-3 rounded-full border border-[#D4A017] shadow-lg backdrop-blur-xs"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={handleNextHero}
          aria-label="Next Slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-[#D4A017] hover:text-white bg-black/70 hover:bg-[#D4A017] hover:text-black transition-all p-3 rounded-full border border-[#D4A017] shadow-lg backdrop-blur-xs"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Hero Content Overlay Container */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 py-16 lg:py-24 flex-1 flex flex-col justify-center">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 text-[#D4A017] text-[11px] font-mono tracking-widest uppercase">
              <span>{currentSlide.subtitle}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.15]">
              {currentSlide.titleLine1} <br />
              {currentSlide.titleLine2} <br />
              <span className="text-[#E5B842] drop-shadow-sm">{currentSlide.titleHighlight}</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#CCCCCC] font-light leading-relaxed max-w-md">
              {currentSlide.description}
            </p>

            {/* Action Buttons matching reference image */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => {
                  setMode('Wholesale');
                  onNavigate('catalog', { availability: 'Wholesale' });
                }}
                className="bg-[#D4A017] hover:bg-[#E5B842] text-[#000000] font-bold text-xs px-8 py-3.5 rounded transition-all duration-200 shadow-lg uppercase tracking-wider hover:scale-[1.02] border border-[#D4A017]"
              >
                SHOP WHOLESALE
              </button>

              <button
                onClick={() => {
                  setMode('Retail');
                  onNavigate('catalog', { availability: 'Retail' });
                }}
                className="bg-black/60 hover:bg-[#D4A017] hover:text-black text-white border border-[#D4A017] font-bold text-xs px-8 py-3.5 rounded transition-all duration-200 uppercase tracking-wider backdrop-blur-xs"
              >
                SHOP RETAIL
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots at Bottom Center */}
        <div className="relative z-10 flex items-center justify-center gap-2.5 pb-6">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                heroSlide === idx ? 'w-3 h-3 bg-[#D4A017] scale-110 shadow-[0_0_8px_#D4A017]' : 'w-2 h-2 bg-[#555555] hover:bg-[#D4A017]'
              }`}
            />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 2. GOLDEN OFFER BAR (20% OFF • ONE-LINE DETAIL • PRODUCT IMAGE • BUY NOW) */}
      {/* -------------------------------------------------- */}
      <section 
        id="golden-offer-bar" 
        className="w-full bg-gradient-to-r from-[#D4A017] via-[#F3E5AB] to-[#D4A017] border-y-2 border-[#D4A017] text-black py-4 sm:py-6 px-4 sm:px-6 shadow-[0_10px_35px_rgba(212,160,23,0.45)] relative z-20"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          
          {/* Left / Middle: 20% OFF Badge, Headline, 1-Line Product Detail & Pricing */}
          <div className="flex-1 min-w-0 w-full text-left space-y-2">
            {/* Top Row: 20% OFF Badge & Special Promotion Pill */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-[#D4A017] font-black text-xs sm:text-sm tracking-wider uppercase shadow-md shrink-0">
                <Flame className="w-4 h-4 fill-[#D4A017] text-[#D4A017] animate-pulse" />
                <span>FLAT 20% OFF</span>
              </span>
              <span className="text-[11px] sm:text-xs font-black tracking-widest text-black/90 uppercase bg-black/10 px-2.5 py-0.5 rounded-md border border-black/25">
                FESTIVE SPECIAL DEAL
              </span>
              {dealProducts.length > 1 && (
                <span className="text-[11px] font-mono font-bold text-black/80 hidden sm:inline-block">
                  Offer {activeDealIndex + 1} of {dealProducts.length}
                </span>
              )}
            </div>

            {/* Product Name & One-Line Product Detail */}
            <div 
              onClick={() => onSelectProduct(currentDealProduct)}
              className="cursor-pointer group"
              title={`Click to view ${currentDealProduct.name}`}
            >
              <h3 className="text-base sm:text-lg md:text-xl font-serif font-black text-black tracking-tight leading-snug group-hover:underline flex items-center gap-2">
                <span className="truncate">{currentDealProduct.name}</span>
                <span className="text-xs font-sans font-black bg-black text-[#D4A017] px-2 py-0.5 rounded shrink-0">
                  20% OFF
                </span>
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-black/90 truncate mt-0.5 leading-relaxed">
                {dealOneLineDetail}
              </p>
            </div>

            {/* Price & Savings Tag */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-3 pt-0.5">
              <span className="text-base sm:text-xl font-black text-black font-sans">
                ₹{dealDiscountedPrice.toLocaleString('en-IN')}
              </span>
              <span className="line-through text-black/60 text-xs sm:text-sm font-bold">
                MRP ₹{dealOriginalPrice.toLocaleString('en-IN')}
              </span>
              <span className="bg-black text-[#D4A017] text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded tracking-wider uppercase shadow-xs">
                SAVE ₹{dealSavings.toLocaleString('en-IN')} (20% OFF)
              </span>
              <span className="text-[11px] font-bold text-black/80 hidden md:inline-block">
                • Auto-Applied or Use Coupon: <strong className="font-mono underline">FESTIVE20</strong>
              </span>
            </div>
          </div>

          {/* Right Side: Enlarged Clear Product Image + BUY NOW Button + Switcher */}
          <div className="flex flex-row items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full md:w-auto shrink-0 border-t md:border-t-0 border-black/15 pt-3 md:pt-0">
            
            {/* Enlarged Crisp Product Image for Clear Visibility */}
            <div 
              onClick={() => onSelectProduct(currentDealProduct)}
              className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-black/50 shadow-xl shrink-0 cursor-pointer bg-black/10 group transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              title={`View ${currentDealProduct.name}`}
            >
              <img
                src={currentDealProduct.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                alt={currentDealProduct.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute bottom-0 inset-x-0 bg-black/90 text-[#D4A017] text-[10px] font-black text-center py-0.5 tracking-wider">
                -20% OFF
              </span>
            </div>

            {/* Actions: BUY NOW Button + Deal Switcher Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="buy-now-offer-btn"
                type="button"
                onClick={() => onSelectProduct(currentDealProduct)}
                className="bg-black hover:bg-neutral-900 text-[#D4A017] hover:text-white font-serif font-black text-xs sm:text-sm px-6 sm:px-8 py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl hover:shadow-black/50 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap group"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-4 h-4 text-[#D4A017] group-hover:text-white group-hover:translate-x-1 transition-transform" />
              </button>

              {dealProducts.length > 1 && (
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => setActiveDealIndex((prev) => (prev - 1 + dealProducts.length) % dealProducts.length)}
                    className="w-7 h-7 rounded-lg bg-black/20 hover:bg-black text-black hover:text-[#D4A017] flex items-center justify-center transition cursor-pointer"
                    title="Previous Deal"
                    aria-label="Previous Deal"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveDealIndex((prev) => (prev + 1) % dealProducts.length)}
                    className="w-7 h-7 rounded-lg bg-black/20 hover:bg-black text-black hover:text-[#D4A017] flex items-center justify-center transition cursor-pointer"
                    title="Next Deal"
                    aria-label="Next Deal"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 3. HOME / HOTEL / EVENT CARDS - ORDERED VERTICALLY WITH ART & DECOR PLANNER BUTTON */}
      {/* -------------------------------------------------- */}
      <section className="bg-[#000000] py-12 border-b border-[#D4A017]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-[#D4A017] uppercase bg-[#D4A017]/10 px-3 py-1 rounded-full border border-[#D4A017]/30">
              EXPLORE BY SEGMENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Tailored Decor for Home, Hospitality &amp; Events
            </h2>
            <p className="text-xs sm:text-sm text-[#AAAAAA] font-light">
              Explore curated collections or use our dedicated <strong className="text-[#D4A017]">Art &amp; Decor Planner</strong> to receive custom styling, fabric samples, and factory-direct estimates.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:gap-8">
            {/* 1. HOME CARD */}
            <div 
              id="segment-card-home"
              className="group relative min-h-[22rem] md:min-h-[19rem] rounded-2xl overflow-hidden border-2 border-[#D4A017] hover:border-[#E5B842] shadow-[0_0_20px_rgba(212,160,23,0.3)] hover:shadow-[0_0_35px_rgba(212,160,23,0.6)] transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
            >
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1600&q=80" 
                alt="HOME"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#000000] via-[#000000]/85 to-black/35" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3 max-w-xl text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#D4A017] uppercase bg-[#D4A017]/20 border border-[#D4A017]/40 px-2 py-0.5 rounded">
                      SEGMENT 01 • RESIDENTIAL &amp; LIVING
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-widest">
                    HOME
                  </h3>
                  <p className="text-xs sm:text-sm text-[#CCCCCC] font-light leading-relaxed">
                    Premium cotton bedding, luxury velvet embroidered cushions, artisanal handcrafted brass wall art, and ambient lighting tailored for private residences and villas.
                  </p>

                  {/* 3 Dedicated Category Buttons */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('catalog', { segment: 'Home', product_type: 'HOME DECOR' });
                      }}
                      className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-xs font-bold py-2 px-3 rounded-lg transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                    >
                      Textile
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('catalog', { segment: 'Home', product_type: 'ART DECOR' });
                      }}
                      className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-xs font-bold py-2 px-3 rounded-lg transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                    >
                      Art Decor
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('catalog', { segment: 'Home', product_type: 'ELECTRIC DECOR' });
                      }}
                      className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-xs font-bold py-2 px-3 rounded-lg transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                    >
                      Electric Decor
                    </button>
                  </div>
                </div>

                {/* ART & DECOR PLANNER BUTTON & PROMO */}
                <div className="bg-black/80 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-[#D4A017]/40 text-center lg:text-right space-y-3 shrink-0 lg:min-w-[280px]">
                  <div className="text-[11px] text-[#A3A3A3] font-light">
                    Planning a home renovation or room styling?
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPlanner('Home');
                    }}
                    className="w-full bg-gradient-to-r from-[#D4A017] via-[#F3E5AB] to-[#D4A017] hover:from-[#E5B842] hover:to-[#C59012] text-black font-serif font-bold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-[0_0_20px_rgba(212,160,23,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-102 uppercase tracking-wider group cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
                    <span>Art &amp; Decor Planner</span>
                    <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="text-[10px] text-[#D4A017] font-mono">
                    Free Consultation • Custom Swatches
                  </div>
                </div>
              </div>
            </div>

            {/* 2. HOTEL CARD */}
            <div 
              id="segment-card-hotel"
              className="group relative min-h-[22rem] md:min-h-[19rem] rounded-2xl overflow-hidden border-2 border-[#D4A017] hover:border-[#E5B842] shadow-[0_0_20px_rgba(212,160,23,0.3)] hover:shadow-[0_0_35px_rgba(212,160,23,0.6)] transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
            >
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80" 
                alt="HOTEL"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#000000] via-[#000000]/85 to-black/35" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3 max-w-xl text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#D4A017] uppercase bg-[#D4A017]/20 border border-[#D4A017]/40 px-2 py-0.5 rounded">
                      SEGMENT 02 • HOSPITALITY &amp; RESORTS
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-widest">
                    HOTEL
                  </h3>
                  <p className="text-xs sm:text-sm text-[#CCCCCC] font-light leading-relaxed">
                    Hospitality-grade 400 TC satin stripe bed linens, luxury lobby brass metal installations, banquet table runners, and commercial chandeliers engineered for luxury hotels and resorts.
                  </p>

                  {/* 3 Dedicated Category Buttons */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('catalog', { segment: 'Hotel', product_type: 'HOME DECOR' });
                      }}
                      className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-xs font-bold py-2 px-3 rounded-lg transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                    >
                      Textile
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('catalog', { segment: 'Hotel', product_type: 'ART DECOR' });
                      }}
                      className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-xs font-bold py-2 px-3 rounded-lg transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                    >
                      Art Decor
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('catalog', { segment: 'Hotel', product_type: 'ELECTRIC DECOR' });
                      }}
                      className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-xs font-bold py-2 px-3 rounded-lg transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                    >
                      Electric Decor
                    </button>
                  </div>
                </div>

                {/* ART & DECOR PLANNER BUTTON & PROMO */}
                <div className="bg-black/80 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-[#D4A017]/40 text-center lg:text-right space-y-3 shrink-0 lg:min-w-[280px]">
                  <div className="text-[11px] text-[#A3A3A3] font-light">
                    Boutique hotel, resort or banquet revamp?
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPlanner('Hotel');
                    }}
                    className="w-full bg-gradient-to-r from-[#D4A017] via-[#F3E5AB] to-[#D4A017] hover:from-[#E5B842] hover:to-[#C59012] text-black font-serif font-bold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-[0_0_20px_rgba(212,160,23,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-102 uppercase tracking-wider group cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
                    <span>Art &amp; Decor Planner</span>
                    <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="text-[10px] text-[#D4A017] font-mono">
                    Bulk Factory Pricing • Sample Kits
                  </div>
                </div>
              </div>
            </div>

            {/* 3. EVENT CARD */}
            <div 
              id="segment-card-event"
              className="group relative min-h-[22rem] md:min-h-[19rem] rounded-2xl overflow-hidden border-2 border-[#D4A017] hover:border-[#E5B842] shadow-[0_0_20px_rgba(212,160,23,0.3)] hover:shadow-[0_0_35px_rgba(212,160,23,0.6)] transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
            >
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80" 
                alt="EVENT"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#000000] via-[#000000]/85 to-black/35" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3 max-w-xl text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#D4A017] uppercase bg-[#D4A017]/20 border border-[#D4A017]/40 px-2 py-0.5 rounded">
                      SEGMENT 03 • WEDDINGS &amp; CELEBRATIONS
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-widest">
                    EVENT
                  </h3>
                  <p className="text-xs sm:text-sm text-[#CCCCCC] font-light leading-relaxed">
                    Opulent handcrafted zardozi velvet runners, antique terracotta accents, grand mandap stage installations, and illuminated crystal fixtures for memorable celebrations.
                  </p>

                  {/* 3 Dedicated Category Buttons */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('catalog', { segment: 'Event', product_type: 'HOME DECOR' });
                      }}
                      className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-xs font-bold py-2 px-3 rounded-lg transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                    >
                      Textile
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('catalog', { segment: 'Event', product_type: 'ART DECOR' });
                      }}
                      className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-xs font-bold py-2 px-3 rounded-lg transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                    >
                      Art Decor
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('catalog', { segment: 'Event', product_type: 'ELECTRIC DECOR' });
                      }}
                      className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-xs font-bold py-2 px-3 rounded-lg transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                    >
                      Electric Decor
                    </button>
                  </div>
                </div>

                {/* ART & DECOR PLANNER BUTTON & PROMO */}
                <div className="bg-black/80 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-[#D4A017]/40 text-center lg:text-right space-y-3 shrink-0 lg:min-w-[280px]">
                  <div className="text-[11px] text-[#A3A3A3] font-light">
                    Wedding, reception or corporate gala setup?
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPlanner('Event');
                    }}
                    className="w-full bg-gradient-to-r from-[#D4A017] via-[#F3E5AB] to-[#D4A017] hover:from-[#E5B842] hover:to-[#C59012] text-black font-serif font-bold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-[0_0_20px_rgba(212,160,23,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-102 uppercase tracking-wider group cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
                    <span>Art &amp; Decor Planner</span>
                    <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="text-[10px] text-[#D4A017] font-mono">
                    Theme Concepts • Turnkey Delivery
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 4. TRUST FEATURES STRIP (Dark Black + Gold) */}
      {/* -------------------------------------------------- */}
      <section className="bg-[#050505] border-b border-[#D4A017]/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
            <Shield className="w-6 h-6 text-[#D4A017] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Premium Quality</h4>
              <p className="text-[11px] text-[#A3A3A3]">Finest materials</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
            <Sparkles className="w-6 h-6 text-[#D4A017] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Handmade with Care</h4>
              <p className="text-[11px] text-[#A3A3A3]">Crafted by skilled artisans</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
            <Truck className="w-6 h-6 text-[#D4A017] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Pan India Delivery</h4>
              <p className="text-[11px] text-[#A3A3A3]">Fast & secure shipping</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
            <Award className="w-6 h-6 text-[#D4A017] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Secure Payments</h4>
              <p className="text-[11px] text-[#A3A3A3]">100% safe & secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 5. SHOP BY CATEGORY (HOME DECOR, ART DECOR, ELECTRIC DECOR) */}
      {/* -------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white uppercase tracking-wider">
            SHOP BY CATEGORY
          </h2>

          {/* Gold Ornament Flourish Line */}
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <div className="w-8 h-[1px] bg-[#D4A017]/60" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A017]" />
            <div className="w-8 h-[1px] bg-[#D4A017]/60" />
          </div>
          <p className="text-xs text-[#A3A3A3] mt-2">
            Explore our curated collections of Home Decor, Art Decor & Electric Decor
          </p>
        </div>

        {/* Circular Categories Pill Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            {
              name: 'HOME DECOR',
              param: { product_type: 'HOME DECOR' },
              img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'
            },
            {
              name: 'ART DECOR',
              param: { product_type: 'ART DECOR' },
              img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80'
            },
            {
              name: 'ELECTRIC DECOR',
              param: { product_type: 'ELECTRIC DECOR' },
              img: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80'
            },
            {
              name: 'HANDMADE',
              param: { production_type: 'Handmade' },
              img: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=400&q=80'
            },
            {
              name: 'FACTORY CRAFT',
              param: { production_type: 'Factory' },
              img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80'
            },
            {
              name: 'HOTEL & EVENT',
              param: { segment: 'Hotel' },
              img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=400&q=80'
            }
          ].map((cat) => (
            <div
              key={cat.name}
              onClick={() => onNavigate('catalog', cat.param)}
              className="group flex flex-col items-center text-center cursor-pointer space-y-2"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#D4A017] group-hover:border-[#E5B842] shadow-[0_0_12px_rgba(212,160,23,0.35)] group-hover:shadow-[0_0_20px_rgba(212,160,23,0.6)] transition-all duration-300 p-1 bg-[#0A0A0A]">
                <ImageWithFallback
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xs font-serif font-bold text-white group-hover:text-[#D4A017] transition-colors">{cat.name}</h3>
              <span className="text-[10px] font-sans text-[#D4A017]">View Collection</span>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 6. HOMEMADE PRODUCTS */}
      {/* -------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ProductCarousel
          title="HOMEMADE PRODUCTS"
          products={displayHomemade}
          mode={mode}
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
          variant="dark"
        />
      </div>

      {/* -------------------------------------------------- */}
      {/* 7. FACTORY PRODUCTS */}
      {/* -------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ProductCarousel
          title="FACTORY PRODUCTS"
          products={displayFactory}
          mode={mode}
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
          variant="dark"
        />
      </div>

      {/* -------------------------------------------------- */}
      {/* 8. OUR PARTNERS & FROM OUR BLOG (Dark #000000 + Gold Borders) */}
      {/* -------------------------------------------------- */}
      <section className="bg-[#000000] text-white py-12 border-t border-[#D4A017]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2/3: OUR PARTNERS */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                    OUR PARTNERS
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-[1px] bg-[#D4A017]/60" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A017]" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded border border-[#D4A017]/50 text-[#D4A017] hover:border-[#D4A017] hover:bg-[#D4A017] hover:text-black transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded border border-[#D4A017]/50 text-[#D4A017] hover:border-[#D4A017] hover:bg-[#D4A017] hover:text-black transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Partner Cards Grid with Golden Borders */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { name: 'Sarovar Hotels', logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80' },
                  { name: 'Taj Hotels', logo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=300&q=80' },
                  { name: 'The Oberoi', logo: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=80' },
                  { name: 'Radisson', logo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=300&q=80' },
                  { name: 'ITC Hotels', logo: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=300&q=80' }
                ].map((partner, idx) => (
                  <div key={idx} className="bg-[#0A0A0A] p-3 rounded-lg border border-[#D4A017] h-20 flex flex-col items-center justify-center text-center shadow-[0_0_10px_rgba(212,160,23,0.2)] hover:border-[#E5B842] transition">
                    <span className="text-[10px] font-serif font-extrabold text-[#E5B842] uppercase tracking-wider">
                      {partner.name}
                    </span>
                    <span className="text-[8px] text-[#A3A3A3]">HOTELS & RESORTS</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1/3: FROM OUR BLOG */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                  FROM OUR BLOG
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-[1px] bg-[#D4A017]/60" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A017]" />
                </div>
              </div>

              <div className="space-y-4">
                {blogs.slice(0, 3).map((blog) => (
                  <div 
                    key={blog.id} 
                    onClick={() => onNavigate('blogs', { blogId: blog.id })}
                    className="flex gap-3 items-center group cursor-pointer bg-[#0A0A0A] p-2.5 rounded-lg border border-[#D4A017] hover:border-[#E5B842] shadow-[0_0_10px_rgba(212,160,23,0.2)] transition"
                  >
                    <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-neutral-900 border border-[#D4A017]/50">
                      <ImageWithFallback src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="text-xs font-serif font-bold text-white group-hover:text-[#D4A017] transition line-clamp-2">
                        {blog.title}
                      </h4>
                      <p className="text-[10px] text-[#A3A3A3]">
                        {(blog.created_at || '').substring(0, 10) || 'Recent'}
                      </p>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => onNavigate('blogs')}
                  className="w-full text-center py-2 text-xs font-bold text-[#D4A017] hover:text-[#E5B842] border border-[#D4A017]/40 hover:border-[#D4A017] rounded-lg transition bg-[#0A0A0A] shadow-[0_0_8px_rgba(212,160,23,0.15)]"
                >
                  View All Blog Articles →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 9. PREMIUM SERVICE STRIP (#000000 + Gold) */}
      {/* -------------------------------------------------- */}
      <section className="bg-[#000000] text-white py-8 border-t border-[#D4A017]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
            <Shield className="w-5 h-5 text-[#D4A017] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% SECURE PAYMENT</h4>
              <p className="text-[11px] text-[#A3A3A3]">Secure & trusted checkout</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
            <RotateCcw className="w-5 h-5 text-[#D4A017] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">EASY RETURNS</h4>
              <p className="text-[11px] text-[#A3A3A3]">Hassle free returns</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
            <Award className="w-5 h-5 text-[#D4A017] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">QUALITY GUARANTEE</h4>
              <p className="text-[11px] text-[#A3A3A3]">Premium quality assured</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
            <Headphones className="w-5 h-5 text-[#D4A017] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">24/7 SUPPORT</h4>
              <p className="text-[11px] text-[#A3A3A3]">We are here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Art & Decor Planner Studio Modal */}
      {plannerModalOpen && (
        <React.Suspense fallback={null}>
          <ArtDecorPlannerModal
            isOpen={plannerModalOpen}
            onClose={() => setPlannerModalOpen(false)}
            initialSegment={plannerInitialSegment}
            whatsappNumber={settings.whatsapp_number}
          />
        </React.Suspense>
      )}
    </div>
  );
};
