import React, { useState } from 'react';
import { Save, CheckCircle2, Key, Image, Loader2, AlertCircle, Sparkles, Database } from 'lucide-react';
import { SiteSettings } from '../../types/ecommerce';
import { ApiService } from '../../services/api';

interface AdminSettingsProps {
  settings: SiteSettings;
  onRefreshSettings: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onRefreshSettings }) => {
  const [form, setForm] = useState<SiteSettings>({ ...settings });
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [testingImageKit, setTestingImageKit] = useState(false);
  const [imageKitTestResult, setImageKitTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestImageKit = async () => {
    setTestingImageKit(true);
    setImageKitTestResult(null);
    try {
      // First save current key if edited
      if (form.imagekit_private_key || form.imagekit_url_endpoint) {
        await ApiService.saveAdminSettings(form);
      }
      const res = await ApiService.testImageKitConnection();
      setImageKitTestResult(res);
    } catch (err: any) {
      setImageKitTestResult({
        success: false,
        message: err.message || 'ImageKit connection test failed.'
      });
    } finally {
      setTestingImageKit(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    setError(null);

    try {
      await ApiService.saveAdminSettings(form);
      setSaved(true);
      onRefreshSettings();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Storefront & System Settings</h1>
        <p className="text-xs text-neutral-500">Configure logo configuration, phone numbers, Razorpay public keys, and shipping rules in MySQL.</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>System Settings Updated Successfully in Database!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-bold">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6 text-xs">
        {/* Logo Placeholder Configuration Callout */}
        <div className="p-4 bg-neutral-900 text-white rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Image className="w-4 h-4" />
            <span>Clear Logo Placeholder Configuration</span>
          </div>
          <p className="text-[11px] text-neutral-300">
            To swap the brand placeholder logo with your custom logo file, place your logo image in <code className="bg-neutral-800 text-amber-400 px-1 py-0.5 rounded font-mono">/uploads/logo.png</code> or update the URL below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Store Name *</label>
            <input
              type="text"
              required
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-bold text-neutral-900"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Logo Image File Path / URL</label>
            <input
              type="text"
              required
              value={form.logo_path}
              onChange={(e) => setForm({ ...form, logo_path: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Contact Phone Number *</label>
            <input
              type="text"
              required
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">WhatsApp Direct Order Number *</label>
            <input
              type="text"
              required
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Contact Email Address *</label>
            <input
              type="email"
              required
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-neutral-700 mb-1">Factory & Registered Address *</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
            />
          </div>
        </div>

        {/* ImageKit CDN & Hostinger MySQL Media Storage */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ImageKit CDN Media Integration (Hostinger MySQL Connected)</span>
            </h2>
            <button
              type="button"
              onClick={handleTestImageKit}
              disabled={testingImageKit}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {testingImageKit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Test ImageKit Connection</span>
            </button>
          </div>

          <p className="text-[11px] text-neutral-500">
            ImageKit provides real-time image resizing, automatic WebP/AVIF compression, and global CDN delivery. Image metadata and configurations are stored in your Hostinger MySQL database.
          </p>

          {imageKitTestResult && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                imageKitTestResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {imageKitTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{imageKitTestResult.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                ImageKit URL-Endpoint *
              </label>
              <input
                type="text"
                placeholder="https://ik.imagekit.io/your_account_id"
                value={form.imagekit_url_endpoint || ''}
                onChange={(e) => setForm({ ...form, imagekit_url_endpoint: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
              />
              <span className="text-[10px] text-neutral-400">Found in ImageKit Dashboard &gt; Developer Options</span>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                ImageKit Public Key *
              </label>
              <input
                type="text"
                placeholder="public_xxxxxxxxxxxx"
                value={form.imagekit_public_key || ''}
                onChange={(e) => setForm({ ...form, imagekit_public_key: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
              />
              <span className="text-[10px] text-neutral-400">Used for client-side uploads</span>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-neutral-700">
                  ImageKit Private API Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="text-[11px] text-neutral-500 hover:text-neutral-800 font-medium"
                >
                  {showPrivateKey ? 'Hide Key' : 'Reveal Key'}
                </button>
              </div>
              <input
                type={showPrivateKey ? 'text' : 'password'}
                placeholder="private_xxxxxxxxxxxx"
                value={form.imagekit_private_key || ''}
                onChange={(e) => setForm({ ...form, imagekit_private_key: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
              />
              <span className="text-[10px] text-neutral-400">
                Encrypted in Hostinger MySQL settings. Required for secure server-side image synchronization.
              </span>
            </div>
          </div>
        </div>

        {/* Razorpay Key Settings */}
        <div className="border-t pt-4 space-y-3">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-600" />
            <span>Razorpay Payment Gateway Key Configuration</span>
          </h2>
          
          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Public Razorpay Key ID <span className="text-amber-700 font-normal">(NO secret keys here!)</span>
            </label>
            <input
              type="text"
              required
              value={form.razorpay_key_id}
              onChange={(e) => setForm({ ...form, razorpay_key_id: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
            />
          </div>
        </div>

        {/* Shipping Parameters */}
        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              required
              value={form.free_shipping_threshold}
              onChange={(e) => setForm({ ...form, free_shipping_threshold: Number(e.target.value) })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Standard Shipping Fee (₹)</label>
            <input
              type="number"
              required
              value={form.standard_shipping_fee}
              onChange={(e) => setForm({ ...form, standard_shipping_fee: Number(e.target.value) })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
            />
          </div>

          <div className="sm:col-span-2 pt-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <span className="font-bold text-neutral-700">Payment Methods:</span>
              <span>Instant Online Payment (Razorpay UPI, Credit/Debit Card, Netbanking) is enabled. COD is disabled per store policy.</span>
            </div>
          </div>
        </div>

        {/* Hostinger MySQL Database Schema Status */}
        <div className="border-t pt-4 space-y-3">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Hostinger MySQL Database Tables</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            {[
              { name: 'banners', desc: 'Hero & Promo sliders' },
              { name: 'page_sections', desc: 'CMS page copy' },
              { name: 'products', desc: 'Retail & wholesale' },
              { name: 'orders', desc: 'Tracking & orders' },
              { name: 'settings', desc: 'ImageKit & config' },
              { name: 'contact_messages', desc: 'Enquiries & leads' },
              { name: 'blogs', desc: 'Articles & stories' },
              { name: 'partners', desc: 'B2B & clients' }
            ].map((tbl) => (
              <div key={tbl.name} className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="font-bold text-emerald-700 block">✓ {tbl.name}</span>
                <span className="text-neutral-500 text-[10px]">{tbl.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
