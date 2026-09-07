import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Home as HomeIcon, 
  Building2, 
  PartyPopper, 
  Layers, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Send, 
  Check, 
  Loader2, 
  MessageSquareText, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { ApiService } from '../../services/api';

export type PlannerSegment = 'Home' | 'Hotel' | 'Event' | 'All';

interface ArtDecorPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSegment?: PlannerSegment;
  whatsappNumber?: string;
}

interface SegmentConfig {
  title: string;
  badge: string;
  subtitle: string;
  icon: React.ElementType;
  defaultScope: string[];
  scaleOptions: string[];
  themeOptions: string[];
}

const SEGMENT_DATA: Record<PlannerSegment, SegmentConfig> = {
  Home: {
    title: 'Home & Residential Decor',
    badge: 'Segment 01 • Living Spaces',
    subtitle: 'Bespoke bedroom linens, designer cushion covers, handcrafted wall brass, and warm ambient lighting',
    icon: HomeIcon,
    defaultScope: [
      'Luxury Bedding & 400 TC Bedsheets',
      'Designer Velvet & Embroidered Cushions',
      'Handcrafted Curtains & Window Drapes',
      'Artisan Brass & Terracotta Wall Decor',
      'Living Room Table Runners & Throws',
      'Ambient LED Chandeliers & Wall Sconces',
      'Hand-Tufted Woolen / Cotton Rugs',
      'Full-House Turnkey Interior Package'
    ],
    scaleOptions: [
      '1 - 2 BHK Apartment',
      '3 - 4 BHK Apartment',
      'Luxury Villa / Bungalow',
      'Penthouse / Farmhouse',
      'Single Room / Living Area Only'
    ],
    themeOptions: [
      'Royal Heritage (Rajasthani Zari & Antique Brass)',
      'Modern Contemporary Minimalist',
      'Bohemian Artisanal & Macrame Textures',
      '5-Star Luxury Opulence (Velvet & Gilded Gold)',
      'Warm Neutral Scandinavian'
    ]
  },
  Hotel: {
    title: 'Hotel & Hospitality Decor',
    badge: 'Segment 02 • Commercial & Resorts',
    subtitle: 'Industrial-wash 400 TC satin linens, lobby statement sculptures, banquet napery & chandeliers',
    icon: Building2,
    defaultScope: [
      '400 TC Satin Stripe Hotel Bedsheets & Duvets',
      'Lobby Grand Brass Panels & Sculptures',
      'Banquet Hall & Conference Velvet Runners',
      'Restaurant Napery & Dining Table Linens',
      'Guest Room Decorative Pillows & Bed Runners',
      'Hotel Corridor Chandeliers & Crystal Sconces',
      'Poolside / Balcony Weatherproof Accents',
      'Commercial Bulk Sample Pilot Order'
    ],
    scaleOptions: [
      'Boutique Hotel (10 - 25 Keys/Rooms)',
      'Mid-Scale Luxury Hotel (25 - 60 Keys)',
      '5-Star Resort & Palace (60 - 150+ Keys)',
      'Banquet Hall & Convention Center',
      'Fine-Dining Restaurant / Bar & Lounge'
    ],
    themeOptions: [
      '5-Star Luxury Opulence (Crisp White & Gilded Gold)',
      'Royal Heritage Palace Suite Aesthetic',
      'Contemporary Sleek Corporate Minimalism',
      'Eco-Artisanal Boutique Resort Style',
      'Bespoke Tailored Hotel Architecture'
    ]
  },
  Event: {
    title: 'Event & Wedding Decor',
    badge: 'Segment 03 • Celebrations & Galas',
    subtitle: 'Zardozi velvet table runners, grand stage backdrops, terracotta centerpieces & illuminated fixtures',
    icon: PartyPopper,
    defaultScope: [
      'Grand Wedding Stage & Mandap Backdrops',
      'Hand-Embroidered Zardozi Velvet Table Runners',
      'Illuminated Stage Chandeliers & Moroccan Lanterns',
      'Antique Terracotta & Clay Centerpiece Vases',
      'VIP Lounge Luxury Cushions & Seating Accents',
      'Selfie / Photo-Op Floral & Brass Frames',
      'Banquet Chair Ties & Premium Drape Linens',
      'Comprehensive Turnkey Event Decor Package'
    ],
    scaleOptions: [
      'Intimate Gathering (50 - 150 Guests)',
      'Grand Royal Wedding (200 - 500 Guests)',
      'Mega Gala / Reception (500 - 1,200+ Guests)',
      'Destination Palace Wedding Setup',
      'Exhibition Pavilion / Corporate Annual Meet'
    ],
    themeOptions: [
      'Royal Rajasthani Regal Gold & Maroon Zardozi',
      'Pastel Floral Bohemian Luxury',
      'Starlit Crystal & Vintage Gold Glamour',
      'Rustic Artisanal Terracotta & Brass',
      'Custom Theme Tailored to Venue'
    ]
  },
  All: {
    title: 'Multi-Segment & Turnkey Project',
    badge: 'All Segments • Integrated Planning',
    subtitle: 'Comprehensive decor procurement combining residential, hospitality and event installations',
    icon: Layers,
    defaultScope: [
      'Residential Suite Linens & Soft Furnishings',
      'Commercial Hotel Linens & Lobby Artifacts',
      'Grand Event & Banquet Styling Accessories',
      'Custom Brass & Metallic Wall Installations',
      'Architectural Chandeliers & Ambient Lighting',
      'Turnkey Project Execution & Dedicated Stylist'
    ],
    scaleOptions: [
      'Multi-Property Residential & Guest Suites',
      'Resort + Banquet & Wedding Destination',
      'Corporate Headquarters + Executive Lounges',
      'Retail Showroom / Architect Showcase Project'
    ],
    themeOptions: [
      'Integrated Royal Heritage Rajasthani Collection',
      'Modern High-End Minimalist Luxury',
      'Bespoke Custom Master Concept'
    ]
  }
};

const BUDGET_OPTIONS = [
  { label: '₹25,000 – ₹75,000', desc: 'Essential Accent Makeover' },
  { label: '₹75,000 – ₹2,00,000', desc: 'Premium Standard Decor Package' },
  { label: '₹2,00,000 – ₹5,00,000', desc: 'Luxury Heritage & Suite Package' },
  { label: '₹5,00,000+', desc: 'Grand Turnkey / Commercial Bulk' }
];

const TIMELINE_OPTIONS = [
  'Within 15 Days (Urgent Project)',
  'Within 1 Month',
  '1 to 3 Months (Advance Planning)',
  'Flexible / Seasonal Execution'
];

export const ArtDecorPlannerModal: React.FC<ArtDecorPlannerModalProps> = ({
  isOpen,
  onClose,
  initialSegment = 'Home',
  whatsappNumber = '+919876543210'
}) => {
  const [selectedSegment, setSelectedSegment] = useState<PlannerSegment>(initialSegment);
  const [selectedScope, setSelectedScope] = useState<string[]>([]);
  const [spaceScale, setSpaceScale] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [budgetRange, setBudgetRange] = useState<string>('₹75,000 – ₹2,00,000');
  const [timeline, setTimeline] = useState<string>('Within 1 Month');
  const [wantWhatsappUpdate, setWantWhatsappUpdate] = useState<boolean>(true);

  // User details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Update defaults when initialSegment changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSegment(initialSegment);
      setSubmittedRef(null);
      setError(null);
    }
  }, [isOpen, initialSegment]);

  // Update scope and scale defaults whenever selectedSegment changes
  useEffect(() => {
    const config = SEGMENT_DATA[selectedSegment];
    setSelectedScope(config.defaultScope.slice(0, 3)); // Pre-select top 3 recommendations
    setSpaceScale(config.scaleOptions[0]);
    setSelectedTheme(config.themeOptions[0]);
  }, [selectedSegment]);

  if (!isOpen) return null;

  const currentConfig = SEGMENT_DATA[selectedSegment];

  const handleToggleScope = (item: string) => {
    setSelectedScope(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSelectAllScope = () => {
    if (selectedScope.length === currentConfig.defaultScope.length) {
      setSelectedScope([]);
    } else {
      setSelectedScope([...currentConfig.defaultScope]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please provide a valid phone or WhatsApp number so we can send your plan.');
      return;
    }

    setLoading(true);

    try {
      const res = await ApiService.submitPlannerInquiry({
        segment: selectedSegment,
        scope: selectedScope,
        space_scale: spaceScale,
        theme: selectedTheme,
        budget_range: budgetRange,
        timeline,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        notes: notes.trim()
      });

      setSubmittedRef(res.reference_id || 'PLAN-' + Math.random().toString(36).substring(2, 8).toUpperCase());
    } catch (err: any) {
      setError(err?.message || 'Failed to submit planning details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cleanWhatsapp = (whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');
  const whatsappPreFilled = encodeURIComponent(
    `Hello JSArt&Decor Team! I just submitted an Art & Decor Plan on your website.\n\n` +
    `• Ref ID: ${submittedRef}\n` +
    `• Segment: ${selectedSegment}\n` +
    `• Scale: ${spaceScale}\n` +
    `• Scope: ${selectedScope.join(', ')}\n` +
    `• Budget: ${budgetRange}\n` +
    `• Location: ${city || 'India'}\n\n` +
    `Could you please share the customized lookbook and initial quotation?`
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="art-decor-planner-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#0F0F0F] text-white border-2 border-[#D4A017] rounded-2xl shadow-[0_0_50px_rgba(212,160,23,0.35)] overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#0A0A0A] via-[#141414] to-[#0A0A0A] p-5 sm:p-6 border-b border-[#D4A017]/30 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A017]/30 to-[#D4A017]/10 border border-[#D4A017] flex items-center justify-center text-[#D4A017] shadow-inner shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#D4A017] uppercase bg-[#D4A017]/10 px-2 py-0.5 rounded border border-[#D4A017]/30">
                  CONSULTATION &amp; QUOTE
                </span>
                <span className="text-[11px] text-[#A3A3A3] font-light hidden sm:inline">• Free Stylist Proposal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide mt-1">
                Art &amp; Decor Planner
              </h2>
              <p className="text-xs text-[#888888] font-light mt-0.5">
                Tell us your vision — get customized catalogs, fabric swatches &amp; factory-direct pricing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#888888] hover:text-white bg-[#1A1A1A] hover:bg-[#2A2A2A] p-2 rounded-full border border-neutral-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {submittedRef ? (
            /* SUCCESS CONFIRMATION VIEW */
            <div className="py-8 px-4 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-[#D4A017] uppercase">
                  PLAN INQUIRY LOGGED SUCCESSFULLY
                </span>
                <h3 className="text-2xl font-serif font-bold text-white">
                  Thank You, {name}!
                </h3>
                <p className="text-xs text-[#CCCCCC] max-w-md mx-auto leading-relaxed">
                  Your customized <strong className="text-white">{selectedSegment} Decor Plan</strong> has been assigned to our Senior Textile &amp; Decor Stylist team.
                </p>
              </div>

              {/* Reference Card */}
              <div className="bg-[#171717] border border-[#D4A017]/40 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 font-sans">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[11px] text-[#888888]">Reference Number:</span>
                  <span className="font-mono text-sm font-bold text-[#D4A017]">{submittedRef}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-[#888888] block">Segment:</span>
                    <span className="font-bold text-white">{selectedSegment}</span>
                  </div>
                  <div>
                    <span className="text-[#888888] block">Space Scale:</span>
                    <span className="font-bold text-white">{spaceScale}</span>
                  </div>
                  <div>
                    <span className="text-[#888888] block">Estimated Budget:</span>
                    <span className="font-bold text-white">{budgetRange}</span>
                  </div>
                  <div>
                    <span className="text-[#888888] block">Timeline:</span>
                    <span className="font-bold text-white">{timeline}</span>
                  </div>
                </div>
                {selectedScope.length > 0 && (
                  <div className="pt-2 border-t border-neutral-800/80">
                    <span className="text-[10px] text-[#888888] block mb-1">Selected Planning Scope:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedScope.map((item) => (
                        <span key={item} className="bg-black/60 text-[#D4A017] text-[10px] px-2 py-0.5 rounded border border-[#D4A017]/30">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${whatsappPreFilled}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <MessageSquareText className="w-4 h-4" />
                  <span>Connect on WhatsApp for Instant Lookbook</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition"
                >
                  Back to Store
                </button>
              </div>
            </div>
          ) : (
            /* INTERACTIVE PLANNER FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: SEGMENT SELECTOR (HOME, HOTEL, EVENT, ALL) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-serif font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#D4A017] text-black text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <span>Select Planning Segment</span>
                  </label>
                  <span className="text-[11px] text-[#D4A017] font-mono font-medium">
                    {currentConfig.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Home', 'Hotel', 'Event', 'All'] as PlannerSegment[]).map((seg) => {
                    const info = SEGMENT_DATA[seg];
                    const Icon = info.icon;
                    const isSelected = selectedSegment === seg;
                    return (
                      <button
                        key={seg}
                        type="button"
                        onClick={() => setSelectedSegment(seg)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between min-h-[82px] ${
                          isSelected
                            ? 'bg-[#1F1B0B] border-[#D4A017] shadow-[0_0_15px_rgba(212,160,23,0.3)] text-white'
                            : 'bg-[#141414] border-neutral-800 hover:border-neutral-700 text-[#888888] hover:text-[#CCCCCC]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-[#D4A017]' : 'text-neutral-500'}`} />
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#D4A017]" />}
                        </div>
                        <div>
                          <div className={`font-bold text-xs ${isSelected ? 'text-[#D4A017]' : 'text-white'}`}>
                            {seg === 'All' ? 'All Segments' : seg}
                          </div>
                          <div className="text-[10px] text-[#777777] truncate">
                            {seg === 'Home' ? 'Residential' : seg === 'Hotel' ? 'Hospitality' : seg === 'Event' ? 'Weddings' : 'Turnkey'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: PLANNING SCOPE & ELEMENTS CHIPS */}
              <div className="space-y-2 bg-[#141414] p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="font-serif font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#D4A017] text-black text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <span>What decor elements do you need?</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllScope}
                    className="text-[10px] font-mono text-[#D4A017] hover:underline"
                  >
                    {selectedScope.length === currentConfig.defaultScope.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentConfig.defaultScope.map((item) => {
                    const isChecked = selectedScope.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleScope(item)}
                        className={`px-3 py-2 rounded-lg text-[11px] font-medium transition flex items-center gap-1.5 border ${
                          isChecked
                            ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold shadow-sm'
                            : 'bg-[#1C1C1C] text-[#BBBBBB] border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {isChecked ? <Check className="w-3 h-3 text-black" /> : <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: PROPERTY SCALE & THEME SELECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Scale */}
                <div className="space-y-1.5">
                  <label className="font-serif font-bold text-white text-xs flex items-center gap-1.5">
                    <span>Space Scale / Dimensions</span>
                  </label>
                  <select
                    value={spaceScale}
                    onChange={(e) => setSpaceScale(e.target.value)}
                    className="w-full bg-[#171717] border border-neutral-800 focus:border-[#D4A017] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    {currentConfig.scaleOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-neutral-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theme */}
                <div className="space-y-1.5">
                  <label className="font-serif font-bold text-white text-xs flex items-center gap-1.5">
                    <span>Preferred Interior Theme</span>
                  </label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="w-full bg-[#171717] border border-neutral-800 focus:border-[#D4A017] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    {currentConfig.themeOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-neutral-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STEP 4: BUDGET & TIMELINE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#141414] p-4 rounded-xl border border-neutral-800">
                <div className="space-y-1.5">
                  <label className="font-serif font-bold text-white text-xs flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-[#D4A017]" />
                    <span>Estimated Budget Range</span>
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-neutral-800 focus:border-[#D4A017] rounded-xl p-2.5 text-xs text-white focus:outline-none font-sans"
                  >
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b.label} value={b.label} className="bg-neutral-900 text-white">
                        {b.label} ({b.desc})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-serif font-bold text-white text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D4A017]" />
                    <span>Target Execution Timeline</span>
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-neutral-800 focus:border-[#D4A017] rounded-xl p-2.5 text-xs text-white focus:outline-none font-sans"
                  >
                    {TIMELINE_OPTIONS.map((t) => (
                      <option key={t} value={t} className="bg-neutral-900 text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STEP 5: CLIENT CONTACT DETAILS */}
              <div className="space-y-3 pt-2">
                <label className="font-serif font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#D4A017] text-black text-[11px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <span>Where should our senior stylist send your plan &amp; quotation?</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#A3A3A3] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nilesh Nigam"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#171717] border border-neutral-800 focus:border-[#D4A017] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A3A3A3] mb-1">Phone / WhatsApp Number *</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#D4A017] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#171717] border border-neutral-800 focus:border-[#D4A017] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A3A3A3] mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="nilesh@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#171717] border border-neutral-800 focus:border-[#D4A017] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A3A3A3] mb-1">Project City / State</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. Jaipur, Delhi, Mumbai, Bangalore"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#171717] border border-neutral-800 focus:border-[#D4A017] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-[#A3A3A3] mb-1">
                      Specific Notes, Room Dimensions or Special Requests (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Need ivory and antique gold velvet cushions for a 5-seater sofa, plus heavy blackout curtains for 2 master bedrooms."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#171717] border border-neutral-800 focus:border-[#D4A017] rounded-xl p-2.5 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#CCCCCC]">
                  <input
                    type="checkbox"
                    id="planner-wa-optin"
                    checked={wantWhatsappUpdate}
                    onChange={(e) => setWantWhatsappUpdate(e.target.checked)}
                    className="rounded border-neutral-700 text-[#D4A017] focus:ring-0 w-3.5 h-3.5 bg-neutral-900"
                  />
                  <label htmlFor="planner-wa-optin" className="cursor-pointer">
                    Receive customized catalog PDF &amp; quote estimate directly on WhatsApp
                  </label>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-[#777777] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span>No obligation • 100% Free styling consultation</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#D4A017] via-[#E5B842] to-[#D4A017] hover:from-[#E5B842] hover:to-[#C59012] text-black font-serif font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(212,160,23,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-102 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Submitting Decor Plan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-black" />
                      <span>Submit Decor Plan &amp; Request Quote</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
