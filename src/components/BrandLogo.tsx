import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showText = false, className = '' }) => {
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizeMap = {
    sm: 36,
    md: 44,
    lg: 64,
    xl: 96
  };

  const dim = iconSizeMap[size];

  // Unique ID prefix to prevent SVG defs collision when multiple logos are rendered
  const id = React.useId().replace(/:/g, '_');

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        id="app-brand-logo-icon"
        className={`${sizeMap[size]} relative flex items-center justify-center rounded-full bg-slate-950 shadow-xl shadow-black/60 ring-2 ring-amber-500/30 overflow-hidden flex-shrink-0 transition-transform active:scale-95`}
      >
        {/* Premium 3D Embossed Gold & Royal Blue Vector Badge */}
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Deep Royal Blue Radial Sunburst Background */}
            <radialGradient id={`bg-sunburst-${id}`} cx="50%" cy="50%" r="50%" fx="40%" fy="35%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="50%" stopColor="#172554" />
              <stop offset="100%" stopColor="#0B1120" />
            </radialGradient>

            {/* Enamel Outer Ring Gradient */}
            <linearGradient id={`enamel-ring-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>

            {/* Polished Metallic 3D Gold Gradient (High Contrast) */}
            <linearGradient id={`gold-3d-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="20%" stopColor="#FCD34D" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="90%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* Gold Highlight Sheen */}
            <linearGradient id={`gold-sheen-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#FEF08A" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#78350F" stopOpacity="0.8" />
            </linearGradient>

            {/* Gold Rope Trim Linear Gradient */}
            <linearGradient id={`gold-rope-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="25%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FFFBEB" />
              <stop offset="75%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Subtle Drop Shadow for 3D Elements */}
            <filter id={`shadow-3d-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.75" />
            </filter>

            {/* Inner Glow for Center Sunburst */}
            <filter id={`glow-sunburst-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Curved Text Paths */}
            {/* Top Text Path for "SUMIT" */}
            <path
              id={`text-path-top-${id}`}
              d="M 36,100 A 64,64 0 0,1 164,100"
              fill="none"
            />
            {/* Bottom Text Path for "WORKFORCE PRO" */}
            <path
              id={`text-path-bottom-${id}`}
              d="M 166,100 A 66,66 0 0,1 34,100"
              fill="none"
            />
          </defs>

          {/* 1. OUTER ROPE-EDGE BEADED BORDER */}
          <circle cx="100" cy="100" r="98" fill="url(#bg-sunburst-${id})" />
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke={`url(#gold-3d-${id})`}
            strokeWidth="5"
          />
          {/* Detailed Rope Segments around border */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke={`url(#gold-sheen-${id})`}
            strokeWidth="4"
            strokeDasharray="3 3.5"
            strokeLinecap="round"
          />

          {/* 2. OUTER DEEP BLUE ENAMEL RING */}
          <circle
            cx="100"
            cy="100"
            r="88"
            fill={`url(#enamel-ring-${id})`}
            stroke={`url(#gold-3d-${id})`}
            strokeWidth="2"
          />
          {/* Inner containment gold ring */}
          <circle
            cx="100"
            cy="100"
            r="69"
            fill="none"
            stroke={`url(#gold-3d-${id})`}
            strokeWidth="2.5"
            filter={`url(#shadow-3d-${id})`}
          />

          {/* 3. CENTER SUNBURST WITH RADIAL FLUTED RAYS */}
          <circle cx="100" cy="100" r="68" fill={`url(#bg-sunburst-${id})`} />
          {/* 24 Radial Fluted Sunburst Rays */}
          <g opacity="0.35">
            {Array.from({ length: 24 }).map((_, i) => (
              <path
                key={i}
                d="M 100 100 L 95 32 L 105 32 Z"
                fill="#38BDF8"
                transform={`rotate(${i * 15} 100 100)`}
              />
            ))}
          </g>

          {/* Concentric subtle inner gold ring */}
          <circle
            cx="100"
            cy="100"
            r="54"
            fill="none"
            stroke={`url(#gold-3d-${id})`}
            strokeWidth="1"
            strokeOpacity="0.4"
            strokeDasharray="2 3"
          />

          {/* 4. SHARP 3D GOLDEN CURVED TYPOGRAPHY */}
          {/* Top Text: "SUMIT" */}
          <text
            fill={`url(#gold-3d-${id})`}
            fontSize="17"
            fontWeight="900"
            fontFamily="Arial, 'Montserrat', sans-serif"
            letterSpacing="5"
            filter={`url(#shadow-3d-${id})`}
          >
            <textPath href={`#text-path-top-${id}`} startOffset="50%" textAnchor="middle">
              SUMIT
            </textPath>
          </text>

          {/* Bottom Text: "WORKFORCE PRO" */}
          <text
            fill={`url(#gold-3d-${id})`}
            fontSize="10.5"
            fontWeight="900"
            fontFamily="Arial, 'Montserrat', sans-serif"
            letterSpacing="2.5"
            filter={`url(#shadow-3d-${id})`}
          >
            <textPath href={`#text-path-bottom-${id}`} startOffset="50%" textAnchor="middle">
              WORKFORCE PRO
            </textPath>
          </text>

          {/* 5. TWO POLISHED 3D GOLDEN 5-POINT STARS (Left and Right) */}
          {/* Left 5-point Star */}
          <g transform="translate(25, 96) scale(0.7)" filter={`url(#shadow-3d-${id})`}>
            <polygon
              points="0,-8 2.5,-2.5 8,-2.5 3.5,1.5 5.5,7 0,3.5 -5.5,7 -3.5,1.5 -8,-2.5 -2.5,-2.5"
              fill={`url(#gold-3d-${id})`}
              stroke={`url(#gold-sheen-${id})`}
              strokeWidth="0.8"
            />
          </g>
          {/* Right 5-point Star */}
          <g transform="translate(175, 96) scale(0.7)" filter={`url(#shadow-3d-${id})`}>
            <polygon
              points="0,-8 2.5,-2.5 8,-2.5 3.5,1.5 5.5,7 0,3.5 -5.5,7 -3.5,1.5 -8,-2.5 -2.5,-2.5"
              fill={`url(#gold-3d-${id})`}
              stroke={`url(#gold-sheen-${id})`}
              strokeWidth="0.8"
            />
          </g>

          {/* 6. CENTER EMBLEM: LUXURIOUS 3D EMBOSSED METALLIC GOLD "YS" MONOGRAM */}
          <g filter={`url(#shadow-3d-${id})`}>
            {/* Letter 'Y' */}
            <path
              d="M 68 84 L 84 104 L 84 134 C 84 136 86 138 88 138 L 94 138 C 96 138 98 136 98 134 L 98 104 L 114 84 C 116 81.5 114 78 110 78 L 102 78 C 99.5 78 97.5 79.5 96 81.5 L 91 89 L 86 81.5 C 84.5 79.5 82.5 78 80 78 L 72 78 C 68 78 66 81.5 68 84 Z"
              fill={`url(#gold-3d-${id})`}
              stroke={`url(#gold-sheen-${id})`}
              strokeWidth="1.2"
            />
            {/* Letter 'S' Intertwined */}
            <path
              d="M 132 94 C 132 84 122 78 110 78 C 99 78 91 84 91 93 C 91 106 128 102 128 116 C 128 123 121 128 110 128 C 99 128 92 122 91 113 L 102 112 C 103 117 106 120 110 120 C 114 120 117 118 117 114 C 117 103 80 106 80 92 C 80 81 90 71 108 71 C 126 71 138 80 140 93 L 132 94 Z"
              fill={`url(#gold-3d-${id})`}
              stroke={`url(#gold-sheen-${id})`}
              strokeWidth="1.2"
              opacity="0.95"
            />
          </g>

          {/* 7. TOP ACCENT: 3D GOLDEN GRADUATION CAP (MORTARBOARD) WITH DANGLING TASSEL */}
          <g transform="translate(100, 68)" filter={`url(#shadow-3d-${id})`}>
            {/* Cap Skull Cap Base Underneath */}
            <ellipse cx="0" cy="5" rx="14" ry="4.5" fill="#78350F" />
            <path
              d="M -13 4.5 Q 0 11 13 4.5 L 12 8 Q 0 14 -12 8 Z"
              fill={`url(#gold-3d-${id})`}
            />

            {/* 3D Mortarboard Top Rhombus Diamond */}
            <polygon
              points="0,-12 26,-2 0,8 -26,-2"
              fill={`url(#gold-3d-${id})`}
              stroke={`url(#gold-sheen-${id})`}
              strokeWidth="1.5"
            />

            {/* Mortarboard Center Button */}
            <circle cx="0" cy="-2" r="2.5" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.8" />

            {/* Dangling Tassel Cord & Fringe */}
            <path
              d="M 0 -2 Q 15 -1 20 8 Q 23 16 22 22"
              fill="none"
              stroke="#FFFBEB"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Tassel Hanging Fringe */}
            <polygon
              points="20,20 24,20 25,27 19,27"
              fill={`url(#gold-3d-${id})`}
              stroke="#FEF08A"
              strokeWidth="0.5"
            />
          </g>

          {/* 8. SPECULAR REFLECTION / STUDIO LIGHTING HIGHLIGHTS */}
          <ellipse
            cx="75"
            cy="52"
            rx="20"
            ry="9"
            fill="#FFFFFF"
            opacity="0.12"
            transform="rotate(-25 75 52)"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg leading-tight tracking-tight text-white">
              SUMIT WORKFORCE
            </span>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-md font-mono">
              PRO
            </span>
          </div>
          <span className="text-xs text-amber-300/80 font-medium tracking-wide">
            Enterprise Attendance & Payroll System
          </span>
        </div>
      )}
    </div>
  );
};
