import React from 'react';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

// Configurable video source - replace this URL or pass `demoVideoUrl` prop to load the walkthrough video
const DEFAULT_DEMO_VIDEO_URL = '';

interface CaseTraceDemoVideoProps {
  src?: string;
  className?: string;
}

/**
 * Embedded or placeholder video player styled specifically for the CaseTrace forensic visual language.
 */
export const CaseTraceDemoVideo: React.FC<CaseTraceDemoVideoProps> = ({
  src = DEFAULT_DEMO_VIDEO_URL,
  className = '',
}) => {
  const hasVideo = Boolean(src && src.trim().length > 0);

  return (
    <div
      className={`relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#070707] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center select-none ${className}`}
    >
      {/* Subtle corner technical brackets */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-white/20 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-white/20 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-white/20 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-white/20 pointer-events-none" />

      {hasVideo ? (
        <video
          src={src}
          controls
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-contain bg-black"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center px-6 py-8 space-y-3">
          {/* Subtle minimal play glyph */}
          <div className="w-12 h-12 rounded-full border border-white/15 bg-white/[0.02] flex items-center justify-center text-white/40 mb-1">
            <svg
              className="w-4 h-4 translate-x-0.5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          <span className="text-[11px] sm:text-xs tracking-[0.24em] font-sans font-medium text-white/70 uppercase">
            DEMO VIDEO
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-white/35 uppercase">
            VIDEO COMING SOON
          </span>
        </div>
      )}
    </div>
  );
};

interface CaseTraceDemoSectionProps {
  demoVideoUrl?: string;
}

export const CaseTraceDemoSection: React.FC<CaseTraceDemoSectionProps> = ({
  demoVideoUrl = DEFAULT_DEMO_VIDEO_URL,
}) => {
  const { ref, isVisible } = useScrollFadeIn<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      id="demo"
      aria-label="CaseTrace Product Demonstration"
      className={`relative w-full min-h-screen bg-black text-white px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 py-20 sm:py-24 lg:py-32 border-t border-white/10 overflow-hidden select-none z-10 fade-in-section ${
        isVisible ? 'is-visible' : ''
      }`}
    >
      <div className="relative z-10 max-w-[1440px] mx-auto">
        {/* ======================================================== */}
        {/* TOP METADATA ROW (Consistent with Section 2) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-10 sm:mb-14 lg:mb-16 scroll-reveal fade-child-1">
          <div className="lg:col-span-12 flex items-center justify-between">
            {/* Section Numbering & Label */}
            <div className="space-y-1">
              <span className="block text-[11px] sm:text-xs tracking-[0.22em] font-semibold text-white/60 uppercase font-sans">
                PRODUCT WALKTHROUGH
              </span>
              <span className="block text-[11px] sm:text-xs text-white/40 font-mono tracking-widest">
                03 · 05
              </span>
            </div>

            {/* Subtle technical status indicator */}
            <div className="hidden sm:flex items-center gap-2.5 text-white/40 font-mono text-[11px] tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E18]" />
              <span>RECORDED DEMO</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN BODY: TWO-COLUMN LAYOUT WITH REVERSED VISUAL EMPHASIS */}
        {/* LEFT: Large rectangular demo-video container */}
        {/* RIGHT: Heading + supporting text */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-16 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Large rectangular demo-video container */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            {/* Video Player / Placeholder */}
            <div className="scroll-reveal fade-child-2">
              <CaseTraceDemoVideo src={demoVideoUrl} />
            </div>

            {/* Microcopy below video */}
            <p className="mt-4 font-editorial italic text-sm sm:text-base text-white/50 tracking-wide select-none scroll-reveal fade-child-3">
              See how the traces come together.
            </p>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Heading + supporting text */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {/* Major Heading (H2) matching Section 2's typography */}
            <h2 className="font-editorial font-normal text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[58px] leading-[1.08] tracking-[-0.015em] text-white scroll-reveal fade-child-2">
              A simple walkthrough,<br className="hidden sm:inline" />
              straight from the creators.
            </h2>

            {/* Subheading / Intro */}
            <h3 className="font-editorial font-normal text-2xl sm:text-3xl md:text-[34px] leading-[1.16] text-white mt-8 sm:mt-10 lg:mt-12 scroll-reveal fade-child-3">
              See CaseTrace in action.
            </h3>

            {/* Supporting Body Paragraphs */}
            <div className="mt-6 sm:mt-7 space-y-4 text-xs sm:text-[13px] md:text-[13.5px] font-sans text-white/70 leading-relaxed max-w-lg scroll-reveal fade-child-4">
              <p>
                Digital evidence can be scattered across devices, files, messages, logs, and timelines. CaseTrace brings those fragments together into a connected investigation, helping investigators trace relationships, verify evidence, surface contradictions, and reconstruct what happened.
              </p>
              <p className="text-white/45 pt-1">
                This is a walkthrough of the system, built and presented by its creators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
