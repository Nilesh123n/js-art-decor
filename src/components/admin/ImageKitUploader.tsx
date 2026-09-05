import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Check, Copy, Loader2, Sparkles, Image as ImageIcon, ExternalLink, AlertCircle } from 'lucide-react';
import { ApiService } from '../../services/api';

interface ImageKitUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  hint?: string;
}

export const ImageKitUploader: React.FC<ImageKitUploaderProps> = ({
  value = '',
  onChange,
  label = 'Image URL / Upload',
  folder = '/jsartdecor',
  hint = 'Upload to ImageKit CDN or paste a direct image URL'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP, SVG).');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const result = await ApiService.uploadToImageKit(file, file.name, folder);
      if (result && result.url) {
        onChange(result.url);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        throw new Error('No URL returned from ImageKit upload.');
      }
    } catch (err: any) {
      console.error('ImageKit upload error:', err);
      setUploadError(err.message || 'ImageKit upload failed. Verify your ImageKit credentials in Settings.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-neutral-800 tracking-wide">
          {label}
        </label>
        <div className="flex items-center gap-1 text-[11px] bg-neutral-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              activeTab === 'upload'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            ImageKit Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              activeTab === 'url'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Direct URL
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
            dragActive
              ? 'border-amber-500 bg-amber-50/50'
              : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/70 hover:bg-neutral-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {isUploading ? (
              <div className="flex items-center gap-2 text-amber-700 font-medium text-xs py-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Optimizing & Uploading to ImageKit CDN...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-800">
                    Click to browse or drop an image here
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Fast WebP compression, auto-resize & CDN hosting via ImageKit
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://ik.imagekit.io/... or https://images.unsplash.com/..."
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Image uploaded & CDN link generated!</span>
        </div>
      )}

      {/* Preview Card */}
      {value && (
        <div className="flex items-center gap-3 p-2 bg-white border border-neutral-200 rounded-lg">
          <div className="w-12 h-12 rounded-md bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=100&q=80';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono text-neutral-700 truncate" title={value}>
              {value}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {value.includes('imagekit') ? 'ImageKit CDN' : 'Live Image'}
              </span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5"
              >
                Open <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy URL"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
};
