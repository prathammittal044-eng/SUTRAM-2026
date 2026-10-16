import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  tag: string;
  bio: string;
  contributions: string[];
  index: string;
  badge: string;
  photoUrl?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'ankit',
    name: 'Ankit Bhadra',
    role: 'Frontend Developer and AIML Engineer',
    photoUrl: '/ankit.jpeg',
    tag: '01',
    bio: 'Usually found building AI stuff, experimenting with random ideas, or breaking the frontend while trying to make it look cooler. For CaseTrace, I am working on bringing AI and digital forensics together to figure out what actually happened when all the evidence is scattered everywhere.',
    contributions: [
      'Designed and implemented the CaseTrace frontend architecture',
      'Architected AIML pipeline for CaseTrace',
      'Deployed and maintained the CaseTrace web application',
    ],
    index: '01',
    badge: 'TEAM LEAD',
  },
  {
    id: 'prateek',
    name: 'Prateek Shrivastava',
    role: 'Backend Developer',
    photoUrl: '/prateek.png',
    tag: '02',
    bio: 'Worked on authentication, authorization, and database management for CaseTrace, ensuring secure and efficient data handling.',
    contributions: [
      'Developed backend services and APIs for CaseTrace',
      'Built and optimized database schemas for evidentiary data',
      'Engineered secure authentication and authorization systems',
    ],
    index: '02',
    badge: 'CORE MEMBER',
  },
  {
    id: 'pratham',
    name: 'Pratham Mittal',
    role: 'Backend Developer',
    photoUrl: '/pratham.png',
    tag: '03',
    bio: 'Worked on the backend infrastructure and core features of CaseTrace, focusing on performance and scalability.',
    contributions: [
      'Crafted the backend architecture for CaseTrace',
      'Implemented core features and services for evidentiary analysis',
      'Authored robust and scalable backend solutions for CaseTrace',
    ],
    index: '03',
    badge: 'CORE MEMBER',
  },
];

export const CaseTraceTeamSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const cardStageRef = useRef<HTMLDivElement>(null);
  const cardElRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const activeIndexRef = useRef<number>(0);

  // Mouse hover tilt state with smooth interpolation (lerp) to prevent jitter/vibration
  const mouseTiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetTiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isHoveringRef = useRef<boolean>(false);
  const currentProgressRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Update card transforms directly via DOM styles for optimal 60/120fps performance
  const updateCardTransforms = useCallback((phase: number, tilt: { x: number; y: number }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024;

    // Corner offset distances
    const waitX = isMobile ? -140 : isTablet ? -240 : -320;
    const waitY = isMobile ? 120 : isTablet ? 170 : 200;
    const departX = isMobile ? 140 : isTablet ? 240 : 320;
    const departY = isMobile ? -120 : isTablet ? -170 : -200;

    TEAM_MEMBERS.forEach((_, cardIdx) => {
      const el = cardElRefs.current[cardIdx];
      if (!el) return;

      // Progressive scroll sequence: 0: Ankit -> 1: Prateek -> 2: Pratham (ends at Pratham)
      const distFromCenter = phase - cardIdx;

      let translateX = 0;
      let translateY = 0;
      let rotateX = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = 20;
      let isCenter = false;

      // Smooth easing function
      const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

      if (distFromCenter < -1.1) {
        // In the waiting queue before arriving at bottom-left corner
        translateX = waitX - 35;
        translateY = waitY + 35;
        rotateX = 85;
        scale = 0.82;
        opacity = 0;
        zIndex = 5;
      } else if (distFromCenter <= -0.5) {
        // Resting / waiting visibly in bottom-left corner facing tilted up in 3D
        const p = Math.max(0, Math.min(1, (distFromCenter - (-1.1)) / 0.6));
        const ep = easeInOut(p);

        translateX = waitX;
        translateY = waitY;
        rotateX = 75 - 10 * ep; // ~65 deg tilt from bottom
        scale = 0.85 + 0.04 * ep;
        opacity = 0.55 + 0.3 * ep;
        zIndex = 10;
      } else if (distFromCenter < 0) {
        // Entering from bottom-left corner to center with 3D tilt-on-entry:
        // Card straightens up smoothly to 0 deg facing straight forward
        const p = (distFromCenter - (-0.5)) / 0.5; // 0 -> 1
        const ep = easeInOut(p);

        translateX = waitX * (1 - ep);
        translateY = waitY * (1 - ep);
        rotateX = 65 * (1 - ep); // 65 deg -> 0 deg (straight face-forward)
        scale = 0.89 + 0.11 * ep;
        opacity = 0.85 + 0.15 * ep;
        zIndex = 20 + Math.round(ep * 10);

        if (distFromCenter > -0.2) {
          isCenter = true;
        }
      } else if (distFromCenter <= 0.4) {
        // Holding dominant in center (horizontal, straight, full scale, interactive)
        translateX = 0;
        translateY = 0;
        rotateX = 0;
        scale = 1.0;
        opacity = 1.0;
        zIndex = 30;
        isCenter = true;
      } else if (distFromCenter <= 1.0) {
        // Departing towards upper-right corner:
        // Card tilts 3D upwards up to ~ -75 degrees
        const p = (distFromCenter - 0.4) / 0.6; // 0 -> 1
        const ep = easeInOut(p);

        translateX = departX * ep;
        translateY = departY * ep;
        rotateX = -75 * ep; // 0 deg -> -75 deg (tilting up towards top)
        scale = 1.0 - 0.14 * ep;
        opacity = 1.0 - 0.35 * ep;
        zIndex = 25 - Math.round(ep * 10);
      } else if (distFromCenter <= 1.5) {
        // Fading out into upper-right distance
        const p = Math.min(1, (distFromCenter - 1.0) / 0.5);
        translateX = departX + 40 * p;
        translateY = departY - 40 * p;
        rotateX = -85;
        scale = 0.86 - 0.08 * p;
        opacity = Math.max(0, 0.65 * (1 - p));
        zIndex = 5;
      } else {
        // Departed completely
        translateX = departX + 60;
        translateY = departY - 60;
        rotateX = -90;
        scale = 0.78;
        opacity = 0;
        zIndex = 2;
      }

      // Add responsive cursor 3D tilt when in center
      // Keep the interactive hit area stable while hovering. The card's
      // pointer-driven tilt could move it out from under the cursor and
      // repeatedly toggle the photo hover state.
      const finalTiltX = rotateX;
      const finalTiltY = 0;

      el.style.transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0) rotateX(${finalTiltX.toFixed(2)}deg) rotateY(${finalTiltY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = `${opacity.toFixed(3)}`;
      el.style.zIndex = `${zIndex}`;
      el.style.pointerEvents = isCenter ? 'auto' : 'none';

      const innerBox = el.querySelector<HTMLDivElement>('.team-card-inner');
      if (innerBox) {
        if (isCenter) {
          innerBox.style.borderColor = 'rgba(255, 255, 255, 0.45)';
          innerBox.style.backgroundColor = '#0D0D0D';
          innerBox.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.95)';
        } else {
          innerBox.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          innerBox.style.backgroundColor = '#070707';
          innerBox.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.75)';
        }
      }
    });
  }, []);

  // Native ScrollTrigger integration: locks section until 1 loop completes, then cleanly unlocks
  useEffect(() => {
    const section = containerRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=1700', // Pinned distance ensures cards transition smoothly until Pratham is reached
        pin: true,
        pinSpacing: true,
        scrub: 0.5,
        fastScrollEnd: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = Math.max(0, Math.min(1, self.progress));
          currentProgressRef.current = progress;
          const phase = progress * 2.3; // Progression through Ankit -> Prateek -> Pratham (ends at Pratham)

          // Determine active member index
          let activeIdx = 0;
          if (phase >= 1.5) {
            activeIdx = 2; // Pratham in center
          } else if (phase >= 0.5) {
            activeIdx = 1; // Prateek in center
          } else {
            activeIdx = 0; // Ankit in center
          }

          if (activeIdx !== activeIndexRef.current) {
            activeIndexRef.current = activeIdx;
            setActiveCardIndex(activeIdx);
          }

          const tilt = isHoveringRef.current ? mouseTiltRef.current : { x: 0, y: 0 };
          updateCardTransforms(phase, tilt);
        },
      });
    }, section);

    // Initial render at progress 0
    updateCardTransforms(0, { x: 0, y: 0 });

    return () => {
      ctx.revert();
    };
  }, [updateCardTransforms]);

  // Smooth tilt interpolation loop (runs via requestAnimationFrame when needed)
  const startTiltAnimationLoop = useCallback(() => {
    if (rafIdRef.current !== null) return;

    const tick = () => {
      // Lerp factor: smooth 0.12 gives an ultra-smooth gliding follow without latency or oscillation
      const lerpFactor = 0.12;
      const dx = targetTiltRef.current.x - mouseTiltRef.current.x;
      const dy = targetTiltRef.current.y - mouseTiltRef.current.y;

      mouseTiltRef.current.x += dx * lerpFactor;
      mouseTiltRef.current.y += dy * lerpFactor;

      const phase = currentProgressRef.current * 2.3;
      updateCardTransforms(phase, mouseTiltRef.current);

      // If difference is tiny and not hovering or settled at 0, stop loop
      if (Math.abs(dx) < 0.02 && Math.abs(dy) < 0.02) {
        mouseTiltRef.current.x = targetTiltRef.current.x;
        mouseTiltRef.current.y = targetTiltRef.current.y;
        updateCardTransforms(phase, mouseTiltRef.current);
        if (!isHoveringRef.current || (targetTiltRef.current.x === 0 && targetTiltRef.current.y === 0)) {
          rafIdRef.current = null;
          return;
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [updateCardTransforms]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Mouse hover tilt calculation for the active center card
  // Using e.currentTarget.getBoundingClientRect() with a center deadzone + smooth clamping
  // prevents micro-jitter / vibrations caused by element tilt shifting under the cursor
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Normalised delta (-1 to 1) clamped to boundaries
    let normX = (x - centerX) / centerX;
    let normY = (y - centerY) / centerY;
    normX = Math.max(-1, Math.min(1, normX));
    normY = Math.max(-1, Math.min(1, normY));

    // Deadzone near exact center to eliminate resting cursor flutter
    if (Math.abs(normX) < 0.03) normX = 0;
    if (Math.abs(normY) < 0.03) normY = 0;

    // Smooth, gentle 3D tilt towards mouse direction:
    // When mouse is top (normY < 0), card tilts towards top (rotateX > 0)
    // When mouse is right (normX > 0), card tilts towards right (rotateY > 0)
    targetTiltRef.current = {
      x: -normY * 5, // subtle tilt on pitch axis
      y: normX * 6,  // subtle tilt on yaw axis
    };

    startTiltAnimationLoop();
  }, [startTiltAnimationLoop]);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isHoveringRef.current = true;
    handleMouseMove(e);
  }, [handleMouseMove]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    targetTiltRef.current = { x: 0, y: 0 };
    startTiltAnimationLoop();
  }, [startTiltAnimationLoop]);

  return (
    <section
      ref={containerRef}
      id="meet-the-team"
      data-testid="meet-the-team"
      className="relative w-full h-screen bg-black text-white flex flex-col justify-between overflow-hidden px-4 sm:px-8 md:px-14 lg:px-20 py-5 sm:py-7 border-t border-white/10 select-none"
    >
      {/* Anchor identifier for existing #team and #meet-us links */}
      <div id="team" className="absolute -top-10 left-0 pointer-events-none" />
      <div id="meet-us" className="absolute -top-10 left-0 pointer-events-none" />

      {/* Ambient Subtle Technical Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* ======================================================== */}
      {/* HEADER: Section index + Centered H2 (Guaranteed gap)    */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full max-w-[1440px] mx-auto flex flex-col items-center text-center pt-2 pb-1">
        {/* Small technical section marker */}
        <div className="flex flex-col items-center space-y-1 mb-1.5">
          <span className="text-[11px] sm:text-xs tracking-[0.24em] font-semibold text-white/60 uppercase font-sans">
            INVESTIGATION CORE
          </span>
          <span className="text-[11px] sm:text-xs text-white/40 font-mono tracking-widest">
            04 · 05
          </span>
        </div>

        {/* Centered H2 with established editorial typography */}
        <h2 className="font-editorial font-normal text-3xl sm:text-4xl md:text-5xl lg:text-[50px] leading-[1.08] tracking-[-0.015em] text-white max-w-2xl text-center">
          Meet Our Team
        </h2>

        <p className="mt-1.5 text-xs sm:text-sm font-sans text-white/45 tracking-wide max-w-md">
          The forensic architects and systems engineers behind CaseTrace.
        </p>
      </div>

      {/* ======================================================== */}
      {/* CARD STAGE: Bounded area ensuring cards never clip header*/}
      {/* ======================================================== */}
      <div
        ref={cardStageRef}
        className="relative z-20 w-full max-w-[1200px] mx-auto flex-1 flex items-center justify-center my-2 overflow-visible"
        style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
      >
        <div
          className="relative w-full h-[330px] sm:h-[350px] md:h-[370px] flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {TEAM_MEMBERS.map((member, index) => {
            return (
              <div
                key={member.id}
                ref={(el) => {
                  cardElRefs.current[index] = el;
                }}
                onMouseMove={index === activeCardIndex ? handleMouseMove : undefined}
                onMouseEnter={index === activeCardIndex ? handleMouseEnter : undefined}
                onMouseLeave={index === activeCardIndex ? handleMouseLeave : undefined}
                className="absolute will-change-transform cursor-pointer"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  willChange: 'transform',
                }}
              >
                {/* ========================================================= */}
                {/* HORIZONTAL CARD DESIGN: Wide landscape dossier layout     */}
                {/* Black & off-white theme, forensic styling, exact content */}
                {/* ========================================================= */}
                <div
                  className="team-card-inner w-[340px] sm:w-[540px] md:w-[640px] lg:w-[720px] bg-[#0A0A0A] border border-white/20 p-4 sm:p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between transition-colors duration-200"
                >
                  {/* Top Technical Header: Index & Badge */}
                  <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10 text-[10px] sm:text-[11px] font-mono tracking-widest">
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF4E18] font-bold">CASETRACE</span>
                      <span className="text-white/30">/</span>
                      <span className="text-white/60">{member.index}</span>
                    </div>
                    <span className="px-2 py-0.5 border border-white/15 bg-white/5 text-[9px] uppercase tracking-wider text-white/70">
                      {member.badge}
                    </span>
                  </div>

                  {/* HORIZONTAL 2-COLUMN BODY */}
                  <div className="my-2.5 sm:my-3.5 flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 md:gap-5">
                    {/* Left Column: Forensic Silhouette Portrait */}
                    <div className="sm:w-5/12 flex-shrink-0 flex flex-col bg-[#050505] border border-white/10 p-2.5 sm:p-3 overflow-hidden">
                      <div className="group relative w-full h-32 sm:h-full min-h-[140px] bg-[#080808] flex items-center justify-center overflow-hidden">
                        {/* Ambient scanlines */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[size:100%_4px] opacity-30 pointer-events-none z-10" />

                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={`${member.name} - ${member.role}`}
                            className="w-full h-full object-cover grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 transition-none"
                            loading="lazy"
                          />
                        ) : (
                          /* Monochrome Vector Silhouette fallback */
                          <svg
                            viewBox="0 0 200 220"
                            className="w-full h-full object-cover"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <linearGradient id={`grad-card-${member.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#2A2A2A" />
                                <stop offset="60%" stopColor="#161616" />
                                <stop offset="100%" stopColor="#0B0B0B" />
                              </linearGradient>
                            </defs>

                            {/* Grid ticks */}
                            <line x1="20" y1="0" x2="20" y2="220" stroke="#FFFFFF" strokeOpacity="0.04" strokeDasharray="2 4" />
                            <line x1="180" y1="0" x2="180" y2="220" stroke="#FFFFFF" strokeOpacity="0.04" strokeDasharray="2 4" />
                            <line x1="0" y1="110" x2="200" y2="110" stroke="#FFFFFF" strokeOpacity="0.03" />

                            {/* Silhouette geometry customized per member */}
                            {index === 0 && (
                              /* Ankit - Lead Systems Architect */
                              <g transform="translate(0, 10)">
                                <path d="M 40 210 Q 65 130 85 115 Q 115 120 145 115 Q 165 130 190 210 Z" fill={`url(#grad-card-${member.id})`} />
                                <circle cx="115" cy="72" r="32" fill="#222222" />
                                <path d="M 85 75 C 85 45 95 38 115 38 C 135 38 145 45 145 75 C 140 60 135 50 115 50 C 95 50 90 60 85 75 Z" fill="#141414" />
                                <path d="M 86 65 Q 86 42 105 38" fill="none" stroke="#909090" strokeWidth="1.2" strokeOpacity="0.7" />
                              </g>
                            )}
                            {index === 1 && (
                              /* Prateek - Principal Evidentiary Graph Engineer */
                              <g transform="translate(0, 10)">
                                <path d="M 35 210 Q 60 125 80 112 Q 115 116 150 112 Q 170 125 195 210 Z" fill={`url(#grad-card-${member.id})`} />
                                <circle cx="115" cy="70" r="34" fill="#232323" />
                                <path d="M 82 62 C 82 40 95 34 115 34 C 135 34 148 40 148 62 C 142 46 130 42 115 42 C 100 42 88 46 82 62 Z" fill="#121212" />
                                <path d="M 148 58 Q 147 38 128 35" fill="none" stroke="#A0A0A0" strokeWidth="1.2" strokeOpacity="0.8" />
                              </g>
                            )}
                            {index === 2 && (
                              /* Pratham - Head of Cognitive Interface & Systems */
                              <g transform="translate(0, 10)">
                                <path d="M 42 210 Q 68 132 88 118 Q 115 122 142 118 Q 162 132 188 210 Z" fill={`url(#grad-card-${member.id})`} />
                                <circle cx="115" cy="74" r="30" fill="#202020" />
                                <path d="M 86 78 C 86 48 97 40 115 40 C 133 40 144 48 144 78 C 140 62 133 52 115 52 C 97 52 90 62 86 78 Z" fill="#151515" />
                                <path d="M 88 68 Q 88 45 106 41" fill="none" stroke="#888888" strokeWidth="1.2" strokeOpacity="0.7" />
                              </g>
                            )}

                            {/* Precision focal target */}
                            <circle cx="115" cy="72" r="1.5" fill="#FF4E18" />
                            <line x1="110" y1="72" x2="120" y2="72" stroke="#FF4E18" strokeWidth="0.5" strokeOpacity="0.8" />
                            <line x1="115" y1="67" x2="115" y2="77" stroke="#FF4E18" strokeWidth="0.5" strokeOpacity="0.8" />
                          </svg>
                        )}

                        {/* Corner markers on photo */}
                        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-white/40" />
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-white/40" />
                        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-white/40" />
                        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-white/40" />
                      </div>
                    </div>

                    {/* Right Column: Member Details & Contributions */}
                    <div className="sm:w-7/12 flex flex-col justify-between">
                      <div>
                        <h3 className="font-editorial font-normal text-xl sm:text-2xl md:text-[26px] text-white leading-tight">
                          {member.name}
                        </h3>
                        <p className="text-xs sm:text-[13px] font-sans font-medium text-white/70 mt-0.5">
                          {member.role}
                        </p>
                        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-sans text-white/50 leading-relaxed">
                          {member.bio}
                        </p>
                      </div>

                      {/* Key Contributions List */}
                      <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-white/10 space-y-1 sm:space-y-1.5">
                        <div className="text-[8px] sm:text-[9px] font-mono tracking-widest text-white/40 uppercase mb-1">
                          KEY SYSTEMS CONTRIBUTION
                        </div>
                        {member.contributions.map((item, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[10px] sm:text-[11px] font-sans text-white/70">
                            <span className="text-[#FF4E18] text-[9px] mt-0.5">▪</span>
                            <span className="leading-tight">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Verification Node */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-end text-[9px] sm:text-[10px] font-mono text-white/40">
                    <span className="text-white/60">NODE · 0{index + 1}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
