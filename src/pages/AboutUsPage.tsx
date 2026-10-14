import React from 'react';
import { 
  Building2, Sparkles, Award, Users, HeartHandshake, ShieldCheck, 
  MapPin, Phone, Mail, ArrowRight, CheckCircle2, Factory, Palette, Zap
} from 'lucide-react';
import { SiteSettings } from '../types/ecommerce';
import { SEOHead } from '../components/seo/SEOHead';
import { getBreadcrumbSchema } from '../utils/seo';

interface AboutUsPageProps {
  settings: SiteSettings;
  onNavigate: (view: string, param?: any) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ settings, onNavigate }) => {
  return (
    <div id="about-us-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12 min-h-screen text-white">
      <SEOHead
        title="About Us - JSArt&Decor | Handcrafted Luxury & Textile Hub"
        description="Learn about JSArt&Decor Jaipur: Our heritage, handcrafted textiles, luxury home decor, hotel supplies, event staging solutions, and artisan craftsmanship."
        type="website"
        schemas={[
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About JSArt&Decor',
            description: 'Jaipur artisan textile manufacturer and premium home, hotel, and event decor curator.',
            mainEntity: {
              '@type': 'Organization',
              name: settings.store_name || 'JSArt&Decor',
              telephone: settings.contact_phone,
              email: settings.contact_email,
              address: settings.address
            }
          },
          getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'About Us', url: '/?view=about-us' }
          ])
        ]}
      />

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14120B] via-[#0A0A0A] to-[#1A1400] border border-[#D4A017] p-8 sm:p-14 shadow-[0_0_35px_rgba(212,160,23,0.2)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A017]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#1A1500] text-[#E5B842] border border-[#D4A017]/60 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>Heritage Craftsmanship &amp; Contemporary Luxury</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Crafting Elegance for <span className="text-[#D4A017]">Home</span>, <span className="text-[#D4A017]">Hotel</span> &amp; <span className="text-[#D4A017]">Events</span>
          </h1>

          <p className="text-sm sm:text-base text-[#D4D4D4] leading-relaxed">
            Welcome to <strong className="text-white">JSArt&amp;Decor</strong> — Jaipur&apos;s premier destination for artisan block prints, pure cotton bedsheets, handcrafted quilts, royal sculptures, and modern electric lighting installations. We bridge traditional Rajasthani craftsmanship with modern living aesthetics.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('catalog')}
              className="px-6 py-3 bg-gradient-to-r from-[#D4A017] to-[#B8860B] hover:from-[#E5B842] hover:to-[#D4A017] text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 bg-[#111111] hover:bg-[#1A1A1A] text-white border border-[#333333] hover:border-[#D4A017] text-xs font-bold uppercase tracking-wider rounded-xl transition"
            >
              Contact Artisans
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Pillars: Textile, Art Decor, Electric Decor */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs text-[#D4A017] uppercase tracking-widest font-bold">What We Craft</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Three Pillars of Our Artistry</h2>
          <p className="text-xs sm:text-sm text-[#A3A3A3]">
            Curated across Residential Homes, Luxury Hospitality (Hotels/Resorts), and Grand Event Management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#222222] hover:border-[#D4A017] shadow-lg transition space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#1A1500] border border-[#D4A017]/40 flex items-center justify-center text-[#D4A017] group-hover:scale-110 transition-transform">
              <Factory className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#D4A017] transition">Textile Masterpieces</h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              100% breathable pure cotton bedsheets, Jaipuri hand-stitched quilts &amp; comforters, designer sofa covers, velvet prayer aasan, and tailored curtains woven for enduring comfort and royal aesthetic.
            </p>
            <ul className="text-xs text-[#D4D4D4] space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>King &amp; Queen Size Luxury Bedsheets</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Jaipuri Cotton Razai &amp; Dohar</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Commercial Hotel Linens &amp; Runner sets</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#222222] hover:border-[#D4A017] shadow-lg transition space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#1A1500] border border-[#D4A017]/40 flex items-center justify-center text-[#D4A017] group-hover:scale-110 transition-transform">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#D4A017] transition">Art &amp; Sculptural Decor</h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Intricately detailed brass and marble finish statues, spiritual idols, handcrafted metal wall art, canvas paintings, traditional vase accents, and bespoke table decor created by master Rajasthani sculptors.
            </p>
            <ul className="text-xs text-[#D4D4D4] space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Spiritual Murti &amp; Deity Sculptures</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>3D Metal &amp; Canvas Wall Accents</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Showpieces &amp; Table Centerpieces</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#222222] hover:border-[#D4A017] shadow-lg transition space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#1A1500] border border-[#D4A017]/40 flex items-center justify-center text-[#D4A017] group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#D4A017] transition">Electric &amp; Ambient Decor</h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Warm ambient wall sconces, modern chandeliers (Jhumar), architectural elevation lighting, festival neon signs, fairy light curtains, and outdoor decorative illumination engineered for dramatic visual impact.
            </p>
            <ul className="text-xs text-[#D4D4D4] space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Grand Crystal &amp; Brass Chandeliers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Modern LED Wall Lamps &amp; Sconces</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Architectural &amp; Event Elevation Lights</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Our Story & Values */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#0A0A0A] p-8 sm:p-12 rounded-3xl border border-[#222222]">
        <div className="space-y-4">
          <span className="text-xs text-[#D4A017] uppercase tracking-widest font-bold">Our Heritage &amp; Mission</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Direct Manufacturer to Your Doorstep</h2>
          <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
            Founded with a passion to protect and celebrate India&apos;s rich handloom traditions, JSArt&amp;Decor connects local craftsmen directly with homeowners, interior architects, and hospitality procurement managers.
          </p>
          <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
            By eliminating multiple intermediaries, we ensure our artisans receive fair wages while delivering commercial-grade textiles, durable metals, and energy-efficient lighting at transparent retail and wholesale rates.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1F1F1F]">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#D4A017]">100%</div>
              <div className="text-xs text-[#888888] font-medium">Quality Inspected</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#D4A017]">500+</div>
              <div className="text-xs text-[#888888] font-medium">Artisans &amp; Weavers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#D4A017]">B2B &amp; B2C</div>
              <div className="text-xs text-[#888888] font-medium">Dual Pricing Engine</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#D4A017]">Pan-India</div>
              <div className="text-xs text-[#888888] font-medium">Doorstep Shipping</div>
            </div>
          </div>
        </div>

        {/* Feature Badges Card */}
        <div className="space-y-4 bg-[#111111] p-6 sm:p-8 rounded-2xl border border-[#222222]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D4A017]" />
            <span>Why Customers &amp; Businesses Trust Us</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex gap-3">
              <Award className="w-5 h-5 text-[#D4A017] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold text-sm">Authentic Material Guarantee</strong>
                <span className="text-[#888888]">Pure cotton, real solid wood, rust-resistant powder-coated brass &amp; metal, and certified electric components.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Users className="w-5 h-5 text-[#D4A017] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold text-sm">Dedicated B2B Wholesale Portal</strong>
                <span className="text-[#888888]">Institutional tier pricing, custom bulk GSM specifications for hotels, and event stage packages.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <HeartHandshake className="w-5 h-5 text-[#D4A017] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold text-sm">Direct Customer Care</strong>
                <span className="text-[#888888]">Live WhatsApp updates, instant order tracking, and prompt resolution for any inquiries.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workshop Location & Contact Callout */}
      <div className="bg-gradient-to-r from-[#0D0D0D] via-[#141209] to-[#0D0D0D] p-6 sm:p-8 rounded-2xl border border-[#D4A017]/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-[#D4A017] font-bold">
            <Building2 className="w-4 h-4" />
            <span>Manufacturing &amp; Experience Studio</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white">Have a Custom Project or Bulk Requirement?</h4>
          <p className="text-xs text-[#A3A3A3] max-w-xl">
            {settings.address || 'JSArt&Decor Textile & Art Hub, Phase II Industrial Estate, Jaipur, Rajasthan 302022, India'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href={`tel:${settings.contact_phone || '+918602414046'}`}
            className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <Phone className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>{settings.contact_phone || '+91 86024 14046'}</span>
          </a>
          <button
            onClick={() => onNavigate('contact')}
            className="px-5 py-2.5 bg-[#D4A017] hover:bg-[#E5B842] text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};
