import React, { useState, useEffect } from 'react';

interface LogoPlaceholderProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'stacked';
  src?: string;
  alt?: string;
  showText?: boolean;
}

export const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({ 
  className = '', 
  variant = 'dark',
  size = 'md',
  layout = 'horizontal',
  src = '',
  alt = 'Store Logo',
  showText = false
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset imgError if src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  // Height sizing for the logo container in header so it displays clearly
  const sizeClasses = {
    sm: 'h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24'
  }[size];

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  }[size];

  const imgMaxSizes = {
    sm: 'max-h-8 max-w-[140px]',
    md: 'max-h-10 sm:max-h-12 max-w-[190px]',
    lg: 'max-h-14 max-w-[240px]',
    xl: 'max-h-20 max-w-[300px]'
  }[size];

  const titleSizes = {
    sm: 'text-sm font-semibold tracking-wide',
    md: 'text-base sm:text-lg font-bold tracking-wide',
    lg: 'text-xl sm:text-2xl font-bold tracking-wide',
    xl: 'text-2xl sm:text-3xl font-bold tracking-wide'
  }[size];

  const subtitleSizes = {
    sm: 'text-[8px] tracking-[0.2em]',
    md: 'text-[9px] sm:text-[10px] tracking-[0.25em]',
    lg: 'text-xs tracking-[0.25em]',
    xl: 'text-sm tracking-[0.3em]'
  }[size];

  const isDark = variant === 'dark';
  const hasCustomLogo = Boolean(src && src.trim().length > 0 && !imgError);

  return (
    <div id="jsartdecor-logo-brand" className={`inline-flex items-center justify-center select-none group ${sizeClasses} ${className}`}>
      <div className={`flex ${layout === 'stacked' ? 'flex-col items-center text-center gap-1.5' : 'items-center gap-2.5 sm:gap-3'}`}>
        
        {hasCustomLogo ? (
          /* Custom Uploaded Logo Image from Database/Settings */
          <div className="flex items-center justify-center shrink-0">
            <img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className={`h-auto w-auto ${imgMaxSizes} object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105`}
            />
          </div>
        ) : (
          /* Luxury Gold Monogram Badge Emblem */
          <div className={`relative ${iconSizes} shrink-0 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,160,23,0.35)] group-hover:shadow-[0_0_22px_rgba(212,160,23,0.55)] transition-all duration-300`}>
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-sm"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF2B2" />
                  <stop offset="25%" stopColor="#D4A017" />
                  <stop offset="50%" stopColor="#F7DB7D" />
                  <stop offset="75%" stopColor="#A67C1E" />
                  <stop offset="100%" stopColor="#E5C158" />
                </linearGradient>
                <radialGradient id="discBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1E1E1E" />
                  <stop offset="85%" stopColor="#0A0A0A" />
                  <stop offset="100%" stopColor="#000000" />
                </radialGradient>
                <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF7CC" />
                  <stop offset="50%" stopColor="#E2B743" />
                  <stop offset="100%" stopColor="#99731C" />
                </linearGradient>
              </defs>

              {/* Obsidian Circular Base */}
              <circle cx="50" cy="50" r="47" fill="url(#discBg)" stroke="url(#goldRing)" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#goldRing)" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.8" />

              {/* Architectural Arch / Gable silhouette at top */}
              <path
                d="M32 34 L50 20 L68 34"
                stroke="url(#goldRing)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Hanging Lantern / Pendant Bell Lamp */}
              <line x1="50" y1="20" x2="50" y2="28" stroke="url(#goldRing)" strokeWidth="1.2" />
              <path d="M47 28 L53 28 L54 32 L46 32 Z" fill="url(#goldRing)" />
              <circle cx="50" cy="33" r="1.5" fill="#FFE27A" />

              {/* Stylized Interlocking Monogram Ligature 'JS' */}
              {/* 'J' Letter with Brocade Textile Sweep */}
              <path
                d="M34 38 H44 V58 C44 65 40 68 34 68 C29 68 25 65 24 61"
                stroke="url(#goldText)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* 'S' Letter with Floral Swirls */}
              <path
                d="M66 43 C64 39 58 37 52 37 C45 37 41 41 41 46 C41 52 47 54 55 57 C64 60 67 64 67 70 C67 77 60 82 50 82 C41 82 35 77 34 71"
                stroke="url(#goldRing)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Botanical Foliage Flourish */}
              <path
                d="M50 84 C48 81 44 80 43 83 C45 86 49 86 50 84 Z"
                fill="url(#goldRing)"
              />
              <path
                d="M50 84 C52 81 56 80 57 83 C55 86 51 86 50 84 Z"
                fill="url(#goldRing)"
              />
            </svg>
          </div>
        )}

        {/* Brand Typography (Only shown if explicitly requested via showText) */}
        {showText && (
          <div className={`flex flex-col ${layout === 'stacked' ? 'items-center' : 'text-left'}`}>
            <span className={`font-serif ${titleSizes} font-bold leading-tight ${
              isDark 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2B2] via-[#E6B83B] to-[#F5D56E]'
                : 'text-neutral-900'
            }`}>
              JS Art &amp; Decor
            </span>
            <span className={`uppercase font-semibold ${subtitleSizes} ${
              isDark ? 'text-[#D4A017]' : 'text-amber-800'
            }`}>
              Textile • Home Decor
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
