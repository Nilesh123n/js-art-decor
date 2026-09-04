import React from 'react';
import { Building2, Award, ExternalLink, MessageCircle } from 'lucide-react';
import { Partner, SiteSettings } from '../types/ecommerce';

interface PartnersPageProps {
  partners: Partner[];
  settings: SiteSettings;
  onNavigate: (view: string, param?: any) => void;
}

export const PartnersPage: React.FC<PartnersPageProps> = ({ partners, settings, onNavigate }) => {
  return (
    <div id="partners-page-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 min-h-screen text-white">
      {/* Page Title */}
      <div className="bg-[#0A0A0A] text-white p-8 rounded-2xl border border-[#D4A017] shadow-[0_0_20px_rgba(212,160,23,0.2)] space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 bg-[#1A1500] text-[#E5B842] border border-[#D4A017]/60 px-3 py-1 rounded-full text-xs font-semibold">
          <Award className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>Institutional B2B Collaborations</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">Our Hospitality & Retail Partners</h1>
        
        <p className="text-xs sm:text-sm text-[#CCCCCC] max-w-2xl leading-relaxed">
          JSArt&Decor supplies custom bedsheets, commercial linens, and hand-crafted decorative artifacts to premier resort chains, banquet spaces, and luxury boutique stores.
        </p>
      </div>

      {/* Partner Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((p) => (
          <div key={p.id} className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#D4A017] shadow-[0_0_15px_rgba(212,160,23,0.15)] flex flex-col sm:flex-row items-center gap-6 hover:shadow-[0_0_25px_rgba(212,160,23,0.35)] transition">
            <div className="w-32 h-32 bg-[#141414] rounded-xl border border-[#D4A017] flex items-center justify-center p-4 shrink-0 shadow-[0_0_10px_rgba(212,160,23,0.2)]">
              <img src={p.logo_url} alt={p.name} className="max-h-full max-w-full object-contain filter brightness-110" />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-base font-bold text-white">{p.name}</h2>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">{p.description}</p>
              
              <div className="pt-1">
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4A017] hover:text-[#E5B842] hover:underline"
                >
                  <span>Visit Partner Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Partnership Callout Banner */}
      <div className="bg-[#0A0A0A] border border-[#D4A017] rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto shadow-[0_0_20px_rgba(212,160,23,0.2)]">
        <h3 className="text-lg font-serif font-bold text-white">Become a JSArt&Decor B2B Wholesale Partner</h3>
        <p className="text-xs text-[#CCCCCC] leading-relaxed">
          Looking for custom embroidered linens, bulk bedsheets, or artisan brass art decor for your hotel, resort, or event venue? Get custom pricing & sample kits.
        </p>

        <a
          href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hello%20JSArt%26Decor,%20I%20am%20interested%20in%20a%20B2B%20Hospitality/Wholesale%20partnership.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Connect with B2B Sales on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
