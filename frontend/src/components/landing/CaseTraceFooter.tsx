import React from 'react';
import { CaseTraceLogo } from './CaseTraceLogo';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

const TwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
  </svg>
);

interface CaseTraceFooterProps {
  onOpenSection?: (section: string) => void;
}

export const CaseTraceFooter: React.FC<CaseTraceFooterProps> = ({ onOpenSection }) => {
  const { ref, isVisible } = useScrollFadeIn<HTMLElement>({ threshold: 0.08 });

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      ref={ref}
      className={`relative w-full bg-[#050505] text-white overflow-hidden border-t border-[#161619] select-none fade-in-section ${
        isVisible ? 'is-visible' : ''
      }`}
    >
      <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 pt-16 sm:pt-20 pb-12">
        {/* ======================================================== */}
        {/* TOP THREE-COLUMN GRID */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand Column (Left) */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col items-start scroll-reveal fade-child-1">
            {/* Logo Badge + Brand Wordmark */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shadow-md shrink-0">
                <CaseTraceLogo className="w-5 h-5 text-black" size={20} />
              </div>
              <span className="font-sans font-bold text-2xl text-white tracking-wide">
                CASETRACE
              </span>
            </div>

            {/* Platform Description / Mission statement */}
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-md font-sans">
              Helping investigators and intelligence teams navigate the journey from fragmented digital traces to verifiable evidentiary truth through explainable AI.
            </p>

            {/* Social Links Section */}
            <div className="mt-8">
              <span className="block text-[11px] sm:text-xs font-semibold tracking-wider text-zinc-400 uppercase font-sans mb-3.5">
                CONNECT WITH US
              </span>

              <div className="flex items-center gap-2.5">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="w-10 h-10 rounded-xl bg-[#141416] border border-[#232326] text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-[#1c1c20] flex items-center justify-center transition-all duration-200"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-xl bg-[#141416] border border-[#232326] text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-[#1c1c20] flex items-center justify-center transition-all duration-200"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>

                <a
                  href="https://github.com/epsilon-rbtcs/CaseTrace"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="w-10 h-10 rounded-xl bg-[#141416] border border-[#232326] text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-[#1c1c20] flex items-center justify-center transition-all duration-200"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>

                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-10 h-10 rounded-xl bg-[#141416] border border-[#232326] text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-[#1c1c20] flex items-center justify-center transition-all duration-200"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-xl bg-[#141416] border border-[#232326] text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-[#1c1c20] flex items-center justify-center transition-all duration-200"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* EXPLORE Column */}
          <div className="md:col-span-3 lg:col-span-3 scroll-reveal fade-child-2">
            <h4 className="text-xs sm:text-[13px] font-bold text-white uppercase tracking-wider mb-5 font-sans">
              EXPLORE
            </h4>
            <ul className="space-y-3 font-sans text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('about')}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSection) onOpenSection('Our Mission');
                    else scrollTo('about');
                  }}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Our Mission
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSection) onOpenSection('FAQs');
                    else scrollTo('demo');
                  }}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* COMPANY & LEGAL Column */}
          <div className="md:col-span-3 lg:col-span-3 scroll-reveal fade-child-3">
            <h4 className="text-xs sm:text-[13px] font-bold text-white uppercase tracking-wider mb-5 font-sans">
              COMPANY & LEGAL
            </h4>
            <ul className="space-y-3 font-sans text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('terminal')}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSection) onOpenSection('Privacy Policy');
                  }}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSection) onOpenSection('Terms Of Service');
                  }}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms Of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SUBTLE HORIZONTAL DIVIDER */}
        {/* ======================================================== */}
        <div className="w-full border-t border-[#1c1c20] mt-14 sm:mt-16 mb-8 sm:mb-12 scroll-reveal fade-child-4" />

        {/* ======================================================== */}
        {/* GIANT WATERMARK BRAND TYPOGRAPHY */}
        {/* ======================================================== */}
        <div className="w-full -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 overflow-hidden select-none pointer-events-none py-1 sm:py-3 my-2 sm:my-3 scroll-reveal fade-child-5">
          <svg
            viewBox="0 0 960 120"
            className="w-full h-auto block select-none pointer-events-none"
            preserveAspectRatio="xMidYMid meet"
            aria-label="CASETRACE"
          >
            <defs>
              <linearGradient id="caseTraceFooterWatermarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#585866" />
                <stop offset="32%" stopColor="#30303a" />
                <stop offset="72%" stopColor="#16161c" />
                <stop offset="100%" stopColor="#07070a" />
              </linearGradient>
            </defs>
            <text
              x="480"
              y="102"
              textAnchor="middle"
              textLength="948"
              lengthAdjust="spacing"
              fill="url(#caseTraceFooterWatermarkGrad)"
              fontSize="130"
              fontWeight="900"
              letterSpacing="-0.02em"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            >
              CASETRACE
            </text>
          </svg>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM METADATA BAR & DISCLAIMER */}
        {/* ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-6 sm:pt-8 text-xs text-zinc-500 font-sans leading-relaxed scroll-reveal fade-child-6">
          {/* Copyright notice */}
          <p className="shrink-0">
            © 2026 CaseTrace Technologies Inc. All rights reserved.
          </p>

          {/* Forensic / Legal Disclaimer */}
          <p className="max-w-2xl text-left md:text-right">
            2026 Forensic Disclaimer - CaseTrace is designed to support, not replace professional investigative judgment. AI-generated insights should always be reviewed by qualified forensic professionals.
          </p>
        </div>
      </div>
    </footer>
  );
};
