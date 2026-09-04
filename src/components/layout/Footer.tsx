import React from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { SiteSettings } from '../../types/ecommerce';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (view: string, param?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  return (
    <footer className="bg-[#000000] text-white border-t border-[#1A1A1A] font-sans">
      {/* Bottom Bar matching reference image */}
      <div className="py-4 px-4 sm:px-8 bg-[#000000] text-[#888888] text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          {/* Copyright + Quick Policy Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
            <span>© 2024 JSArt&Decor. All Rights Reserved.</span>
            <span className="hidden md:inline text-[#333333]">|</span>
            <button onClick={() => onNavigate('wholesale-tree')} className="hover:text-[#D4A017] transition">
              About Us
            </button>
            <span className="text-[#333333]">|</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-[#D4A017] transition">
              Privacy Policy
            </button>
            <span className="text-[#333333]">|</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-[#D4A017] transition">
              Terms & Conditions
            </button>
            <span className="text-[#333333]">|</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-[#D4A017] transition">
              Shipping Policy
            </button>
            <span className="text-[#333333]">|</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-[#D4A017] transition">
              Return Policy
            </button>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 text-[#FFFFFF]">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#D4A017] transition">
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#D4A017] transition">
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-[#D4A017] transition">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.17-.11-.95-.2-2.41.04-3.45.22-.94 1.42-6.02 1.42-6.02s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-1 3.99-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5.01-4.88-3.41 0-5.42 2.56-5.42 5.2 0 1.03.4 2.13.9 2.74.1.12.11.23.08.36-.09.38-.29 1.19-.33 1.36-.05.23-.18.28-.42.17-1.58-.73-2.57-3.04-2.57-4.89 0-3.98 2.89-7.64 8.34-7.64 4.38 0 7.79 3.12 7.79 7.3 0 4.35-2.74 7.85-6.55 7.85-1.28 0-2.48-.67-2.89-1.46l-.79 3.01c-.28 1.1-.1 2.45-.02 3.14C9.52 23.83 10.73 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
