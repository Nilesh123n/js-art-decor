import React, { useState, useRef } from 'react';
import { 
  Save, 
  CheckCircle2, 
  Key, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  Database,
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  Link as LinkIcon,
  Check,
  FileImage
} from 'lucide-react';
import { SiteSettings } from '../../types/ecommerce';
import { ApiService } from '../../services/api';
import { LogoPlaceholder } from '../../components/common/LogoPlaceholder';

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

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoSuccessMsg, setLogoSuccessMsg] = useState<string | null>(null);
  const [logoErrorMsg, setLogoErrorMsg] = useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoFilePreview, setLogoFilePreview] = useState<string | null>(null);
  const [logoUploadMode, setLogoUploadMode] = useState<'upload' | 'url'>('upload');
  const [customLogoUrl, setCustomLogoUrl] = useState(settings.logo_path || settings.logo_url || '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoErrorMsg(null);
    setLogoSuccessMsg(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setLogoErrorMsg('Selected file exceeds 5MB size limit.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) {
      setLogoErrorMsg('Invalid image format. Supported formats: PNG, JPG, WEBP, SVG, GIF.');
      return;
    }

    setSelectedLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSelectedLogo = async () => {
    if (!selectedLogoFile) {
      setLogoErrorMsg('Please select a logo image file to upload.');
      return;
    }

    setUploadingLogo(true);
    setLogoErrorMsg(null);
    setLogoSuccessMsg(null);

    try {
      const res = await ApiService.uploadHeaderLogo(selectedLogoFile, selectedLogoFile.name);
      if (res && res.logo_url) {
        const newLogoUrl = res.logo_url;
        setForm(prev => ({
          ...prev,
          logo_path: newLogoUrl,
          logo_url: newLogoUrl
        }));
        setCustomLogoUrl(newLogoUrl);
        setSelectedLogoFile(null);
        setLogoFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        setLogoSuccessMsg('Logo uploaded and saved to MySQL database successfully! Storefront header updated.');
        onRefreshSettings();
        setTimeout(() => setLogoSuccessMsg(null), 5000);
      } else {
        throw new Error('Upload succeeded but no logo URL was returned.');
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setLogoErrorMsg(err?.message || 'Failed to upload logo image.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleApplyLogoUrl = async () => {
    if (!customLogoUrl || customLogoUrl.trim() === '') {
      setLogoErrorMsg('Please enter a valid image URL or file path.');
      return;
    }

    setUploadingLogo(true);
    setLogoErrorMsg(null);
    setLogoSuccessMsg(null);

    try {
      const updatedForm = {
        ...form,
        logo_path: customLogoUrl.trim(),
        logo_url: customLogoUrl.trim()
      };
      await ApiService.saveAdminSettings(updatedForm);
      setForm(updatedForm);
      setLogoSuccessMsg('Logo URL applied and saved to MySQL database successfully! Storefront header updated.');
      onRefreshSettings();
      setTimeout(() => setLogoSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Save logo URL error:', err);
      setLogoErrorMsg(err?.message || 'Failed to update logo URL in database.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRestoreDefaultLogo = async () => {
    if (!window.confirm('Reset the header logo back to the default brand emblem?')) return;

    setUploadingLogo(true);
    setLogoErrorMsg(null);
    setLogoSuccessMsg(null);

    try {
      const updatedForm = {
        ...form,
        logo_path: '',
        logo_url: ''
      };
      await ApiService.saveAdminSettings(updatedForm);
      setForm(updatedForm);
      setCustomLogoUrl('');
      setSelectedLogoFile(null);
      setLogoFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setLogoSuccessMsg('Logo reset to default emblem and saved to MySQL database.');
      onRefreshSettings();
      setTimeout(() => setLogoSuccessMsg(null), 4000);
    } catch (err: any) {
      setLogoErrorMsg(err?.message || 'Failed to reset logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleTestImageKit = async () => {
    setTestingImageKit(true);
    setImageKitTestResult(null);
    try {
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

  const activeLogo = form.logo_path || form.logo_url || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Storefront & System Settings</h1>
        <p className="text-xs text-neutral-500">Configure header logo, store details, Razorpay keys, and shipping rules in MySQL database.</p>
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

      {/* ------------------------------------------------------------- */}
      {/* 1. DEDICATED HEADER LOGO MANAGEMENT & DATABASE SYNC CARD */}
      {/* ------------------------------------------------------------- */}
      <div id="admin-logo-management-card" className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ImageIcon className="w-5 h-5" />
              <span>Header Logo Management</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium">
                Live Database Connected
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-1">
              Upload or change the storefront header logo. Changes are directly saved to the MySQL <code className="text-amber-300 font-mono">settings</code> table and reflected across all pages instantly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeLogo && (
              <button
                type="button"
                onClick={handleRestoreDefaultLogo}
                disabled={uploadingLogo}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-red-400 hover:bg-neutral-800 border border-neutral-700 rounded-lg flex items-center gap-1.5 transition"
                title="Reset to default brand monogram"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Logo Previews */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 bg-neutral-50/70 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>Live Header Preview</span>
            </span>
            <span className="text-[11px] text-neutral-500">
              Current Logo Source: <strong className="text-neutral-800 font-mono">{activeLogo ? activeLogo : 'Default Brand Emblem'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header Dark Bar Simulation */}
            <div className="rounded-xl overflow-hidden border border-neutral-800 shadow-inner">
              <div className="bg-neutral-900 px-3 py-1.5 text-[10px] font-mono text-neutral-400 flex items-center justify-between border-b border-neutral-800">
                <span>Dark Header Preview (#000000 bar)</span>
                <span className="text-emerald-400">● Live on Store</span>
              </div>
              <div className="bg-[#000000] p-4 flex items-center justify-between min-h-[72px]">
                <div className="flex items-center gap-3">
                  <LogoPlaceholder
                    variant="dark"
                    size="md"
                    src={logoFilePreview || activeLogo}
                    showText={false}
                  />
                </div>
                <div className="text-[10px] text-neutral-500 font-sans hidden sm:block">
                  (Pure Logo • No Side Text)
                </div>
              </div>
            </div>

            {/* Light Background Contrast Preview */}
            <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-inner">
              <div className="bg-neutral-100 px-3 py-1.5 text-[10px] font-mono text-neutral-600 flex items-center justify-between border-b border-neutral-200">
                <span>Light Background Contrast Check</span>
                <span className="text-neutral-500">Preview</span>
              </div>
              <div className="bg-white p-4 flex items-center justify-between min-h-[72px]">
                <div className="flex items-center gap-3">
                  <LogoPlaceholder
                    variant="light"
                    size="md"
                    src={logoFilePreview || activeLogo}
                    showText={false}
                  />
                </div>
                <div className="text-[10px] text-neutral-400 font-sans hidden sm:block">
                  Transparent PNG / SVG Recommended
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload & Change Controls */}
        <div className="p-5 sm:p-6 space-y-4">
          {logoSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{logoSuccessMsg}</span>
            </div>
          )}

          {logoErrorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{logoErrorMsg}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
            <button
              type="button"
              onClick={() => setLogoUploadMode('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                logoUploadMode === 'upload'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New File</span>
            </button>

            <button
              type="button"
              onClick={() => setLogoUploadMode('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                logoUploadMode === 'url'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Use Image URL / Path</span>
            </button>
          </div>

          {/* Mode 1: File Upload */}
          {logoUploadMode === 'upload' && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer transition bg-neutral-50/50 hover:bg-amber-50/30 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  onChange={handleLogoFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-neutral-800 block">
                      Click to choose an image file or drag &amp; drop here
                    </span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      Supports high-resolution PNG, WEBP, SVG, JPG (Max 5MB)
                    </span>
                  </div>
                </div>
              </div>

              {selectedLogoFile && (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {logoFilePreview && (
                      <div className="w-12 h-12 rounded-lg bg-black p-1 flex items-center justify-center border border-neutral-700 shrink-0">
                        <img src={logoFilePreview} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-xs text-neutral-900">{selectedLogoFile.name}</div>
                      <div className="text-[10px] text-neutral-500">
                        {(selectedLogoFile.size / 1024).toFixed(1)} KB • Ready to upload to server &amp; database
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLogoFile(null);
                        setLogoFilePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-3 py-2 text-neutral-600 hover:text-neutral-900 text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUploadSelectedLogo}
                      disabled={uploadingLogo}
                      className="px-4 py-2 bg-[#D4A017] hover:bg-[#b5860d] text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition disabled:opacity-50 w-full sm:w-auto justify-center"
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading &amp; Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Upload &amp; Set as Logo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Direct Image URL or Relative Path */}
          {logoUploadMode === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1 text-xs">
                  Logo Image URL or Local File Path
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="https://ik.imagekit.io/jsartdecor/logo.png or /uploads/logo.png"
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    className="flex-1 bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyLogoUrl}
                    disabled={uploadingLogo || !customLogoUrl}
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Apply &amp; Save</span>
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  You can paste an ImageKit CDN URL, external HTTPS URL, or local path like <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-700">/uploads/logo.png</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. GENERAL STOREFRONT & BUSINESS INFORMATION FORM */}
      {/* ------------------------------------------------------------- */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6 text-xs">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b pb-2">
          <span>General Business &amp; Contact Details</span>
        </h2>

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
            <label className="block font-bold text-neutral-700 mb-1">Database Logo Path / Key</label>
            <input
              type="text"
              value={form.logo_path}
              onChange={(e) => {
                setForm({ ...form, logo_path: e.target.value, logo_url: e.target.value });
                setCustomLogoUrl(e.target.value);
              }}
              placeholder="/uploads/logo.png"
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
            <label className="block font-bold text-neutral-700 mb-1">Factory &amp; Registered Address *</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-neutral-900"
            />
          </div>
        </div>

        {/* ImageKit CDN Configuration */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ImageKit CDN Media Storage (Optional)</span>
            </h2>
            <button
              type="button"
              onClick={handleTestImageKit}
              disabled={testingImageKit}
              className="px-3 py-1.5 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {testingImageKit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Test Connection</span>
            </button>
          </div>

          {imageKitTestResult && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
              imageKitTestResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {imageKitTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
              <span>{imageKitTestResult.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">ImageKit Public Key</label>
              <input
                type="text"
                placeholder="public_..."
                value={form.imagekit_public_key || ''}
                onChange={(e) => setForm({ ...form, imagekit_public_key: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">ImageKit URL Endpoint</label>
              <input
                type="text"
                placeholder="https://ik.imagekit.io/..."
                value={form.imagekit_url_endpoint || ''}
                onChange={(e) => setForm({ ...form, imagekit_url_endpoint: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-neutral-700 mb-1">ImageKit Private Key (Stored on Server)</label>
              <div className="relative">
                <input
                  type={showPrivateKey ? 'text' : 'password'}
                  placeholder="private_..."
                  value={form.imagekit_private_key || ''}
                  onChange={(e) => setForm({ ...form, imagekit_private_key: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 font-mono text-neutral-900 pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] text-neutral-500 hover:text-neutral-800"
                >
                  {showPrivateKey ? 'Hide' : 'Show'}
                </button>
              </div>
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
              Public Razorpay Key ID <span className="text-amber-700 font-normal">(Public Client Key)</span>
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
            <span>MySQL Database Tables Status</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            {[
              { name: 'banners', desc: 'Hero & Promo sliders' },
              { name: 'page_sections', desc: 'CMS page copy' },
              { name: 'products', desc: 'Retail & wholesale' },
              { name: 'orders', desc: 'Tracking & orders' },
              { name: 'settings', desc: 'Logo, ImageKit & config' },
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
            <span>Save All System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
