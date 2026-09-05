import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Search, Phone, Mail, ChevronDown, Instagram, Facebook, User, Truck } from 'lucide-react';
import { LogoPlaceholder } from '../common/LogoPlaceholder';
import { SiteSettings } from '../../types/ecommerce';

interface HeaderProps {
  settings: SiteSettings;
  cartCount: number;
  activeView: string;
  onNavigate: (view: string, param?: any) => void;
  mode: 'Retail' | 'Wholesale';
  setMode: (mode: 'Retail' | 'Wholesale') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  activeView,
  onNavigate,
  mode,
  setMode,
  searchQuery,
  setSearchQuery
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('catalog', { search: searchQuery });
      setSearchOpen(false);
    }
  };

  const phone = settings.contact_phone || '+91 9876543210';
  const email = settings.contact_email || 'info@jsartanddecor.com';

  return (
    <header id="site-main-header" className="sticky top-0 z-50 bg-[#000000] border-b-2 border-[#D4A017] shadow-[0_4px_25px_rgba(212,160,23,0.25)]">
      {/* 1. TOP UTILITY BAR (Black #000000) */}
      <div className="bg-[#000000] text-[#CCCCCC] text-[11px] py-2 px-4 sm:px-8 border-b border-[#D4A017]/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Phone & Email */}
          <div className="flex items-center gap-5 text-[11px] text-[#DDDDDD]">
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-[#D4A017] transition">
              <Phone className="w-3 h-3 text-[#D4A017]" />
              <span>{phone}</span>
            </a>
            <a href={`mailto:${email}`} className="hidden sm:flex items-center gap-1.5 hover:text-[#D4A017] transition">
              <Mail className="w-3 h-3 text-[#D4A017]" />
              <span>{email}</span>
            </a>
          </div>

          {/* Right: Wholesale Enquiry, Track Order, Socials */}
          <div className="flex items-center gap-5 text-[11px]">
            <button
              onClick={() => onNavigate('contact', { subject: 'Wholesale Enquiry' })}
              className="text-[#EEEEEE] hover:text-[#D4A017] font-medium transition"
            >
              Wholesale Enquiry
            </button>

            <button
              onClick={() => onNavigate('track-order')}
              className="hidden sm:flex items-center gap-1 text-[#EEEEEE] hover:text-[#D4A017] font-medium transition"
            >
              <Truck className="w-3.5 h-3.5 text-[#D4A017]" />
              <span>Track Order</span>
            </button>

            {/* Social icons (Facebook, Instagram, Pinterest) */}
            <div className="flex items-center gap-2.5 text-[#EEEEEE] pl-2 border-l border-[#222222]">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#D4A017] transition">
                <Facebook className="w-3 h-3" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#D4A017] transition">
                <Instagram className="w-3 h-3" />
              </a>
              {/* Pinterest Icon SVG */}
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-[#D4A017] transition">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.17-.11-.95-.2-2.41.04-3.45.22-.94 1.42-6.02 1.42-6.02s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-1 3.99-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5.01-4.88-3.41 0-5.42 2.56-5.42 5.2 0 1.03.4 2.13.9 2.74.1.12.11.23.08.36-.09.38-.29 1.19-.33 1.36-.05.23-.18.28-.42.17-1.58-.73-2.57-3.04-2.57-4.89 0-3.98 2.89-7.64 8.34-7.64 4.38 0 7.79 3.12 7.79 7.3 0 4.35-2.74 7.85-6.55 7.85-1.28 0-2.48-.67-2.89-1.46l-.79 3.01c-.28 1.1-.1 2.45-.02 3.14C9.52 23.83 10.73 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR (#000000) */}
      <div className="bg-[#000000] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <button 
            onClick={() => onNavigate('home')} 
            className="text-left focus:outline-none flex items-center gap-2 group"
          >
            <LogoPlaceholder variant="dark" size="md" />
          </button>

          {/* Center: Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-6 text-xs font-semibold tracking-wider uppercase">
            <button
              onClick={() => onNavigate('home')}
              className={`py-1 border-b-2 transition-all ${
                activeView === 'home'
                  ? 'border-[#D4A017] text-[#D4A017] font-bold'
                  : 'border-transparent text-[#DDDDDD] hover:text-[#D4A017]'
              }`}
            >
              HOME
            </button>

            {/* SHOP WITH DROPDOWN */}
            <div 
              className="relative group"
              onMouseEnter={() => setShopDropdownOpen(true)}
              onMouseLeave={() => setShopDropdownOpen(false)}
            >
              <button
                onClick={() => onNavigate('catalog')}
                className={`py-1 border-b-2 flex items-center gap-1 transition-all ${
                  activeView === 'catalog'
                    ? 'border-[#D4A017] text-[#D4A017] font-bold'
                    : 'border-transparent text-[#DDDDDD] hover:text-[#D4A017]'
                }`}
              >
                <span>SHOP</span>
                <ChevronDown className="w-3 h-3 text-[#A3A3A3] group-hover:rotate-180 transition-transform" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 hidden group-hover:block w-56 bg-[#111111] border border-[#222222] rounded-lg shadow-2xl py-2 z-50 text-xs tracking-normal font-sans">
                <button
                  onClick={() => { onNavigate('catalog', { availability: 'Retail' }); setShopDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-[#1A1A1A] text-[#EEEEEE] hover:text-[#D4A017] transition flex items-center justify-between"
                >
                  <span>Retail Shop</span>
                  <span className="text-[10px] text-[#D4A017] uppercase font-bold">Standard</span>
                </button>
                <button
                  onClick={() => { onNavigate('catalog', { availability: 'Wholesale' }); setShopDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-[#1A1A1A] text-[#EEEEEE] hover:text-[#D4A017] transition flex items-center justify-between"
                >
                  <span>Wholesale</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Bulk Tier</span>
                </button>
                <div className="my-1 border-t border-[#222222]" />
                <button
                  onClick={() => { onNavigate('catalog', { product_type: 'HOME DECOR' }); setShopDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-[#1A1A1A] text-[#CCCCCC] hover:text-[#D4A017] transition flex items-center justify-between"
                >
                  <span>HOME DECOR</span>
                  <span className="text-[10px] text-[#D4A017] font-semibold">Bedsheets & Decor</span>
                </button>
                <button
                  onClick={() => { onNavigate('catalog', { product_type: 'ART DECOR' }); setShopDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-[#1A1A1A] text-[#CCCCCC] hover:text-[#D4A017] transition flex items-center justify-between"
                >
                  <span>ART DECOR</span>
                  <span className="text-[10px] text-[#D4A017] font-semibold">Sculptures & Wall</span>
                </button>
                <button
                  onClick={() => { onNavigate('catalog', { product_type: 'ELECTRIC DECOR' }); setShopDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-[#1A1A1A] text-[#CCCCCC] hover:text-[#D4A017] transition flex items-center justify-between"
                >
                  <span>ELECTRIC DECOR</span>
                  <span className="text-[10px] text-[#D4A017] font-semibold">Chandeliers & Lamps</span>
                </button>
                <div className="my-1 border-t border-[#222222]" />
                <button
                  onClick={() => { onNavigate('catalog', { production_type: 'Handmade' }); setShopDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-[#1A1A1A] text-[#CCCCCC] hover:text-white transition"
                >
                  Handmade Artisanal
                </button>
                <button
                  onClick={() => { onNavigate('catalog', { production_type: 'Factory' }); setShopDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-[#1A1A1A] text-[#CCCCCC] hover:text-white transition"
                >
                  Factory Linen & Lights
                </button>
              </div>
            </div>

            <button
              onClick={() => onNavigate('wholesale-tree')}
              className={`py-1 border-b-2 transition-all ${
                activeView === 'wholesale-tree'
                  ? 'border-[#D4A017] text-[#D4A017] font-bold'
                  : 'border-transparent text-[#DDDDDD] hover:text-[#D4A017]'
              }`}
            >
              ABOUT US
            </button>

            <button
              onClick={() => onNavigate('blogs')}
              className={`py-1 border-b-2 transition-all ${
                activeView === 'blogs'
                  ? 'border-[#D4A017] text-[#D4A017] font-bold'
                  : 'border-transparent text-[#DDDDDD] hover:text-[#D4A017]'
              }`}
            >
              BLOGS
            </button>

            <button
              onClick={() => onNavigate('partners')}
              className={`py-1 border-b-2 transition-all ${
                activeView === 'partners'
                  ? 'border-[#D4A017] text-[#D4A017] font-bold'
                  : 'border-transparent text-[#DDDDDD] hover:text-[#D4A017]'
              }`}
            >
              PARTNERS
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className={`py-1 border-b-2 transition-all ${
                activeView === 'contact'
                  ? 'border-[#D4A017] text-[#D4A017] font-bold'
                  : 'border-transparent text-[#DDDDDD] hover:text-[#D4A017]'
              }`}
            >
              CONTACT US
            </button>

            <button
              onClick={() => onNavigate('track-order')}
              className={`py-1 border-b-2 flex items-center gap-1.5 transition-all ${
                activeView === 'track-order'
                  ? 'border-[#D4A017] text-[#D4A017] font-bold'
                  : 'border-transparent text-[#DDDDDD] hover:text-[#D4A017]'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#D4A017]" />
              <span>TRACK ORDER</span>
            </button>
          </nav>

          {/* Inline Text Input Search Bar (Desktop & Tablet) */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex items-center relative flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-2"
          >
            <input
              type="text"
              placeholder="Search products, decor, lights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-[#333333] hover:border-[#D4A017]/70 focus:border-[#D4A017] rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#777777] focus:bg-[#1A1A1A] focus:outline-none transition-all shadow-inner"
            />
            <Search className="w-3.5 h-3.5 text-[#D4A017] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery ? (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </form>

          {/* Right: User / Admin, Cart, Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Account / User Icon */}
            <button
              onClick={() => onNavigate('admin-login')}
              className="text-[#EEEEEE] hover:text-[#D4A017] transition p-1"
              aria-label="Admin / User Account"
              title="Admin Portal"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Cart Trigger */}
            <button
              id="cart-header-btn"
              onClick={() => onNavigate('cart')}
              className="relative text-[#EEEEEE] hover:text-[#D4A017] transition p-1 flex items-center"
              aria-label="View cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 bg-[#D4A017] text-[#000000] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-[#CCCCCC] hover:text-white xl:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dedicated Inline Search Bar */}
        <div className="md:hidden px-4 pb-2.5 pt-0.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products, decor, lighting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-[#333333] focus:border-[#D4A017] rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#777777] focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#D4A017] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#222222] bg-[#0A0A0A] text-white p-5 space-y-4">
          <div className="flex flex-col space-y-2 text-sm font-medium tracking-wide">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="p-2 text-left hover:text-[#D4A017] transition border-b border-[#1A1A1A]"
            >
              HOME
            </button>

            <button
              onClick={() => { onNavigate('catalog'); setMobileMenuOpen(false); }}
              className="p-2 text-left hover:text-[#D4A017] transition border-b border-[#1A1A1A] flex items-center justify-between"
            >
              <span>SHOP ALL</span>
              <span className="text-xs text-[#D4A017]">Catalog</span>
            </button>

            <button
              onClick={() => { onNavigate('wholesale-tree'); setMobileMenuOpen(false); }}
              className="p-2 text-left hover:text-[#D4A017] transition border-b border-[#1A1A1A]"
            >
              ABOUT US
            </button>

            <button
              onClick={() => { onNavigate('blogs'); setMobileMenuOpen(false); }}
              className="p-2 text-left hover:text-[#D4A017] transition border-b border-[#1A1A1A]"
            >
              BLOGS
            </button>

            <button
              onClick={() => { onNavigate('partners'); setMobileMenuOpen(false); }}
              className="p-2 text-left hover:text-[#D4A017] transition border-b border-[#1A1A1A]"
            >
              PARTNERS
            </button>

            <button
              onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
              className="p-2 text-left hover:text-[#D4A017] transition border-b border-[#1A1A1A]"
            >
              CONTACT US
            </button>

            <button
              onClick={() => { onNavigate('track-order'); setMobileMenuOpen(false); }}
              className="p-2 text-left hover:text-[#D4A017] transition border-b border-[#1A1A1A] flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-[#D4A017]" />
              <span>TRACK ORDER</span>
            </button>

            <button
              onClick={() => { onNavigate('admin-login'); setMobileMenuOpen(false); }}
              className="p-2 text-left text-[#D4A017] font-semibold pt-2"
            >
              ADMIN PORTAL
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
