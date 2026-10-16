import React from 'react';

/**
 * HeroVisual renders the background artwork matching the reference image:
 * - A close-up editorial portrait of a woman's eyes and face
 * - Natural beauty marks, delicate winged eyeliner, and focused gaze
 * - Hands gently holding delicate pastel pink peonies petals near the chin
 * - Left side: ethereal violet / lavender purple aura glow and haze
 * - Right side: warm peach / sunset golden-orange radiant bloom
 * - Soft cinematic depth of field, delicate diffusion, and subtle film grain
 */
export const HeroVisual: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      <svg
        className="w-full h-full object-cover scale-[1.02]"
        viewBox="0 0 1440 920"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle 35mm Editorial Film Grain Texture */}
          <filter id="veil-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.045 0"
            />
            <feComposite in2="SourceGraphic" in="glare" operator="over" />
          </filter>

          {/* Precision Gaussian Blurs */}
          <filter id="soft-blur-xs" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="soft-blur-sm" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="soft-blur-md" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="soft-blur-lg" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="64" />
          </filter>
          <filter id="petal-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>

          {/* Skin Base Gradient */}
          <radialGradient id="skin-face-radial" cx="50%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#F5DCD0" />
            <stop offset="25%" stopColor="#EDCEBF" />
            <stop offset="55%" stopColor="#E2BEAC" />
            <stop offset="85%" stopColor="#D4A794" />
            <stop offset="100%" stopColor="#BF8E7A" />
          </radialGradient>

          {/* Skin Soft Glow on Forehead & Cheeks */}
          <radialGradient id="skin-highlight" cx="50%" cy="26%" r="28%">
            <stop offset="0%" stopColor="#FFF2EB" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#F7DFD3" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#E2BEAC" stopOpacity="0" />
          </radialGradient>

          {/* Left Violet / Lavender Aura Overlay */}
          <radialGradient id="left-lavender-aura" cx="12%" cy="36%" r="52%">
            <stop offset="0%" stopColor="#766DE8" stopOpacity="0.92" />
            <stop offset="28%" stopColor="#8C83F6" stopOpacity="0.84" />
            <stop offset="58%" stopColor="#A8A1FA" stopOpacity="0.58" />
            <stop offset="85%" stopColor="#C4BFFD" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#8179F0" stopOpacity="0" />
          </radialGradient>

          {/* Left Deep Indigo Haze */}
          <radialGradient id="left-purple-deep" cx="2%" cy="22%" r="42%">
            <stop offset="0%" stopColor="#6357DE" stopOpacity="0.88" />
            <stop offset="50%" stopColor="#7B70E7" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#8178EB" stopOpacity="0" />
          </radialGradient>

          {/* Right Sunset Peach / Orange Aura Overlay */}
          <radialGradient id="right-peach-aura" cx="90%" cy="32%" r="55%">
            <stop offset="0%" stopColor="#F97E40" stopOpacity="0.92" />
            <stop offset="30%" stopColor="#FB995E" stopOpacity="0.78" />
            <stop offset="62%" stopColor="#FDB889" stopOpacity="0.52" />
            <stop offset="88%" stopColor="#FED7BD" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FFA670" stopOpacity="0" />
          </radialGradient>

          {/* Right Golden Amber Radiant Flare */}
          <radialGradient id="right-amber-flare" cx="96%" cy="18%" r="45%">
            <stop offset="0%" stopColor="#F3752A" stopOpacity="0.88" />
            <stop offset="48%" stopColor="#FBA168" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FDBA8C" stopOpacity="0" />
          </radialGradient>

          {/* Eye Iris Gradient */}
          <radialGradient id="iris-gradient" cx="44%" cy="44%" r="50%">
            <stop offset="0%" stopColor="#5D3825" />
            <stop offset="50%" stopColor="#412417" />
            <stop offset="85%" stopColor="#25140D" />
            <stop offset="100%" stopColor="#140804" />
          </radialGradient>

          {/* Petal Colors */}
          <linearGradient id="petal-pink-base" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE2E8" />
            <stop offset="35%" stopColor="#F8A7BE" />
            <stop offset="75%" stopColor="#E5678F" />
            <stop offset="100%" stopColor="#C43B68" />
          </linearGradient>

          <linearGradient id="petal-pink-soft" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF5F7" />
            <stop offset="30%" stopColor="#FAC3D4" />
            <stop offset="70%" stopColor="#ED81A3" />
            <stop offset="100%" stopColor="#D44F7D" />
          </linearGradient>

          <linearGradient id="petal-deep-magenta" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#E65D87" />
            <stop offset="55%" stopColor="#C4325E" />
            <stop offset="100%" stopColor="#94183E" />
          </linearGradient>

          <linearGradient id="petal-cream-frost" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF9FA" />
            <stop offset="40%" stopColor="#FEE2E8" />
            <stop offset="100%" stopColor="#FAB2C6" />
          </linearGradient>

          {/* Hand Skin Tone */}
          <linearGradient id="hand-skin-gradient" x1="25%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%" stopColor="#F3CCA9" />
            <stop offset="45%" stopColor="#E6B99E" />
            <stop offset="100%" stopColor="#C9947D" />
          </linearGradient>
        </defs>

        {/* 1. Base Layer: Underpainting Canvas */}
        <rect width="1440" height="920" fill="#D3ACA0" />

        {/* 2. Soft Background Atmosphere */}
        <g id="ambient-background">
          <ellipse cx="720" cy="400" rx="600" ry="450" fill="#E4C1B0" opacity="0.8" filter="url(#soft-blur-md)" />
          {/* Hair silhouette framing the portrait */}
          <path
            d="M 280 0 Q 320 340 390 500 Q 340 680 310 920 L 1100 920 Q 1070 680 1020 500 Q 1090 340 1130 0 Z"
            fill="#2A1A14"
            opacity="0.88"
            filter="url(#soft-blur-sm)"
          />
          {/* Outer dark hair volume */}
          <path
            d="M 240 0 Q 280 300 350 480 Q 290 660 260 920 L 100 920 L 100 0 Z"
            fill="#1B0F0B"
            opacity="0.85"
            filter="url(#soft-blur-md)"
          />
          <path
            d="M 1200 0 Q 1160 300 1090 480 Q 1150 660 1180 920 L 1340 920 L 1340 0 Z"
            fill="#21120D"
            opacity="0.82"
            filter="url(#soft-blur-md)"
          />
        </g>

        {/* 3. The Face Structure */}
        <g id="face-geometry">
          {/* Main Face Contour Oval */}
          <path
            d="M 470 50 C 530 15, 910 15, 970 50 C 1035 150, 1055 370, 1015 530 C 965 690, 780 770, 720 770 C 660 770, 475 690, 425 530 C 385 370, 405 150, 470 50 Z"
            fill="url(#skin-face-radial)"
          />

          {/* Forehead and Temple Highlights */}
          <ellipse cx="720" cy="250" rx="280" ry="240" fill="url(#skin-highlight)" />
          <ellipse cx="720" cy="110" rx="210" ry="80" fill="#FFF0E6" opacity="0.4" filter="url(#soft-blur-md)" />

          {/* Cheek Contours */}
          <ellipse cx="480" cy="320" rx="100" ry="70" fill="#E8877D" opacity="0.3" filter="url(#soft-blur-md)" />
          <ellipse cx="960" cy="320" rx="100" ry="70" fill="#F08F68" opacity="0.36" filter="url(#soft-blur-md)" />

          {/* Nose Bridge and Shading */}
          <path
            d="M 714 175 Q 712 245 708 295 Q 700 320 695 342 Q 712 352 720 352 Q 728 352 745 342 Q 740 320 732 295 Q 728 245 726 175 Z"
            fill="#C6937C"
            opacity="0.45"
            filter="url(#soft-blur-sm)"
          />
          {/* Nose Tip Specular Highlight */}
          <ellipse cx="720" cy="338" rx="13" ry="9" fill="#FFF2EB" opacity="0.75" filter="url(#soft-blur-xs)" />
          {/* Nostrils */}
          <ellipse cx="704" cy="347" rx="8" ry="4.5" fill="#753F2E" opacity="0.45" />
          <ellipse cx="736" cy="347" rx="8" ry="4.5" fill="#753F2E" opacity="0.45" />
        </g>

        {/* 4. The Left Eye (Viewer's left: woman's right eye, centered around x=545, y=166) */}
        <g id="left-eye" transform="translate(545, 166)">
          {/* Eyebrow Arch */}
          <path
            d="M -78 -24 Q -38 -41 12 -36 Q 48 -29 68 -16 Q 38 -24 -2 -24 Q -44 -22 -78 -24 Z"
            fill="#271813"
            opacity="0.85"
            filter="url(#soft-blur-xs)"
          />
          <path
            d="M -72 -23 Q -35 -38 12 -34 Q 44 -28 62 -16 Q 32 -23 -6 -23 Q -42 -21 -72 -23 Z"
            fill="#150B07"
            opacity="0.8"
          />

          {/* Upper Eyelid Crease (Fold) */}
          <path
            d="M -62 -9 Q -5 -20 52 -9"
            stroke="#8E5440"
            strokeWidth="3.2"
            fill="none"
            opacity="0.55"
            filter="url(#soft-blur-xs)"
          />

          {/* Eye Sclera (Eyeball white) */}
          <path
            d="M -60 4 Q -10 -17 50 2 Q -5 21 -60 4 Z"
            fill="#F6ECE7"
          />
          <path
            d="M -60 4 Q -10 -17 50 2 Q 20 -8 -10 -8 Q -42 -8 -60 4 Z"
            fill="#B99C90"
            opacity="0.45"
          />

          {/* Iris */}
          <circle cx="-5" cy="3" r="18" fill="url(#iris-gradient)" />
          {/* Pupil */}
          <circle cx="-5" cy="3" r="8.5" fill="#0A0402" />
          {/* Iris ring details */}
          <circle cx="-5" cy="3" r="14" stroke="#8A4E33" strokeWidth="1.6" fill="none" opacity="0.65" />
          {/* Catchlight window reflections */}
          <circle cx="-8.5" cy="-1.5" r="3.4" fill="#FFFFFF" opacity="0.96" />
          <circle cx="-2" cy="5.5" r="1.6" fill="#FFFFFF" opacity="0.65" />

          {/* Upper Lash Line with Winged Liner */}
          <path
            d="M -64 4 Q -25 -15 38 -3 Q 50 -1 58 -5 Q 50 3 36 0 Q -20 -9 -60 4 Z"
            fill="#140905"
          />
          {/* Feathered Eyelashes */}
          <path
            d="M -32 -11 Q -35 -19 -40 -22 M -14 -14 Q -14 -22 -16 -26 M 6 -12 Q 10 -20 12 -24 M 26 -8 Q 33 -16 40 -17 M 42 -4 Q 50 -11 57 -11"
            stroke="#120804"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Lower Lash Line */}
          <path
            d="M -54 6 Q -10 18 42 4"
            stroke="#5D3323"
            strokeWidth="1.8"
            fill="none"
            opacity="0.6"
          />

          {/* Delicate Beauty Mark / Freckle under the inner corner */}
          <circle cx="-16" cy="38" r="1.6" fill="#42251B" opacity="0.75" />
          <circle cx="-28" cy="54" r="1.2" fill="#5A3428" opacity="0.6" />
        </g>

        {/* 5. The Right Eye (Viewer's right: woman's left eye, centered around x=895, y=166) */}
        <g id="right-eye" transform="translate(895, 166)">
          {/* Eyebrow Arch */}
          <path
            d="M -68 -16 Q -48 -29 -12 -36 Q 38 -41 78 -24 Q 44 -22 2 -24 Q -38 -24 -68 -16 Z"
            fill="#271813"
            opacity="0.85"
            filter="url(#soft-blur-xs)"
          />
          <path
            d="M -62 -16 Q -44 -28 -12 -34 Q 35 -38 72 -23 Q 42 -21 6 -23 Q -32 -23 -62 -16 Z"
            fill="#150B07"
            opacity="0.8"
          />

          {/* Upper Eyelid Crease */}
          <path
            d="M -52 -9 Q 5 -20 62 -9"
            stroke="#8E5440"
            strokeWidth="3.2"
            fill="none"
            opacity="0.55"
            filter="url(#soft-blur-xs)"
          />

          {/* Eye Sclera */}
          <path
            d="M -50 2 Q 10 -17 60 4 Q 5 21 -50 2 Z"
            fill="#F6ECE7"
          />
          <path
            d="M -50 2 Q 10 -17 60 4 Q 42 -8 10 -8 Q -20 -8 -50 2 Z"
            fill="#B99C90"
            opacity="0.45"
          />

          {/* Iris */}
          <circle cx="5" cy="3" r="18" fill="url(#iris-gradient)" />
          {/* Pupil */}
          <circle cx="5" cy="3" r="8.5" fill="#0A0402" />
          {/* Iris details */}
          <circle cx="5" cy="3" r="14" stroke="#8A4E33" strokeWidth="1.6" fill="none" opacity="0.65" />
          {/* Catchlight reflections */}
          <circle cx="1.5" cy="-1.5" r="3.4" fill="#FFFFFF" opacity="0.96" />
          <circle cx="8" cy="5.5" r="1.6" fill="#FFFFFF" opacity="0.65" />

          {/* Upper Lash Line with Winged Liner */}
          <path
            d="M -36 0 Q 20 -9 60 4 Q 64 4 50 3 Q -38 -3 -50 -1 Q -58 -5 -50 3 Z"
            fill="#140905"
          />
          <path
            d="M -58 -5 Q -50 -1 -38 -3 Q 25 -15 64 4 Q 60 4 20 -9 Q -36 0 -50 3 Z"
            fill="#140905"
          />
          {/* Eyelashes */}
          <path
            d="M -42 -4 Q -50 -11 -57 -11 M -26 -8 Q -33 -16 -40 -17 M -6 -12 Q -10 -20 -12 -24 M 14 -14 Q 14 -22 16 -26 M 32 -11 Q 35 -19 40 -22"
            stroke="#120804"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Lower Lash Line */}
          <path
            d="M -42 4 Q 10 18 54 6"
            stroke="#5D3323"
            strokeWidth="1.8"
            fill="none"
            opacity="0.6"
          />

          {/* Subtle beauty mark near cheekbone */}
          <circle cx="34" cy="46" r="1.4" fill="#4B281E" opacity="0.65" />
        </g>

        {/* 6. Lips (softly blurred behind the lower bouquet/hands) */}
        <g id="lips" filter="url(#soft-blur-sm)">
          <ellipse cx="720" cy="455" rx="44" ry="22" fill="#C25363" opacity="0.75" />
          <path
            d="M 682 455 Q 720 468 758 455"
            stroke="#631725"
            strokeWidth="2.5"
            fill="none"
            opacity="0.65"
          />
          <ellipse cx="720" cy="470" rx="38" ry="16" fill="#D66879" opacity="0.68" />
        </g>

        {/* 7. Hands Cupped in Front of Lower Face & Chin */}
        <g id="hands-and-arms">
          {/* Left Forearm / Wrist rising up */}
          <path
            d="M 350 900 C 365 770, 415 620, 495 515 C 525 475, 585 485, 615 535 C 595 615, 515 745, 485 900 Z"
            fill="url(#hand-skin-gradient)"
            filter="url(#soft-blur-xs)"
            opacity="0.92"
          />
          {/* Left Hand Fingers holding flowers */}
          <path
            d="M 515 495 C 535 455, 575 435, 615 455 C 605 495, 575 515, 535 515 Z"
            fill="#EDBEAB"
            opacity="0.88"
          />
          <path
            d="M 545 510 C 570 475, 615 465, 655 490 C 635 530, 595 540, 565 535 Z"
            fill="#E5B29F"
            opacity="0.88"
          />

          {/* Right Forearm / Wrist */}
          <path
            d="M 1090 900 C 1075 770, 1025 620, 945 515 C 915 475, 855 485, 825 535 C 845 615, 925 745, 955 900 Z"
            fill="url(#hand-skin-gradient)"
            filter="url(#soft-blur-xs)"
            opacity="0.92"
          />
          {/* Right Hand Fingers */}
          <path
            d="M 925 495 C 905 455, 865 435, 825 455 C 835 495, 865 515, 905 515 Z"
            fill="#F2C7B4"
            opacity="0.88"
          />
        </g>

        {/* 8. Lush Peonies & Carnations Flowers Bouquet */}
        <g id="flower-blossoms" filter="url(#petal-blur)">
          {/* Deep Core Shadows */}
          <path
            d="M 530 550 C 570 475, 675 455, 720 520 C 765 455, 870 475, 910 550 C 890 665, 785 735, 720 715 C 655 735, 550 665, 530 550 Z"
            fill="url(#petal-deep-magenta)"
            opacity="0.92"
          />

          {/* Ruffled Peony Petal Clusters */}
          {/* Far Left Petal Flange */}
          <path
            d="M 490 530 C 460 465, 535 415, 605 455 C 645 475, 625 560, 555 560 C 515 560, 500 540, 490 530 Z"
            fill="url(#petal-pink-base)"
          />
          {/* Upper Left Petal Wave */}
          <path
            d="M 530 450 C 560 385, 635 405, 665 460 C 645 500, 580 500, 550 480 Z"
            fill="url(#petal-cream-frost)"
            opacity="0.95"
          />

          {/* Center-Left Ruffled Petal Rosette */}
          <path
            d="M 590 500 C 610 415, 715 425, 730 500 C 715 545, 645 555, 605 520 Z"
            fill="url(#petal-pink-soft)"
          />
          {/* Center Top Delicate White-Pink Fold */}
          <path
            d="M 650 460 C 685 405, 755 405, 785 460 C 765 500, 700 510, 660 480 Z"
            fill="url(#petal-cream-frost)"
          />

          {/* Center-Right Ruffled Bloom */}
          <path
            d="M 715 480 C 755 415, 845 425, 860 510 C 825 560, 745 550, 725 500 Z"
            fill="url(#petal-pink-base)"
          />
          {/* Right Top Curl */}
          <path
            d="M 775 450 C 815 395, 885 415, 905 480 C 875 520, 810 510, 780 470 Z"
            fill="url(#petal-pink-soft)"
          />
          {/* Far Right Petal Flange */}
          <path
            d="M 845 500 C 905 455, 965 510, 935 580 C 885 615, 835 575, 845 510 Z"
            fill="url(#petal-pink-base)"
          />

          {/* Mid-Lower Cascading Peony Petals */}
          <path
            d="M 570 550 C 615 495, 695 520, 705 580 C 665 635, 595 625, 570 570 Z"
            fill="url(#petal-pink-soft)"
          />
          <path
            d="M 670 560 C 715 505, 795 520, 815 590 C 775 645, 700 645, 680 580 Z"
            fill="url(#petal-cream-frost)"
            opacity="0.92"
          />

          {/* Bottom Petals cupped in palms */}
          <path
            d="M 510 610 C 550 565, 635 600, 625 670 C 570 705, 510 675, 510 610 Z"
            fill="url(#petal-pink-base)"
            opacity="0.88"
          />
          <path
            d="M 610 650 C 670 600, 765 610, 775 690 C 715 735, 630 725, 610 660 Z"
            fill="url(#petal-pink-soft)"
            opacity="0.9"
          />
          <path
            d="M 750 630 C 815 585, 895 620, 885 700 C 825 745, 760 710, 750 640 Z"
            fill="url(#petal-pink-base)"
            opacity="0.88"
          />

          {/* Delicate Crisp Petal Edge Highlights */}
          <path
            d="M 555 470 C 585 425, 635 435, 660 475"
            stroke="#FFF8FB"
            strokeWidth="3.2"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 665 455 C 700 420, 760 425, 780 460"
            stroke="#FFF8FB"
            strokeWidth="3.2"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 785 465 C 825 425, 880 445, 900 480"
            stroke="#FFF8FB"
            strokeWidth="3"
            fill="none"
            opacity="0.75"
          />
        </g>

        {/* 9. Soft Focus Chin & Foreground Hands Blur */}
        <g id="foreground-bokeh" filter="url(#soft-blur-md)">
          <ellipse cx="720" cy="740" rx="190" ry="110" fill="#E4AF9D" opacity="0.65" />
          <ellipse cx="630" cy="770" rx="150" ry="85" fill="#ECA2B3" opacity="0.55" />
          <ellipse cx="810" cy="770" rx="150" ry="85" fill="#EE998C" opacity="0.58" />
        </g>

        {/* ======================================================== */}
        {/* 10. THE EXACT DUAL ATMOSPHERIC LIGHTING OVERLAYS */}
        {/* ======================================================== */}

        {/* LEFT ATMOSPHERE: Ethereal Violet / Lavender / Periwinkle Haze */}
        <rect
          x="0"
          y="0"
          width="760"
          height="920"
          fill="url(#left-lavender-aura)"
          style={{ mixBlendMode: 'screen' }}
        />
        <circle
          cx="110"
          cy="310"
          r="500"
          fill="url(#left-purple-deep)"
          style={{ mixBlendMode: 'hard-light' }}
          opacity="0.68"
        />
        <ellipse
          cx="70"
          cy="110"
          rx="400"
          ry="330"
          fill="#837AF0"
          opacity="0.48"
          filter="url(#soft-blur-lg)"
        />
        <ellipse
          cx="270"
          cy="410"
          rx="350"
          ry="410"
          fill="#9D95FB"
          opacity="0.42"
          filter="url(#soft-blur-lg)"
        />

        {/* RIGHT ATMOSPHERE: Radiant Warm Peach / Coral / Sunset Orange Bloom */}
        <rect
          x="680"
          y="0"
          width="760"
          height="920"
          fill="url(#right-peach-aura)"
          style={{ mixBlendMode: 'screen' }}
        />
        <circle
          cx="1360"
          cy="250"
          r="540"
          fill="url(#right-amber-flare)"
          style={{ mixBlendMode: 'soft-light' }}
          opacity="0.82"
        />
        <ellipse
          cx="1390"
          cy="150"
          rx="460"
          ry="390"
          fill="#FB923C"
          opacity="0.52"
          filter="url(#soft-blur-lg)"
        />
        <ellipse
          cx="1170"
          cy="390"
          rx="380"
          ry="430"
          fill="#FDA169"
          opacity="0.4"
          filter="url(#soft-blur-lg)"
        />

        {/* Center Soft Dreamy Radiance Diffusion */}
        <radialGradient id="center-soft-veil" cx="50%" cy="46%" r="44%">
          <stop offset="0%" stopColor="#FFF4ED" stopOpacity="0.25" />
          <stop offset="65%" stopColor="#FFEBE2" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <rect
          x="180"
          y="80"
          width="1080"
          height="740"
          fill="url(#center-soft-veil)"
          style={{ mixBlendMode: 'soft-light' }}
        />

        {/* 11. Authentic Fine Editorial Film Grain Overlay */}
        <rect
          width="1440"
          height="920"
          filter="url(#veil-grain)"
          opacity="0.45"
        />
      </svg>
    </div>
  );
};
