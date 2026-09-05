import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Award, Shield, Truck, RotateCcw, Headphones, Crown, Medal, Star, Gem, Layers } from 'lucide-react';
import { Product, Blog, Partner, SiteSettings, Banner, PageSection } from '../types/ecommerce';
import { ProductCarousel } from '../components/common/ProductCarousel';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ApiService } from '../services/api';

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
      {/* 2. WHOLESALE HIERARCHY BANNER (#000000) */}
      {/* -------------------------------------------------- */}
      <section className="bg-[#000000] text-white py-6 border-b border-[#D4A017]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border border-[#D4A017] rounded-lg p-4 bg-[#0A0A0A] text-center divide-y md:divide-y-0 md:divide-x divide-[#222222] shadow-[0_0_15px_rgba(212,160,23,0.15)]">
            {/* Col 1 */}
            <div className="p-2 space-y-1 flex flex-col items-center justify-center">
              <Crown className="w-5 h-5 text-[#D4A017]" />
              <div className="text-xs font-bold text-[#D4A017] tracking-wider uppercase">WHOLESALE HIERARCHY</div>
              <div className="text-[10px] text-[#A3A3A3]">BETTER LEVEL<br />BETTER BENEFITS</div>
            </div>

            {/* Col 2 */}
            <div className="p-2 space-y-1 flex flex-col items-center justify-center">
              <Medal className="w-5 h-5 text-slate-300" />
              <div className="text-xs font-bold text-slate-200">SILVER</div>
              <div className="text-xs font-serif text-white font-semibold">5L - 20L</div>
              <div className="text-[10px] text-[#D4A017] font-bold">2% - 5% OFF</div>
            </div>

            {/* Col 3 */}
            <div className="p-2 space-y-1 flex flex-col items-center justify-center">
              <Medal className="w-5 h-5 text-[#D4A017]" />
              <div className="text-xs font-bold text-[#D4A017]">GOLD</div>
              <div className="text-xs font-serif text-white font-semibold">20L - 50L</div>
              <div className="text-[10px] text-[#D4A017] font-bold">5% - 10% OFF</div>
            </div>

            {/* Col 4 */}
            <div className="p-2 space-y-1 flex flex-col items-center justify-center">
              <Star className="w-5 h-5 text-amber-200" />
              <div className="text-xs font-bold text-amber-200">PLATINUM</div>
              <div className="text-xs font-serif text-white font-semibold">50L - 1CR</div>
              <div className="text-[10px] text-[#D4A017] font-bold">10% - 15% OFF</div>
            </div>

            {/* Col 5 */}
            <div className="p-2 space-y-1 flex flex-col items-center justify-center col-span-2 md:col-span-1">
              <Gem className="w-5 h-5 text-amber-400" />
              <div className="text-xs font-bold text-amber-300">DIAMOND</div>
              <div className="text-xs font-serif text-white font-semibold">1CR+</div>
              <div className="text-[10px] text-[#D4A017] font-bold">15%+ OFF</div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 3. HOME / HOTEL / EVENT CARDS WITH GOLDEN BORDER */}
      {/* -------------------------------------------------- */}
      <section className="bg-[#000000] py-10 border-b border-[#D4A017]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* HOME CARD */}
            <div 
              className="group relative min-h-[22rem] rounded-xl overflow-hidden border-2 border-[#D4A017] hover:border-[#E5B842] shadow-[0_0_15px_rgba(212,160,23,0.3)] hover:shadow-[0_0_28px_rgba(212,160,23,0.55)] transition-all duration-300 flex flex-col justify-end p-5"
            >
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80" 
                alt="HOME"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/75 to-black/20" />
              
              <div className="relative z-10 text-center text-white space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-[#D4A017] uppercase">SEGMENT 01</span>
                <h3 className="text-2xl font-serif font-bold text-white tracking-widest">HOME</h3>
                <p className="text-xs text-[#CCCCCC] font-light max-w-xs mx-auto leading-relaxed">
                  Premium bedding, luxury cushions, art pieces & ambient lighting for home living
                </p>

                {/* 3 Dedicated Category Buttons */}
                <div className="pt-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('catalog', { segment: 'Home', product_type: 'HOME DECOR' });
                    }}
                    className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                  >
                    Home Decor
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('catalog', { segment: 'Home', product_type: 'ART DECOR' });
                    }}
                    className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                  >
                    Art Decor
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('catalog', { segment: 'Home', product_type: 'ELECTRIC DECOR' });
                    }}
                    className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                  >
                    Electric Decor
                  </button>
                </div>
              </div>
            </div>

            {/* HOTEL CARD */}
            <div 
              className="group relative min-h-[22rem] rounded-xl overflow-hidden border-2 border-[#D4A017] hover:border-[#E5B842] shadow-[0_0_15px_rgba(212,160,23,0.3)] hover:shadow-[0_0_28px_rgba(212,160,23,0.55)] transition-all duration-300 flex flex-col justify-end p-5"
            >
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80" 
                alt="HOTEL"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/75 to-black/20" />
              
              <div className="relative z-10 text-center text-white space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-[#D4A017] uppercase">SEGMENT 02</span>
                <h3 className="text-2xl font-serif font-bold text-white tracking-widest">HOTEL</h3>
                <p className="text-xs text-[#CCCCCC] font-light max-w-xs mx-auto leading-relaxed">
                  Hospitality grade 400 TC satin linens, lobby brass sculptures & luxury chandeliers
                </p>

                {/* 3 Dedicated Category Buttons */}
                <div className="pt-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('catalog', { segment: 'Hotel', product_type: 'HOME DECOR' });
                    }}
                    className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                  >
                    Home Decor
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('catalog', { segment: 'Hotel', product_type: 'ART DECOR' });
                    }}
                    className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                  >
                    Art Decor
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('catalog', { segment: 'Hotel', product_type: 'ELECTRIC DECOR' });
                    }}
                    className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                  >
                    Electric Decor
                  </button>
                </div>
              </div>
            </div>

            {/* EVENT CARD */}
            <div 
              className="group relative min-h-[22rem] rounded-xl overflow-hidden border-2 border-[#D4A017] hover:border-[#E5B842] shadow-[0_0_15px_rgba(212,160,23,0.3)] hover:shadow-[0_0_28px_rgba(212,160,23,0.55)] transition-all duration-300 flex flex-col justify-end p-5"
            >
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80" 
                alt="EVENT"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/75 to-black/20" />
              
              <div className="relative z-10 text-center text-white space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-[#D4A017] uppercase">SEGMENT 03</span>
                <h3 className="text-2xl font-serif font-bold text-white tracking-widest">EVENT</h3>
                <p className="text-xs text-[#CCCCCC] font-light max-w-xs mx-auto leading-relaxed">
                  Zardozi velvet runners, antique terracotta accents & illuminated stage fixtures
                </p>

                {/* 3 Dedicated Category Buttons */}
                <div className="pt-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('catalog', { segment: 'Event', product_type: 'HOME DECOR' });
                    }}
                    className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                  >
                    Home Decor
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('catalog', { segment: 'Event', product_type: 'ART DECOR' });
                    }}
                    className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                  >
                    Art Decor
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('catalog', { segment: 'Event', product_type: 'ELECTRIC DECOR' });
                    }}
                    className="bg-[#0A0A0A]/90 hover:bg-[#D4A017] text-[#D4A017] hover:text-black border border-[#D4A017] text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded transition-all tracking-wider shadow-sm uppercase whitespace-nowrap"
                  >
                    Electric Decor
                  </button>
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
                {blogs.slice(0, 2).map((blog) => (
                  <div 
                    key={blog.id} 
                    onClick={() => onNavigate('blogs', { blogId: blog.id })}
                    className="flex gap-3 items-center group cursor-pointer bg-[#0A0A0A] p-2.5 rounded-lg border border-[#D4A017] hover:border-[#E5B842] shadow-[0_0_10px_rgba(212,160,23,0.2)] transition"
                  >
                    <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-neutral-900 border border-[#D4A017]/50">
                      <ImageWithFallback src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-serif font-bold text-white group-hover:text-[#D4A017] transition line-clamp-2">
                        {blog.title}
                      </h4>
                      <p className="text-[10px] text-[#A3A3A3]">
                        May 10, 2024
                      </p>
                    </div>
                  </div>
                ))}
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
    </div>
  );
};
