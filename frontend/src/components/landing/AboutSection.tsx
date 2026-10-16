import React from 'react';
import { PipeOrganVisual } from './PipeOrganVisual';
import CaseTraceAnimation from './CaseTraceAnimation';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

interface AboutSectionProps {
  onOpenSanctuary?: () => void;
  onScrollToMeetUs?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenSanctuary, onScrollToMeetUs }) => {
  const { ref, isVisible } = useScrollFadeIn<HTMLElement>({ threshold: 0.1 });

  const handleScrollToMeetUs = () => {
    if (onScrollToMeetUs) {
      onScrollToMeetUs();
      return;
    }
    const target =
      document.getElementById('meet-the-team') ||
      document.getElementById('meet-us') ||
      document.getElementById('team');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section
      ref={ref}
      id="about"
      className={`relative w-full min-h-screen bg-black text-white px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 py-20 sm:py-24 lg:py-32 border-t border-white/10 overflow-hidden select-none z-10 fade-in-section ${
        isVisible ? 'is-visible' : ''
      }`}
    >
      <div className="relative z-10 max-w-[1440px] mx-auto">
        {/* ======================================================== */}
        {/* TOP ROW: LEFT METADATA & RIGHT DISPLAY HEADLINE */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12 sm:mb-16 lg:mb-20">
          {/* Top-Left: ABOUT US Label, Index & Monogram */}
          <div className="lg:col-span-5 scroll-reveal fade-child-1">
            <div className="space-y-1">
              <span className="block text-[11px] sm:text-xs tracking-[0.22em] font-semibold text-white/60 uppercase font-sans">
                ABOUT US
              </span>
              <span className="block text-[11px] sm:text-xs text-white/40 font-mono tracking-widest">
                01 • 05
              </span>
            </div>

            {/* Stylized Monogram Glyph */}
            <div className="mt-8 sm:mt-10">
              <span className="font-sans font-bold text-lg sm:text-xl tracking-[0.08em] text-white inline-flex items-center gap-[1px]">
                <span className="font-light tracking-tighter">/\</span>
                <span>V</span>
              </span>
            </div>
          </div>

          {/* Top-Right: Editorial Display Statement */}
          <div className="lg:col-span-7 scroll-reveal fade-child-2">
            <h2 className="font-editorial font-normal text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[62px] leading-[1.08] tracking-[-0.015em] text-white">
              A forensic system for<br className="hidden sm:inline" />
              connecting the traces<br className="hidden sm:inline" />
              that really matter
            </h2>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN BODY: LEFT COLUMN (ORGAN & PROSE) & RIGHT COLUMN (SANCTUARY ART) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-16 items-start">
          {/* LEFT COLUMN: Pipe Organ Image + Narrative + CTA */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {/* 1. Classical Pipe Organ Monochrome Image */}
            <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] shadow-2xl scroll-reveal fade-child-2">
              <PipeOrganVisual className="w-full h-full" />
            </div>

            {/* 2. Headline: Where evidence, reasoning, and technology meet harmony */}
            <h3 className="font-editorial font-normal text-2xl sm:text-3xl md:text-[34px] leading-[1.16] text-white mt-10 sm:mt-12 max-w-md scroll-reveal fade-child-3">
              Where evidence,<br />
              reasoning, and technology<br />
              meet harmony<br />
            </h3>

            {/* 3. Narrative Paragraphs */}
            <div className="mt-6 sm:mt-7 space-y-4 text-xs sm:text-[13px] md:text-[13.5px] font-sans text-white/70 leading-relaxed max-w-md scroll-reveal fade-child-4">
              <p>
                CaseTrace is an AI-powered digital forensics investigation framework built to turn fragmented digital evidence into an evidence-grounded investigation. It brings files, messages, devices, logs, identities, and events into one connected investigative view.
              </p>
              <p>
                Instead of treating AI as the final authority, CaseTrace keeps the investigator in control, preserving evidence integrity, tracing relationships, surfacing contradictions, and reconstructing timelines while making every conclusion traceable back to its underlying evidence.
              </p>
            </div>

            {/* 4. White Box CTA Button: Know More */}
            <div className="mt-8 sm:mt-10 scroll-reveal fade-child-5">
              <button
                type="button"
                onClick={handleScrollToMeetUs}
                className="bg-white text-black px-5 sm:px-6 py-2 sm:py-2.5 font-editorial italic text-lg sm:text-xl tracking-wide hover:bg-stone-200 active:scale-[0.98] transition-all cursor-pointer shadow-sm inline-block"
              >
                Know More
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: CaseTrace 3D Investigation Animation */}
          <div className="lg:col-span-7 flex justify-end scroll-reveal fade-child-3">
            <div className="w-full max-w-2xl aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] shadow-2xl overflow-hidden">
              <CaseTraceAnimation className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
