import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { SiteSettings } from '../types/ecommerce';
import { ApiService } from '../services/api';

interface ContactPageProps {
  settings: SiteSettings;
  onNavigate: (view: string, param?: any) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings, onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await ApiService.submitContact(formData);
      if (res.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', mobile: '', subject: '', message: '' });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="contact-us-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 min-h-screen text-white">
      {/* Title */}
      <div className="border-b border-[#D4A017]/30 pb-4">
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">Contact Us & Wholesale Inquiry</h1>
        <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
          Reach out directly to our Jaipur manufacturing headquarters for retail assistance or bulk B2B quotations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Contact Form */}
        <div className="bg-[#0A0A0A] p-6 sm:p-8 rounded-2xl border border-[#D4A017] shadow-[0_0_20px_rgba(212,160,23,0.2)] space-y-4">
          <h2 className="text-base font-serif font-bold text-white border-b border-[#D4A017]/30 pb-3">
            Send an Online Inquiry Message
          </h2>

          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-500 rounded-xl flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-6 bg-emerald-950/60 border border-emerald-500 rounded-xl text-center space-y-2 text-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Inquiry Received Successfully!</h3>
              <p className="text-xs text-emerald-300">
                Our sales team will get in touch with you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-bold underline text-[#D4A017] hover:text-[#E5B842]"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#CCCCCC] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anish Gupta"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333333] focus:border-[#D4A017] rounded-lg p-2.5 text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#CCCCCC] mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 86024 14046"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333333] focus:border-[#D4A017] rounded-lg p-2.5 text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#CCCCCC] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. anish@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#D4A017] rounded-lg p-2.5 text-white placeholder:text-neutral-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#CCCCCC] mb-1">Inquiry Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Hotel Bedsheet Bulk Requirement (200 Sets)"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#D4A017] rounded-lg p-2.5 text-white placeholder:text-neutral-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#CCCCCC] mb-1">Detailed Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your inquiry, specifications, or quantity needed..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#D4A017] rounded-lg p-2.5 text-white placeholder:text-neutral-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#D4A017] hover:bg-[#E5B842] text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-[0_0_15px_rgba(212,160,23,0.3)]"
              >
                <Send className="w-3.5 h-3.5 text-black" />
                <span>{submitting ? 'Submitting Message...' : 'Submit Direct Message'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Info Card & Location Box */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] text-white p-6 sm:p-8 rounded-2xl border border-[#D4A017] shadow-[0_0_20px_rgba(212,160,23,0.2)] space-y-6">
            <h2 className="text-base font-serif font-bold text-white border-b border-[#D4A017]/30 pb-3">
              Headquarters & Factory Address
            </h2>

            <div className="space-y-4 text-xs text-[#CCCCCC]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D4A017] mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-white">Jaipur Textile & Art Hub</div>
                  <div className="text-[#A3A3A3]">{settings.address}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#D4A017] shrink-0" />
                <div>
                  <div className="font-bold text-white">Phone Support</div>
                  <a href={`tel:${settings.contact_phone || '+91 86024 14046'}`} className="text-[#A3A3A3] hover:text-[#D4A017] transition block">
                    {settings.contact_phone || '+91 86024 14046'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#D4A017] shrink-0" />
                <div>
                  <div className="font-bold text-white">Email Address</div>
                  <a href={`mailto:${settings.contact_email || 'info.jsartanddecor@gmail.com'}`} className="text-[#A3A3A3] hover:text-[#D4A017] transition block">
                    {settings.contact_email || 'info.jsartanddecor@gmail.com'}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D4A017]/30">
              <a
                href={`https://wa.me/${(settings.whatsapp_number || settings.contact_phone || '+91 86024 14046').replace(/[^0-9]/g, '')}?text=Hello%20JSArt%26Decor,%20I%20want%20to%20connect%20with%20sales.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Instant WhatsApp Chat Support</span>
              </a>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#D4A017] rounded-2xl p-8 text-center space-y-2 shadow-[0_0_15px_rgba(212,160,23,0.15)]">
            <MapPin className="w-8 h-8 text-[#D4A017] mx-auto" />
            <h3 className="text-xs font-bold text-white">Jaipur Industrial Complex, Rajasthan</h3>
            <p className="text-[11px] text-[#A3A3A3]">
              Open Monday to Saturday: 9:00 AM – 7:00 PM IST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
