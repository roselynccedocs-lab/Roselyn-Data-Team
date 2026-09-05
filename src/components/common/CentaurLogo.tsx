import React from 'react';

interface CentaurLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  variant?: 'full' | 'icon' | 'badge';
}

/**
 * Centaur Chem Enterprise Official Company Logo
 * Features the signature green Centaur Archer drawing a bow inside the curved 'C' monogram.
 */
export function CentaurLogo({ 
  className = '', 
  size = 40, 
  showText = false,
  textColor = 'text-slate-900 dark:text-white',
  variant = 'icon'
}: CentaurLogoProps) {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  const logoSvg = (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: dimension, height: dimension }}
      className={`shrink-0 select-none ${className}`}
      aria-label="Centaur Chem Official Logo"
    >
      <defs>
        {/* Soft Drop Shadow Filter for Vector Depth */}
        <filter id="centaurShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#064e3b" floodOpacity="0.25" />
        </filter>
        <linearGradient id="centaurGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="centaurArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Outer Monogram 'C' Arc Backdrop */}
      <path
        d="M 160 55 C 120 10, 45 30, 28 85 C 10 140, 50 185, 125 188 C 160 189, 182 170, 185 158 C 172 166, 145 174, 118 172 C 60 168, 38 128, 48 88 C 58 48, 115 32, 155 60 C 160 52, 168 45, 172 40"
        fill="url(#centaurArcGrad)"
        stroke="#22c55e"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Centaur Archer & Bow Group with subtle drop shadow */}
      <g filter="url(#centaurShadow)">
        {/* Archery Bow Curve */}
        <path
          d="M 102 20 C 125 35, 155 70, 175 110 C 168 120, 155 135, 150 148"
          stroke="#15803d"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bow String */}
        <path
          d="M 102 20 L 125 88 L 150 148"
          stroke="#16a34a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 0"
        />

        {/* Drawn Arrow */}
        <path
          d="M 68 112 L 165 65"
          stroke="#15803d"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Arrow Tip */}
        <polygon
          points="165,65 153,60 156,70"
          fill="#15803d"
        />

        {/* Archer Helmet / Plume */}
        <path
          d="M 68 64 C 62 55, 70 45, 82 45 C 80 50, 78 58, 85 64"
          stroke="#15803d"
          strokeWidth="3.5"
          fill="#22c55e"
          strokeLinecap="round"
        />
        <path
          d="M 72 46 C 76 38, 88 35, 96 38"
          stroke="#16a34a"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Archer Head & Torso */}
        <path
          d="M 70 65 C 75 62, 85 62, 88 68 C 85 75, 78 78, 72 75 Z"
          fill="#16a34a"
        />
        
        {/* Muscular Drawn Arm (Left arm extending forward) */}
        <path
          d="M 85 72 L 122 86 L 140 78"
          stroke="#15803d"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Drawing Arm (Right elbow drawn back) */}
        <path
          d="M 72 75 L 55 92 L 72 108"
          stroke="#15803d"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Centaur Equine / Human Torso Dynamic Silhouette */}
        <path
          d="M 72 78 C 82 85, 85 95, 78 110 C 72 120, 60 128, 48 135 C 42 140, 36 150, 42 160 C 48 168, 62 165, 72 152 C 82 140, 92 138, 105 142 C 112 145, 116 155, 112 165 C 108 172, 98 178, 92 180"
          stroke="#15803d"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dynamic Inner Accent Lines */}
        <path
          d="M 62 98 C 68 108, 75 115, 85 118"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 78 132 C 86 138, 94 139, 102 135"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 45 148 C 50 155, 58 155, 65 148"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );

  if (!showText) {
    return logoSvg;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {logoSvg}
      <div className="flex flex-col">
        <span className={`font-black tracking-tight text-sm leading-tight uppercase ${textColor}`}>
          Centaur Chem
        </span>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Enterprise Systems
        </span>
      </div>
    </div>
  );
}
export default CentaurLogo;
