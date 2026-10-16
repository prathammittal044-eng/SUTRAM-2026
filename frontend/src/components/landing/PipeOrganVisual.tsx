import React from 'react';

/**
 * PipeOrganVisual: Black and white classical architectural pipe organ
 * matching the vertical monochrome image on the left side of the About page.
 */
export const PipeOrganVisual: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden bg-black rounded-none select-none ${className}`}>
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 300 400"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Pipe Gradients */}
          <linearGradient id="organ-pipe-metal-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1A1A1A" />
            <stop offset="30%" stopColor="#8A8A8A" />
            <stop offset="50%" stopColor="#EAEAEA" />
            <stop offset="70%" stopColor="#757575" />
            <stop offset="100%" stopColor="#141414" />
          </linearGradient>

          <linearGradient id="organ-pipe-metal-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F0F0F" />
            <stop offset="35%" stopColor="#707070" />
            <stop offset="55%" stopColor="#D5D5D5" />
            <stop offset="75%" stopColor="#555555" />
            <stop offset="100%" stopColor="#0A0A0A" />
          </linearGradient>

          <linearGradient id="wood-case-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#303030" />
            <stop offset="30%" stopColor="#1F1F1F" />
            <stop offset="70%" stopColor="#121212" />
            <stop offset="100%" stopColor="#080808" />
          </linearGradient>

          {/* Soft Blur for Depth */}
          <filter id="organ-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>

          {/* Film Grain */}
          <filter id="organ-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0" />
            <feComposite in2="SourceGraphic" in="glare" operator="over" />
          </filter>
        </defs>

        {/* 1. Deep Black Background */}
        <rect width="300" height="400" fill="#080808" />

        {/* 2. Top Arch Framing */}
        <path
          d="M 20 40 Q 150 15 280 40 L 280 320 L 20 320 Z"
          fill="#111111"
        />

        {/* 3. The Organ Pipes Array */}
        {/* Symmetrical classical arrangement: tall central tower flanked by wings */}
        <g id="pipes">
          {/* Background Shadow behind pipes */}
          <rect x="25" y="35" width="250" height="235" fill="#050505" />

          {/* Center Tower Pipes (Taller in center, stepping down outward) */}
          {[
            // Center cluster
            { x: 145, w: 10, h: 220, y: 45 },
            { x: 133, w: 9.5, h: 212, y: 53 },
            { x: 157, w: 9.5, h: 212, y: 53 },
            { x: 122, w: 9, h: 202, y: 63 },
            { x: 168, w: 9, h: 202, y: 63 },
            { x: 111, w: 8.5, h: 190, y: 75 },
            { x: 179, w: 8.5, h: 190, y: 75 },
            { x: 101, w: 8, h: 178, y: 87 },
            { x: 189, w: 8, h: 178, y: 87 },
            // Intermediate flats
            { x: 92, w: 7.5, h: 165, y: 100 },
            { x: 199, w: 7.5, h: 165, y: 100 },
            { x: 83, w: 7.5, h: 155, y: 110 },
            { x: 208, w: 7.5, h: 155, y: 110 },
            { x: 74, w: 7, h: 145, y: 120 },
            { x: 217, w: 7, h: 145, y: 120 },
            { x: 65, w: 7, h: 140, y: 125 },
            { x: 226, w: 7, h: 140, y: 125 },
            // Outer Wings (Tall rising towers on each side)
            { x: 55, w: 8, h: 155, y: 110 },
            { x: 235, w: 8, h: 155, y: 110 },
            { x: 45, w: 8.5, h: 172, y: 93 },
            { x: 245, w: 8.5, h: 172, y: 93 },
            { x: 35, w: 9, h: 190, y: 75 },
            { x: 255, w: 9, h: 190, y: 75 },
          ].map((pipe, i) => (
            <g key={i}>
              {/* Pipe Body Cylinder */}
              <rect
                x={pipe.x}
                y={pipe.y}
                width={pipe.w}
                height={pipe.h}
                fill={i % 2 === 0 ? 'url(#organ-pipe-metal-1)' : 'url(#organ-pipe-metal-2)'}
                rx={pipe.w * 0.15}
              />
              {/* Languid / Mouth of pipe (characteristic triangular or horizontal slit) */}
              <path
                d={`M ${pipe.x + 1} ${pipe.y + pipe.h - 35} L ${pipe.x + pipe.w - 1} ${pipe.y + pipe.h - 35} L ${pipe.x + pipe.w / 2} ${pipe.y + pipe.h - 28} Z`}
                fill="#0A0A0A"
              />
              {/* Pipe Foot (tapered lower section resting on soundboard) */}
              <polygon
                points={`${pipe.x},${pipe.y + pipe.h} ${pipe.x + pipe.w},${pipe.y + pipe.h} ${pipe.x + pipe.w * 0.75},${pipe.y + pipe.h + 20} ${pipe.x + pipe.w * 0.25},${pipe.y + pipe.h + 20}`}
                fill={i % 2 === 0 ? 'url(#organ-pipe-metal-1)' : 'url(#organ-pipe-metal-2)'}
              />
            </g>
          ))}
        </g>

        {/* 4. Ornate Architectural Casework & Console Base */}
        <g id="casework">
          {/* Main Horizontal Cornice */}
          <rect x="20" y="275" width="260" height="14" fill="url(#wood-case-gradient)" stroke="#4A4A4A" strokeWidth="0.8" />
          <line x1="20" y1="282" x2="280" y2="282" stroke="#666666" strokeWidth="1" />

          {/* Lower Balustrade / Decorative Panels */}
          <rect x="24" y="289" width="252" height="65" fill="#141414" stroke="#333333" strokeWidth="1" />

          {/* Symmetrical Carved Panels */}
          {[32, 75, 118, 161, 204, 247].map((px, i) => (
            <g key={i}>
              <rect x={px} y="295" width="36" height="52" fill="#0D0D0D" stroke="#3D3D3D" strokeWidth="1" />
              {/* Panel Inset Molding */}
              <rect x={px + 4} y="299" width="28" height="44" fill="#181818" stroke="#555555" strokeWidth="0.8" />
              {/* Diamond or Rosette Motif */}
              <polygon
                points={`${px + 18},${310} ${px + 26},${321} ${px + 18},${332} ${px + 10},${321}`}
                fill="#2A2A2A"
                stroke="#666666"
                strokeWidth="0.8"
              />
            </g>
          ))}

          {/* Bottom Plinth */}
          <rect x="18" y="354" width="264" height="18" fill="url(#wood-case-gradient)" stroke="#3A3A3A" strokeWidth="1" />
          <rect x="15" y="372" width="270" height="28" fill="#0A0A0A" />
        </g>

        {/* 5. Vignette & Chiaroscuro Atmospheric Overlay */}
        <radialGradient id="organ-vignette" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
        </radialGradient>
        <rect width="300" height="400" fill="url(#organ-vignette)" style={{ mixBlendMode: 'multiply' }} />

        {/* 6. Authentic Film Texture */}
        <rect width="300" height="400" filter="url(#organ-grain)" opacity="0.3" />
      </svg>
    </div>
  );
};
