import React from 'react';
import { 
  ShieldCheck, Lock, Eye, FileText, Database, UserCheck, 
  CreditCard, Mail, Phone, MapPin, RefreshCw, AlertCircle 
} from 'lucide-react';
import { SiteSettings } from '../types/ecommerce';
import { SEOHead } from '../components/seo/SEOHead';
import { getBreadcrumbSchema } from '../utils/seo';

interface PrivacyPolicyPageProps {
  settings: SiteSettings;
  onNavigate: (view: string, param?: any) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ settings, onNavigate }) => {
  const storeName = settings.store_name || 'JSArt&Decor';
  const contactEmail = settings.contact_email || 'info.jsartanddecor@gmail.com';
  const contactPhone = settings.contact_phone || '+91 86024 14046';
  const address = settings.address || 'JSArt&Decor Textile & Art Hub, Phase II Industrial Estate, Jaipur, Rajasthan 302022, India';

  return (
    <div id="privacy-policy-view" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10 min-h-screen text-white">
      <SEOHead
        title={`Privacy Policy - ${storeName}`}
        description={`Read the privacy policy of ${storeName}. Learn how we collect, protect, and handle your personal data, payment information, and shipping details.`}
        type="website"
        schemas={[
          getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Privacy Policy', url: '/?view=privacy-policy' }
          ])
        ]}
      />

      {/* Header */}
      <div className="bg-[#0A0A0A] p-8 sm:p-10 rounded-3xl border border-[#D4A017] shadow-[0_0_25px_rgba(212,160,23,0.15)] space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#1A1500] text-[#E5B842] border border-[#D4A017]/60 px-3.5 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>Data Protection &amp; Confidentiality Guarantee</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Privacy Policy
        </h1>

        <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
          Effective Date: October 2024 &bull; Last Updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>

        <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed pt-2">
          At <strong className="text-white">{storeName}</strong>, we respect your privacy and are committed to safeguarding the personal data you share with us while browsing our catalog, placing retail or wholesale orders, or contacting our team.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
        
        {/* Section 1: Information We Collect */}
        <div className="bg-[#0A0A0A] p-6 sm:p-8 rounded-2xl border border-[#222222] space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Eye className="w-4 h-4 text-[#D4A017]" />
            <h2>1. Information We Collect</h2>
          </div>
          <p>
            When you interact with our website, request samples, place an order, or submit an inquiry, we may collect the following information:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#B3B3B3]">
            <li><strong className="text-white">Contact Details:</strong> Your full name, mobile phone number, WhatsApp contact, and email address.</li>
            <li><strong className="text-white">Shipping &amp; Billing Information:</strong> Delivery address, street name, city, state, postal PIN code, and landmark notes.</li>
            <li><strong className="text-white">B2B Business Information (For Wholesale Inquiries):</strong> Firm/Company name, GST number (if applicable), hotel or event firm profile.</li>
            <li><strong className="text-white">Order Details:</strong> Products purchased, quantities, selected variant (size, color, material), invoice values, and tracking history.</li>
            <li><strong className="text-white">Technical &amp; Device Data:</strong> IP address, browser type, operating system, and pages visited to help improve user experience.</li>
          </ul>
        </div>

        {/* Section 2: How We Use Your Data */}
        <div className="bg-[#0A0A0A] p-6 sm:p-8 rounded-2xl border border-[#222222] space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Database className="w-4 h-4 text-[#D4A017]" />
            <h2>2. How We Use Your Information</h2>
          </div>
          <p>
            We process your personal information strictly for legitimate business and transactional purposes:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#B3B3B3]">
            <li>To process, pack, and deliver your retail or bulk textile/decor orders to your doorstep.</li>
            <li>To generate GST tax invoices, shipping labels, and send live WhatsApp/SMS order tracking notifications.</li>
            <li>To respond to customer support requests, bulk quotes, and custom artisan craft commissions.</li>
            <li>To prevent fraudulent transactions and maintain high-security standards for online payments.</li>
            <li>To continuously optimize website navigation, loading speed, and product recommendations.</li>
          </ul>
        </div>

        {/* Section 3: Payment Security */}
        <div className="bg-[#0A0A0A] p-6 sm:p-8 rounded-2xl border border-[#222222] space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <CreditCard className="w-4 h-4 text-[#D4A017]" />
            <h2>3. Payment Security &amp; Card Data</h2>
          </div>
          <p>
            Your financial security is our highest priority. We do <strong className="text-white">NOT store, view, or log</strong> your credit card, debit card, UPI PIN, or net-banking credentials on our servers.
          </p>
          <p>
            All online transactions are processed through RBI-approved, PCI-DSS Level 1 certified payment gateways (e.g., Razorpay) using 256-bit bank-grade SSL encryption.
          </p>
        </div>

        {/* Section 4: Data Sharing & Third Parties */}
        <div className="bg-[#0A0A0A] p-6 sm:p-8 rounded-2xl border border-[#222222] space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <UserCheck className="w-4 h-4 text-[#D4A017]" />
            <h2>4. Third-Party Sharing</h2>
          </div>
          <p>
            We <strong className="text-white">never sell, rent, or trade</strong> your personal information to third-party advertisers or telemarketing companies. Your information is shared only with trusted logistics and operational partners strictly necessary for order fulfillment:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#B3B3B3]">
            <li><strong className="text-white">Logistics &amp; Courier Partners:</strong> (e.g., Delhivery, BlueDart, DTDC, India Post) to physically transport and deliver your parcels.</li>
            <li><strong className="text-white">Payment Processors:</strong> To authenticate and process transactions safely.</li>
            <li><strong className="text-white">Legal Obligations:</strong> If required by Indian law, court order, or governmental authorities.</li>
          </ul>
        </div>

        {/* Section 5: Cookies & Analytics */}
        <div className="bg-[#0A0A0A] p-6 sm:p-8 rounded-2xl border border-[#222222] space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Lock className="w-4 h-4 text-[#D4A017]" />
            <h2>5. Cookies &amp; Local Storage</h2>
          </div>
          <p>
            We utilize standard browser cookies and local storage to remember your shopping cart items, session preferences, and recently viewed products. You can disable cookies in your browser settings at any time; however, some site features like persistent cart storage may require cookies to function optimally.
          </p>
        </div>

        {/* Section 6: Your Data Rights */}
        <div className="bg-[#0A0A0A] p-6 sm:p-8 rounded-2xl border border-[#222222] space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <FileText className="w-4 h-4 text-[#D4A017]" />
            <h2>6. Your Privacy Rights</h2>
          </div>
          <p>
            As a valued customer, you have full rights regarding your data:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#B3B3B3]">
            <li>Request a copy of the personal details we hold about you.</li>
            <li>Request correction or updating of incorrect address or phone numbers.</li>
            <li>Request deletion of your account and personal history from our active databases.</li>
            <li>Opt out of marketing WhatsApp messages or emails at any time by replying &quot;STOP&quot;.</li>
          </ul>
        </div>

        {/* Section 7: Contact Us for Privacy Concerns */}
        <div className="bg-[#111111] p-6 sm:p-8 rounded-2xl border border-[#D4A017]/40 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#D4A017]" />
            <span>7. Grievance Officer &amp; Privacy Contact</span>
          </h2>
          <p className="text-xs text-[#A3A3A3]">
            If you have any questions, concerns, or requests regarding this Privacy Policy or how your information is handled, please reach out to our dedicated privacy support:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222] space-y-1">
              <span className="text-[#888888] font-medium block">Email Support:</span>
              <a href={`mailto:${contactEmail}`} className="text-[#D4A017] hover:underline font-semibold block">
                {contactEmail}
              </a>
            </div>
            <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222] space-y-1">
              <span className="text-[#888888] font-medium block">Phone / WhatsApp:</span>
              <a href={`tel:${contactPhone}`} className="text-[#D4A017] hover:underline font-semibold block">
                {contactPhone}
              </a>
            </div>
            <div className="sm:col-span-2 bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222] space-y-1">
              <span className="text-[#888888] font-medium block">Registered Office:</span>
              <span className="text-[#D4D4D4]">{address}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Back to Home Button */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#222222] text-[#D4A017] hover:text-[#E5B842] border border-[#333333] hover:border-[#D4A017] rounded-xl text-xs font-bold uppercase tracking-wider transition"
        >
          &larr; Back to Home
        </button>
      </div>
    </div>
  );
};
