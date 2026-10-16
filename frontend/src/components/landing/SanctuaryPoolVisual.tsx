import React from 'react';

/**
 * SanctuaryPoolVisual: Ethereal architectural sanctuary with a reflecting pool,
 * glowing orange arched portal, and a solitary meditating silhouette.
 * Matching the large visual on the right of the About page.
 */
export const SanctuaryPoolVisual: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden bg-black select-none ${className}`}>
      <svg
        className="w-full h-full object-cover scale-[1.01]"
        viewBox="0 0 700 750"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Film Grain */}
          <filter id="pool-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
            <feComposite in2="SourceGraphic" in="glare" operator="over" />
          </filter>

          {/* Precision Blurs */}
          <filter id="glow-spread-lg" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="45" />
          </filter>
          <filter id="glow-spread-md" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="reflection-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>

          {/* Chamber Wall Gradient */}
          <linearGradient id="chamber-wall" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#0B090A" />
            <stop offset="35%" stopColor="#1E191C" />
            <stop offset="65%" stopColor="#301A18" />
            <stop offset="100%" stopColor="#541B12" />
          </linearGradient>

          {/* Glowing Arch Portal Gradients */}
          <radialGradient id="portal-inner-glow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#FFF2D6" stopOpacity="1" />
            <stop offset="25%" stopColor="#FFBA59" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#FF5C1C" stopOpacity="0.92" />
            <stop offset="90%" stopColor="#E2360B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#A82004" stopOpacity="0.85" />
          </radialGradient>

          <radialGradient id="arch-outer-bloom" cx="80%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FF7726" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#E84310" stopOpacity="0.45" />
            <stop offset="80%" stopColor="#8C1F0A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Water Surface Gradient */}
          <linearGradient id="water-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#141014" />
            <stop offset="30%" stopColor="#1C1417" />
            <stop offset="70%" stopColor="#0F0C0E" />
            <stop offset="100%" stopColor="#080607" />
          </linearGradient>

          {/* Arch Water Reflection Gradient */}
          <linearGradient id="arch-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF8B38" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#FF551C" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#D93408" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#801902" stopOpacity="0.1" />
          </linearGradient>

          {/* Platform Stone Gradient */}
          <linearGradient id="platform-stone" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1A1B" />
            <stop offset="50%" stopColor="#120F10" />
            <stop offset="100%" stopColor="#080707" />
          </linearGradient>
        </defs>

        {/* 1. Base Layer: Dark Architectural Void */}
        <rect width="700" height="750" fill="#080708" />

        {/* 2. Curved Sanctuary Walls */}
        <path
          d="M 0 0 L 700 0 L 700 520 C 500 515, 200 525, 0 535 Z"
          fill="url(#chamber-wall)"
        />

        {/* Soft atmospheric mist on curved back wall */}
        <ellipse cx="320" cy="380" rx="360" ry="180" fill="#2E2528" filter="url(#glow-spread-lg)" opacity="0.45" />

        {/* Horizontal Horizon Amber Light Slits along base of wall */}
        <g id="horizon-lights">
          <path
            d="M 40 518 Q 200 516 380 520"
            stroke="#FF6622"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            filter="url(#glow-spread-md)"
          />
          <path
            d="M 40 518 Q 200 516 380 520"
            stroke="#FFAD5A"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />

          <path
            d="M 450 518 Q 500 517 540 518"
            stroke="#FF6622"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            filter="url(#glow-spread-md)"
          />
          <path
            d="M 450 518 Q 500 517 540 518"
            stroke="#FFAD5A"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
        </g>

        {/* 3. The Towering Glowing Orange Arch Portal */}
        {/* Massive Ambient Radiant Bloom */}
        <circle
          cx="555"
          cy="310"
          r="340"
          fill="url(#arch-outer-bloom)"
          filter="url(#glow-spread-lg)"
        />

        {/* Portal Structure */}
        <g id="glowing-arch">
          {/* Outer Recessed Bevel Arch */}
          <path
            d="M 505 530 L 505 270 C 505 160, 605 160, 605 270 L 605 530 Z"
            fill="#5C1C0D"
            filter="url(#glow-spread-md)"
            opacity="0.8"
          />

          {/* Main Incandescent Archway Silhouette */}
          <path
            d="M 515 530 L 515 275 C 515 175, 595 175, 595 275 L 595 530 Z"
            fill="url(#portal-inner-glow)"
          />

          {/* Deep Inner Recess / Door Core with blinding center light */}
          <path
            d="M 525 530 L 525 285 C 525 205, 585 205, 585 285 L 585 530 Z"
            fill="#FFF5DE"
            opacity="0.95"
            filter="url(#glow-spread-md)"
          />
          <path
            d="M 532 530 L 532 295 C 532 225, 578 225, 578 295 L 578 530 Z"
            fill="#FFFFFF"
            opacity="0.98"
          />

          {/* Dramatic Light Wash onto Surrounding Wall */}
          <ellipse cx="600" cy="260" rx="140" ry="220" fill="#FF8330" opacity="0.35" filter="url(#glow-spread-lg)" />
        </g>

        {/* 4. Still Reflecting Pool Floor Plane */}
        <g id="water-pool">
          <rect x="0" y="525" width="700" height="225" fill="url(#water-gradient)" />

          {/* Shimmering Fiery Reflection of the Glowing Arch in Water */}
          <polygon
            points="510,528 600,528 640,750 470,750"
            fill="url(#arch-reflection)"
            filter="url(#reflection-blur)"
          />
          {/* Intense Inner Core of Reflection */}
          <polygon
            points="528,528 582,528 610,750 500,750"
            fill="#FF8030"
            opacity="0.55"
            filter="url(#reflection-blur)"
          />
          <polygon
            points="540,528 570,528 585,730 525,730"
            fill="#FFDF9E"
            opacity="0.75"
            filter="url(#glow-spread-md)"
          />

          {/* Subtle Horizontal Ripple Wavelets */}
          {[538, 552, 570, 590, 615, 645, 680, 715].map((ry, i) => (
            <ellipse
              key={i}
              cx={555 + (i % 2 === 0 ? 5 : -5)}
              cy={ry}
              rx={40 + i * 16}
              ry={1.2 + i * 0.4}
              fill="#FFB06B"
              opacity={0.35 - i * 0.03}
            />
          ))}

          {/* Water reflection of the horizon strip */}
          <path
            d="M 40 535 Q 200 538 380 535"
            stroke="#FF4400"
            strokeWidth="2"
            fill="none"
            opacity="0.4"
            filter="url(#glow-spread-md)"
          />
        </g>

        {/* 5. Minimalist Stone Meditation Platform */}
        {/* Cantilevered low circular stone jetty projecting toward the light */}
        <g id="stone-platform">
          {/* Platform Surface */}
          <path
            d="M 485 532 C 485 515, 600 515, 600 532 L 600 562 C 550 568, 510 568, 485 562 Z"
            fill="url(#platform-stone)"
          />
          {/* Platform Rim / Edge Highlight */}
          <path
            d="M 485 532 C 510 528, 575 528, 600 532"
            stroke="#FF9545"
            strokeWidth="1.4"
            fill="none"
            opacity="0.8"
          />
          {/* Platform Vertical Rim */}
          <path
            d="M 485 532 L 485 555 C 520 560, 565 560, 600 555 L 600 532"
            fill="#0F0C0D"
            stroke="#2B2426"
            strokeWidth="0.8"
          />

          {/* Water Reflection of the Stone Platform */}
          <path
            d="M 485 558 C 520 565, 565 565, 600 558 L 590 590 C 560 595, 525 595, 495 590 Z"
            fill="#050405"
            opacity="0.9"
            filter="url(#reflection-blur)"
          />

          {/* Left Foreground Curved Step / Bench */}
          <path
            d="M 0 550 C 15 548, 30 555, 30 640 L 0 640 Z"
            fill="#120E10"
            stroke="#FF551A"
            strokeWidth="1"
            opacity="0.7"
          />
        </g>

        {/* 6. Solitary Figure in Silent Meditation */}
        {/* Seated on the stone platform in front of the radiant light */}
        <g id="meditating-figure">
          {/* Meditator Head */}
          <ellipse cx="538" cy="454" rx="7.5" ry="9" fill="#140D0E" />

          {/* Meditator Torso / Back */}
          <path
            d="M 526 465 C 522 463, 554 463, 550 465 L 553 514 C 545 517, 531 517, 523 514 Z"
            fill="#120B0C"
          />

          {/* Meditator Folded Legs (Cross-legged meditation posture) */}
          <ellipse cx="538" cy="516" rx="22" ry="9" fill="#0F0A0B" />

          {/* Delicate Warm Rim Light on Meditator Contour from the archway */}
          <path
            d="M 545 448 C 547 454, 547 460, 544 463"
            stroke="#FFD59E"
            strokeWidth="1.8"
            fill="none"
            opacity="0.9"
          />
          <path
            d="M 549 466 C 553 480, 553 500, 551 514"
            stroke="#FF9E4A"
            strokeWidth="2"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M 540 522 C 552 522, 558 518, 559 514"
            stroke="#FF8833"
            strokeWidth="1.5"
            fill="none"
            opacity="0.75"
          />

          {/* Water Reflection of the Meditating Silhouette */}
          <g filter="url(#reflection-blur)" opacity="0.8">
            <ellipse cx="538" cy="542" rx="20" ry="7" fill="#080506" />
            <path
              d="M 526 580 C 523 582, 553 582, 550 580 L 553 542 C 545 539, 531 539, 523 542 Z"
              fill="#060304"
            />
            <ellipse cx="538" cy="590" rx="6.5" ry="8" fill="#060304" />
          </g>
        </g>

        {/* 7. Subtle 35mm Editorial Texture */}
        <rect width="700" height="750" filter="url(#pool-grain)" opacity="0.32" />
      </svg>
    </div>
  );
};
