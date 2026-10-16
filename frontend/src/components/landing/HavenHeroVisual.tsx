import React from 'react';

/**
 * HavenHeroVisual renders the architectural and cinematic scene:
 * - Monumental glowing vermilion / orange staircase leading upwards into the radiant light portal
 * - A lone silhouetted figure climbing towards the doorway of light
 * - Volumetric white/grey clouds and mystical mist rolling around the stairs and lower left
 * - Towering dark monumental architectural monolith walls
 * - Brilliant white light doorway casting warm golden light down the stairs
 */
export const HavenHeroVisual: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      <svg
        className="w-full h-full object-cover scale-[1.01]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle Film Grain */}
          <filter id="haven-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.04 0"
            />
            <feComposite in2="SourceGraphic" in="glare" operator="over" />
          </filter>

          {/* Precision Gaussian Blurs */}
          <filter id="mist-blur-lg" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="36" />
          </filter>
          <filter id="mist-blur-md" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="portal-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <filter id="portal-flare" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="80" />
          </filter>
          <filter id="silhouette-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>

          {/* Gradients */}
          {/* Sky / Deep Arch Wall Gradient */}
          <linearGradient id="bg-walls" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B1113" />
            <stop offset="40%" stopColor="#2A1616" />
            <stop offset="70%" stopColor="#481814" />
            <stop offset="100%" stopColor="#1E0E10" />
          </linearGradient>

          {/* Massive Orange Staircase Gradient */}
          <linearGradient id="stair-run-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFA153" />
            <stop offset="15%" stopColor="#FF6825" />
            <stop offset="50%" stopColor="#F54917" />
            <stop offset="85%" stopColor="#E2380E" />
            <stop offset="100%" stopColor="#C42805" />
          </linearGradient>

          {/* Step Tread Highlight Gradient */}
          <linearGradient id="step-tread-light" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF7738" />
            <stop offset="40%" stopColor="#FF551D" />
            <stop offset="100%" stopColor="#DE3408" />
          </linearGradient>

          {/* Step Riser Shadow Gradient */}
          <linearGradient id="step-riser-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A82506" />
            <stop offset="100%" stopColor="#781602" />
          </linearGradient>

          {/* Portal Radiant Halo */}
          <radialGradient id="portal-halo" cx="69%" cy="9%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="10%" stopColor="#FFF1D6" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#FFA64D" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FF5C1C" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#DF380C" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Volumetric Ray from Doorway down the stairs */}
          <linearGradient id="volumetric-ray" x1="69%" y1="0%" x2="55%" y2="100%">
            <stop offset="0%" stopColor="#FFECCC" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#FFA858" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#FF6622" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF4A15" stopOpacity="0" />
          </linearGradient>

          {/* Mist / Fog Gradient */}
          <radialGradient id="mist-puff" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#E6DEE0" stopOpacity="0.6" />
            <stop offset="75%" stopColor="#C4B8BA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8A7A7C" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="mist-puff-warm" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE8DD" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#E5C7BE" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#C8A59B" stopOpacity="0" />
          </radialGradient>

          {/* Left Wall Shadow Depth */}
          <linearGradient id="left-wall-shade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D0709" />
            <stop offset="60%" stopColor="#1E1013" />
            <stop offset="100%" stopColor="#3A1716" />
          </linearGradient>

          {/* Right Wall Warm Illumination */}
          <linearGradient id="right-wall-light" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6624" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#8C240E" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2E0E0B" />
          </linearGradient>
        </defs>

        {/* 1. Base Layer: Dark Monumental Space */}
        <rect width="1440" height="900" fill="url(#bg-walls)" />

        {/* 2. Massive Architectural Wall Flanks */}
        {/* Left Monumental Flank */}
        <polygon
          points="0,0 480,0 350,900 0,900"
          fill="url(#left-wall-shade)"
        />
        {/* Right Monumental Flank */}
        <polygon
          points="1070,0 1440,0 1440,900 1280,900"
          fill="url(#right-wall-light)"
        />

        {/* 3. The Great Glowing Orange Stairway */}
        {/* Staircase Base Polygon (Receding to top portal at x=915, y=140) */}
        <g id="staircase">
          {/* Main staircase bed */}
          <polygon
            points="310,900 240,980 1480,980 1440,780 1260,480 1070,140 915,140 600,480"
            fill="url(#stair-run-gradient)"
          />

          {/* Render Individual Horizontal Steps with Precise Perspective */}
          {/* From top (step 0 near portal) to bottom (step 34 in foreground) */}
          {[
            { y: 142, h: 4, l: 915, r: 1070, riserH: 2 },
            { y: 148, h: 5, l: 902, r: 1078, riserH: 3 },
            { y: 156, h: 6, l: 888, r: 1088, riserH: 3 },
            { y: 165, h: 7, l: 873, r: 1099, riserH: 4 },
            { y: 176, h: 8, l: 856, r: 1111, riserH: 4 },
            { y: 188, h: 9, l: 838, r: 1124, riserH: 5 },
            { y: 202, h: 10, l: 818, r: 1138, riserH: 5 },
            { y: 217, h: 11, l: 796, r: 1153, riserH: 6 },
            { y: 234, h: 12, l: 772, r: 1169, riserH: 6 },
            { y: 252, h: 13, l: 746, r: 1186, riserH: 7 },
            { y: 272, h: 14, l: 718, r: 1204, riserH: 7 },
            { y: 294, h: 15, l: 688, r: 1223, riserH: 8 },
            { y: 318, h: 17, l: 655, r: 1243, riserH: 8 },
            { y: 344, h: 18, l: 620, r: 1264, riserH: 9 },
            { y: 372, h: 20, l: 582, r: 1286, riserH: 10 },
            { y: 402, h: 22, l: 541, r: 1309, riserH: 10 },
            { y: 435, h: 24, l: 497, r: 1333, riserH: 11 },
            { y: 470, h: 26, l: 450, r: 1358, riserH: 12 },
            { y: 508, h: 28, l: 400, r: 1384, riserH: 13 },
            { y: 548, h: 30, l: 347, r: 1411, riserH: 14 },
            { y: 591, h: 33, l: 290, r: 1439, riserH: 15 },
            { y: 637, h: 36, l: 230, r: 1468, riserH: 16 },
            { y: 686, h: 39, l: 166, r: 1498, riserH: 17 },
            { y: 738, h: 42, l: 98,  r: 1529, riserH: 18 },
            { y: 793, h: 46, l: 26,  r: 1561, riserH: 20 },
            { y: 852, h: 50, l: -50, r: 1594, riserH: 22 },
          ].map((st, i) => (
            <g key={i}>
              {/* Step Tread (Horizontal Illuminated Surface) */}
              <polygon
                points={`${st.l},${st.y} ${st.r},${st.y} ${st.r + (st.r - st.l) * 0.02},${st.y + st.h} ${st.l - (st.r - st.l) * 0.02},${st.y + st.h}`}
                fill={i < 4 ? '#FFAE68' : i < 10 ? '#FF7A30' : i < 18 ? '#F5511B' : '#E83E0E'}
              />
              {/* Step Edge Highlight Line */}
              <line
                x1={st.l}
                y1={st.y}
                x2={st.r}
                y2={st.y}
                stroke={i < 6 ? '#FFF1D6' : '#FF9955'}
                strokeWidth={i < 10 ? 1.2 : 1.8}
                opacity={0.85}
              />
              {/* Step Vertical Riser (Drop Shadow Surface) */}
              <polygon
                points={`${st.l - (st.r - st.l) * 0.02},${st.y + st.h} ${st.r + (st.r - st.l) * 0.02},${st.y + st.h} ${st.r + (st.r - st.l) * 0.02},${st.y + st.h + st.riserH} ${st.l - (st.r - st.l) * 0.02},${st.y + st.h + st.riserH}`}
                fill="#941E04"
                opacity={0.92}
              />
            </g>
          ))}
        </g>

        {/* 4. The Grand Doorway Portal of Pure White Light */}
        <g id="light-portal">
          {/* Intense Outer Warm Radiance Bloom */}
          <circle
            cx="990"
            cy="70"
            r="480"
            fill="url(#portal-halo)"
            filter="url(#portal-flare)"
          />
          {/* Inner Golden Aura */}
          <ellipse
            cx="990"
            cy="75"
            rx="240"
            ry="200"
            fill="#FFAA4D"
            filter="url(#portal-glow)"
            opacity="0.9"
          />

          {/* The Pure White Radiant Rectangular Doorway */}
          <rect
            x="915"
            y="-40"
            width="155"
            height="182"
            fill="#FFFFFF"
            filter="url(#portal-glow)"
            opacity="0.95"
          />
          <rect
            x="918"
            y="-35"
            width="149"
            height="176"
            fill="#FFFFFF"
          />

          {/* Volumetric Light Beam spilling down the stairway */}
          <polygon
            points="918,140 1067,140 1200,680 720,680"
            fill="url(#volumetric-ray)"
            style={{ mixBlendMode: 'screen' }}
          />
        </g>

        {/* 5. The Silhouetted Figure (Ascending the stairs towards the light) */}
        {/* Positioned around x=990, y=308 to 440 */}
        <g id="figure-silhouette" filter="url(#silhouette-soft)">
          {/* Head & Neck */}
          <ellipse cx="986" cy="318" rx="13" ry="16" fill="#1C0E10" />

          {/* Torso / Jacket Back */}
          <path
            d="M 964 336 C 962 334, 1010 334, 1008 336 L 1014 416 C 1005 422, 967 422, 958 416 Z"
            fill="#1E1012"
          />

          {/* Left Arm / Shoulder */}
          <path
            d="M 964 338 C 952 355, 950 388, 955 418 C 958 420, 966 414, 964 402 C 960 380, 962 356, 968 342 Z"
            fill="#231315"
          />

          {/* Right Arm / Shoulder */}
          <path
            d="M 1008 338 C 1020 355, 1022 388, 1017 418 C 1014 420, 1006 414, 1008 402 C 1012 380, 1010 356, 1004 342 Z"
            fill="#231315"
          />

          {/* Left Leg (Stepping forward / ascending) */}
          <path
            d="M 966 416 C 964 435, 968 472, 974 502 L 986 502 C 980 472, 978 435, 980 416 Z"
            fill="#180C0E"
          />

          {/* Right Leg (Grounding on step) */}
          <path
            d="M 994 416 C 992 438, 996 468, 1004 496 L 1016 496 C 1008 468, 1006 438, 1004 416 Z"
            fill="#180C0E"
          />

          {/* Warm Rim Light on Shoulders and Hair from Doorway */}
          <path
            d="M 973 306 Q 986 303 999 306"
            stroke="#FFE1B8"
            strokeWidth="2.5"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M 962 338 Q 986 332 1010 338"
            stroke="#FFB67D"
            strokeWidth="2.2"
            fill="none"
            opacity="0.8"
          />
        </g>

        {/* 6. Volumetric Billowing Fog & Rolling Clouds */}
        {/* Dense mist swirling over the left side and around the stairway base */}
        <g id="clouds-and-mist">
          {/* Deep lower mist bed across the base */}
          <ellipse
            cx="240"
            cy="520"
            rx="380"
            ry="240"
            fill="url(#mist-puff)"
            filter="url(#mist-blur-lg)"
            opacity="0.92"
          />
          <ellipse
            cx="480"
            cy="460"
            rx="320"
            ry="200"
            fill="url(#mist-puff)"
            filter="url(#mist-blur-lg)"
            opacity="0.85"
          />

          {/* Cloud Billow 1: Middle Left Cloud Layer */}
          <circle
            cx="140"
            cy="420"
            r="260"
            fill="#ECE4E6"
            filter="url(#mist-blur-lg)"
            opacity="0.8"
          />
          <circle
            cx="280"
            cy="400"
            r="210"
            fill="#F6EFF1"
            filter="url(#mist-blur-md)"
            opacity="0.85"
          />
          <circle
            cx="410"
            cy="360"
            r="170"
            fill="#F0E8EA"
            filter="url(#mist-blur-md)"
            opacity="0.75"
          />

          {/* Cloud Billow 2: Swirling across the mid-stairs */}
          <ellipse
            cx="540"
            cy="340"
            rx="240"
            ry="140"
            fill="url(#mist-puff-warm)"
            filter="url(#mist-blur-md)"
            opacity="0.65"
          />
          <ellipse
            cx="700"
            cy="380"
            rx="180"
            ry="110"
            fill="url(#mist-puff-warm)"
            filter="url(#mist-blur-md)"
            opacity="0.55"
          />

          {/* Lower Left Cloud Mass (Behind the headline text) */}
          <circle
            cx="80"
            cy="680"
            r="280"
            fill="#DCD2D5"
            filter="url(#mist-blur-lg)"
            opacity="0.88"
          />
          <ellipse
            cx="320"
            cy="720"
            rx="340"
            ry="200"
            fill="#EBE1E4"
            filter="url(#mist-blur-lg)"
            opacity="0.8"
          />

          {/* Right stairs ethereal cloud wisps */}
          <ellipse
            cx="1280"
            cy="460"
            rx="260"
            ry="160"
            fill="url(#mist-puff-warm)"
            filter="url(#mist-blur-lg)"
            opacity="0.5"
          />
          <ellipse
            cx="1180"
            cy="320"
            rx="160"
            ry="120"
            fill="#FFD2B8"
            filter="url(#mist-blur-lg)"
            opacity="0.38"
          />

          {/* Subtle mist wisps drifting right in front of the steps */}
          <path
            d="M 380 440 Q 560 410 740 430 Q 920 450 1100 420"
            stroke="#FFE4D6"
            strokeWidth="45"
            strokeLinecap="round"
            fill="none"
            filter="url(#mist-blur-lg)"
            opacity="0.35"
          />
          <path
            d="M 240 560 Q 480 520 720 540 Q 960 560 1200 530"
            stroke="#FFFFFF"
            strokeWidth="60"
            strokeLinecap="round"
            fill="none"
            filter="url(#mist-blur-lg)"
            opacity="0.4"
          />
        </g>

        {/* 7. Atmosphere & Authentic 35mm Editorial Grain Texture */}
        <rect
          width="1440"
          height="900"
          filter="url(#haven-grain)"
          opacity="0.35"
        />
      </svg>
    </div>
  );
};
