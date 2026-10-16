'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Briefcase, Scale, ArrowRight, Lock } from 'lucide-react';
import { CaseTraceLogo } from '@/components/landing/CaseTraceLogo';
import { SanctuaryModal } from '@/components/landing/SanctuaryModal';
import { NavInfoModal } from '@/components/landing/NavInfoModal';
import { AboutSection } from '@/components/landing/AboutSection';
import { CaseTraceDemoSection } from '@/components/landing/CaseTraceDemoSection';
import { CaseTraceTeamSection } from '@/components/landing/CaseTraceTeamSection';
import { CaseTraceTerminalSection } from '@/components/landing/CaseTraceTerminalSection';
import { CaseTraceFooter } from '@/components/landing/CaseTraceFooter';
import { LoginModal } from '@/components/landing/LoginModal';
import { toggleHavenAudio } from '@/utils/ambientAudio';
import { useScrollRevealAll } from '@/hooks/useScrollFadeIn';

export default function LandingPage() {
  useScrollRevealAll();
  const router = useRouter();

  const [isSoundOn, setIsSoundOn] = useState<boolean>(false);
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [selectedNavSection, setSelectedNavSection] = useState<string | null>(null);

  const handleSoundToggle = () => {
    const nextState = !isSoundOn;
    toggleHavenAudio(nextState);
    setIsSoundOn(nextState);
  };

  const navLinks = [
    { label: 'About', target: 'about' },
    { label: 'Demo', target: 'demo' },
    { label: 'Cases', href: '/cases' },
    { label: 'Audit Trail', href: '/audit' },
    { label: 'Contact', target: 'terminal' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-x-hidden font-sans antialiased selection:bg-[#FF4E18] selection:text-white scroll-smooth">
      {/* ======================================================== */}
      {/* FULL-VIEWPORT HERO LANDING SECTION */}
      {/* ======================================================== */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden select-none">
        {/* Cinematic Background: Endless Loop Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-1 opacity-80"
            src="https://v1.pinimg.com/videos/iht/expMp4/14/f9/1f/14f91ffacba6476d89744ec4b360b0be_720w.mp4"
          />

          {/* Contrast scrim & dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none z-2" />
        </div>

        {/* ======================================================== */}
        {/* TOP BAR / NAVIGATION */}
        {/* ======================================================== */}
        <header className="relative z-30 w-full px-6 sm:px-8 md:px-12 pt-6 sm:pt-8 flex items-center justify-between">
          {/* Left: Brand Logo & Wordmark */}
          <div className="flex items-center flex-wrap gap-x-3.5 sm:gap-x-4 md:gap-x-5 text-xs sm:text-[13px] md:text-sm font-sans tracking-wide">
            <a
              href="#casetrace"
              onClick={(e) => {
                e.preventDefault();
                setIsSanctuaryOpen(true);
              }}
              className="font-sans font-bold text-base sm:text-lg md:text-xl tracking-[0.14em] text-white hover:opacity-90 transition-opacity flex items-center gap-2.5"
            >
              <CaseTraceLogo className="w-5 h-5 sm:w-6 sm:h-6 text-white" size={24} />
              <span>CASETRACE</span>
            </a>

            <span className="text-white/30 font-light select-none">/</span>
            
            {/* Dual Sector Badge */}
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-white/10 text-white/80 border border-white/15">
              <span>LE & Private DFIR OS</span>
            </span>

            <span className="hidden lg:inline text-white/30 font-light select-none">/</span>

            {/* Navigation links */}
            {navLinks.map((item, idx) => (
              <React.Fragment key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      if (item.target) {
                        document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                )}
                {idx < navLinks.length - 1 && (
                  <span className="text-white/30 font-light select-none">/</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/cases"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase px-3.5 py-1.5 border border-white/20 text-white/80 hover:bg-white/10 transition-all"
            >
              <span>Explore Cases</span>
              <ArrowRight className="w-3 h-3 text-[#FF5A1F]" />
            </Link>
            
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-white text-black text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-lg hover:bg-stone-200 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              aria-label="Open investigator login"
            >
              <Lock className="w-3 h-3" />
              <span>LOGIN</span>
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* LOWER VIEWPORT CONTENT: HEADLINE & FROSTED GLASS CARD */}
        {/* ======================================================== */}
        <div className="relative z-20 w-full px-6 sm:px-8 md:px-12 pb-8 sm:pb-12 md:pb-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 md:gap-12 animate-[ctFadeIn_1.2s_ease-out_forwards]">
          {/* Bottom-Left Main Headline */}
          <div className="max-w-3xl animate-[ctFadeInUp_1s_cubic-bezier(0.16,1,0.3,1)_forwards]">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-3 bg-white/5 border border-white/15 text-[11px] font-mono tracking-widest text-white/70 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse"></span>
              SUTRAM 2026 Forensic Intelligence Engine
            </div>
            <h1 className="font-editorial font-normal text-white text-4xl sm:text-5xl md:text-[64px] lg:text-[76px] xl:text-[84px] leading-[0.94] tracking-[-0.015em] select-text drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
              <span className="block">From scattered traces</span>
              <span className="block mt-1 sm:mt-2">to what really happened</span>
            </h1>
          </div>

          {/* Bottom-Right Frosted Glass Information Box */}
          <div className="w-full sm:w-auto sm:max-w-md md:max-w-[440px] bg-black/40 backdrop-blur-xl rounded-none border border-white/15 p-6 sm:p-7 text-left shadow-2xl animate-[ctFadeInUp_1.1s_cubic-bezier(0.16,1,0.3,1)_0.2s_forwards]">
            {/* Serif Subheading */}
            <h2 className="font-editorial font-normal text-white text-xl sm:text-2xl leading-snug">
              The evidence is scattered.<br />
              The story isn't.
            </h2>

            {/* Dual Sector Explanation */}
            <p className="mt-3 font-sans text-xs sm:text-[13px] md:text-sm text-white/85 leading-relaxed">
              CaseTrace reconstructs fragmented evidentiary chains across CDR logs, financial trails, disk forensics, and device dumps.
            </p>

            {/* Target Sectors Badges */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/30">
                <Shield className="w-2.5 h-2.5" /> State/Central LEAs & Courts
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Briefcase className="w-2.5 h-2.5" /> Private DFIR & Fraud Audit
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="font-editorial italic text-2xl sm:text-[26px] text-white hover:text-[#FFA95A] transition-colors cursor-pointer inline-block"
              >
                (begin investigation)
              </button>

              <Link
                href="/cases"
                className="text-xs font-mono text-white/60 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Cases Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECOND SECTION: ABOUT (ORGAN & WIREFRAME ARTWORK) */}
      {/* ======================================================== */}
      <AboutSection onOpenSanctuary={() => setIsSanctuaryOpen(true)} />

      {/* ======================================================== */}
      {/* THIRD SECTION: PRODUCT DEMONSTRATION / FORENSIC SUITE */}
      {/* ======================================================== */}
      <CaseTraceDemoSection />

      {/* ======================================================== */}
      {/* FOURTH SECTION: MEET OUR TEAM (GSAP 3D CARDS) */}
      {/* ======================================================== */}
      <CaseTraceTeamSection />

      {/* ======================================================== */}
      {/* FIFTH SECTION: SECURE TERMINAL ACCESS & CLOSING */}
      {/* ======================================================== */}
      <CaseTraceTerminalSection onBeginInvestigation={() => setIsLoginOpen(true)} />

      {/* ======================================================== */}
      {/* FOOTER SECTION: BRAND & NAVIGATION */}
      {/* ======================================================== */}
      <CaseTraceFooter onOpenSection={(section) => setSelectedNavSection(section)} />

      {/* ======================================================== */}
      {/* MODALS & CONTEMPLATIVE EXPERIENCES */}
      {/* ======================================================== */}
      <SanctuaryModal
        isOpen={isSanctuaryOpen}
        onClose={() => setIsSanctuaryOpen(false)}
        onToggleSound={handleSoundToggle}
        isSoundOn={isSoundOn}
      />

      <NavInfoModal
        section={selectedNavSection}
        onClose={() => setSelectedNavSection(null)}
        onEnterHaven={() => {
          setSelectedNavSection(null);
          setIsSanctuaryOpen(true);
        }}
      />

      {/* Investigator Login Popup */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
}
