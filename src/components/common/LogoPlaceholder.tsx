import React from 'react';

interface LogoPlaceholderProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'stacked';
}

export const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({ 
  className = '', 
  variant = 'dark',
  size = 'md',
  layout = 'stacked'
}) => {
  // Height sizing for the logo container in header so it displays clearly
  const sizeClasses = {
    sm: 'h-10 sm:h-12',
    md: 'h-14 sm:h-16',
    lg: 'h-18 sm:h-22'
  }[size];

  return (
    <div id="jsartdecor-logo-brand" className={`inline-flex items-center justify-center select-none group ${sizeClasses} ${className}`}>
      <svg 
        viewBox="0 0 220 170" 
        className="h-full w-auto text-[#D4A017] drop-shadow-[0_1px_4px_rgba(212,160,23,0.35)] group-hover:drop-shadow-[0_2px_10px_rgba(212,160,23,0.6)] transition-all duration-300" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Rich Gold Metallic Gradient */}
          <linearGradient id="goldLinear" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCE08B" />
            <stop offset="25%" stopColor="#D4A017" />
            <stop offset="55%" stopColor="#B8860B" />
            <stop offset="80%" stopColor="#E5B842" />
            <stop offset="100%" stopColor="#A06E18" />
          </linearGradient>

          {/* Crisp Text Gold Gradient */}
          <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="30%" stopColor="#D4A017" />
            <stop offset="70%" stopColor="#F7DB7D" />
            <stop offset="100%" stopColor="#C59B27" />
          </linearGradient>
        </defs>

        {/* 1. TOP CREST CIRCLE (Center at X=110, Y=65, Radius R=50) */}
        <g transform="translate(0, 0)">
          {/* Outer Ring */}
          <circle cx="110" cy="65" r="50" stroke="url(#goldLinear)" strokeWidth="2.5" fill="none" />
          {/* Inner Dotted Ring */}
          <circle cx="110" cy="65" r="44" stroke="url(#goldLinear)" strokeWidth="0.9" strokeDasharray="3 2" fill="none" opacity="0.85" />

          {/* Top & Bottom Accent Diamonds */}
          <polygon points="110,12 113,15 110,18 107,15" fill="url(#goldLinear)" />
          <polygon points="110,112 113,115 110,118 107,115" fill="url(#goldLinear)" />

          {/* Laurel Leaf Branch (Left Arc) */}
          <path d="M 74,98 C 66,82 72,56 84,38" stroke="url(#goldLinear)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          {/* Laurel Leaves */}
          <path d="M 68,94 C 60,90 63,82 71,86 C 73,91 71,95 68,94 Z" fill="url(#goldLinear)" />
          <path d="M 64,82 C 56,77 59,70 67,73 C 69,78 67,82 64,82 Z" fill="url(#goldLinear)" />
          <path d="M 64,68 C 56,62 61,56 68,59 C 70,64 67,69 64,68 Z" fill="url(#goldLinear)" />
          <path d="M 68,54 C 61,46 68,41 74,45 C 76,50 72,55 68,54 Z" fill="url(#goldLinear)" />
          <path d="M 75,43 C 71,35 79,31 84,36 C 85,41 80,45 75,43 Z" fill="url(#goldLinear)" />
          <path d="M 84,34 C 82,26 90,24 93,29 C 92,34 87,36 84,34 Z" fill="url(#goldLinear)" />

          {/* Floral Scrollwork & Flower Motif (Top Right Arc) */}
          <path d="M 118,17 C 132,18 148,27 156,42 M 156,42 C 162,54 159,70 150,82" stroke="url(#goldLinear)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          {/* Top Right Flower Petal Motif */}
          <path d="M 140,21 Q 146,13 151,20 Q 158,25 151,30 Q 146,35 141,28 Q 134,25 140,21 Z" fill="url(#goldLinear)" opacity="0.95" />
          <circle cx="146" cy="23" r="2.2" fill="#FFF2A1" />
          <path d="M 152,36 Q 159,34 157,41 Q 151,43 150,38 Z" fill="url(#goldLinear)" />
          <path d="M 151,50 Q 158,52 154,58 Q 148,56 149,51 Z" fill="url(#goldLinear)" />
          <path d="M 148,63 Q 154,67 149,72 Q 144,69 146,65 Z" fill="url(#goldLinear)" />

          {/* Center Monogram: JS */}
          <text 
            x="110" 
            y="78" 
            textAnchor="middle" 
            fontFamily="Playfair Display, Times New Roman, Georgia, serif" 
            fontSize="44" 
            fontWeight="bold" 
            fill="url(#goldTextGrad)" 
            letterSpacing="-1"
          >
            JS
          </text>
        </g>

        {/* 2. BOTTOM TEXT SECTION ("ART & DECOR" directly UNDER JS crest) */}
        <g transform="translate(0, 0)">
          {/* Left Flank Line & Diamond Accent */}
          <polygon points="12,148 16,144 20,148 16,152" fill="url(#goldLinear)" />
          <line x1="24" y1="148" x2="48" y2="148" stroke="url(#goldLinear)" strokeWidth="1.4" />

          {/* "ART & DECOR" Subtext centered under JS emblem */}
          <text 
            x="110" 
            y="153" 
            textAnchor="middle" 
            fontFamily="Playfair Display, Georgia, Times New Roman, serif" 
            fontSize="16" 
            fontWeight="800" 
            fill="url(#goldTextGrad)" 
            letterSpacing="5"
          >
            ART & DECOR
          </text>

          {/* Right Flank Line & Diamond Accent */}
          <line x1="172" y1="148" x2="196" y2="148" stroke="url(#goldLinear)" strokeWidth="1.4" />
          <polygon points="200,148 204,144 208,148 204,152" fill="url(#goldLinear)" />
        </g>
      </svg>
    </div>
  );
};
