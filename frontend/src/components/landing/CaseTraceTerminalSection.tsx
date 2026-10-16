import React, { useState } from 'react';
import { InvestigatorPhoneArtwork } from './InvestigatorPhoneArtwork';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

interface CaseTraceTerminalSectionProps {
  onBeginInvestigation?: () => void;
}

type InquiryCategory = 'Partnership' | 'Sponsorship' | 'Complaint' | 'Bug and Errors';

interface FormData {
  name: string;
  organization: string;
  email: string;
  city: string;
  country: string;
  number: string;
  category: InquiryCategory;
  message: string;
}

const CATEGORIES: InquiryCategory[] = [
  'Partnership',
  'Sponsorship',
  'Complaint',
  'Bug and Errors',
];

export const CaseTraceTerminalSection: React.FC<CaseTraceTerminalSectionProps> = () => {
  const { ref, isVisible } = useScrollFadeIn<HTMLElement>({ threshold: 0.1 });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    organization: '',
    email: '',
    city: '',
    country: '',
    number: '',
    category: 'Partnership',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: InquiryCategory) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate swift forensic transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      organization: '',
      email: '',
      city: '',
      country: '',
      number: '',
      category: 'Partnership',
      message: '',
    });
    setIsSubmitted(false);
  };

  return (
    <section
      ref={ref}
      id="terminal"
      aria-label="CaseTrace Contact Us"
      className={`relative w-full min-h-screen bg-black text-white px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 py-20 sm:py-24 lg:py-32 border-t border-white/10 overflow-hidden select-none z-10 flex flex-col justify-start fade-in-section ${
        isVisible ? 'is-visible' : ''
      }`}
    >
      {/* Background technical grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] mx-auto w-full">
        {/* Top metadata */}
        <div className="flex items-center justify-between pb-10 border-b border-white/10 scroll-reveal fade-child-1">
          <div className="space-y-1">
            <span className="block text-[11px] sm:text-xs tracking-[0.24em] font-semibold text-white/60 uppercase font-sans">
              CONTACT US
            </span>
            <span className="block text-[11px] sm:text-xs text-white/40 font-mono tracking-widest">
              05 · 05
            </span>
          </div>
        </div>

        {/* Main contact section split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch mt-12 sm:mt-16">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Investigation Agent on Telephone Aesthetic */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col h-full scroll-reveal fade-child-2">
            <div className="w-full flex-1 aspect-[3/4] sm:aspect-[3/4] lg:aspect-auto min-h-[480px] sm:min-h-[560px] lg:min-h-0 shadow-2xl overflow-hidden border border-white/10 flex flex-col">
              <InvestigatorPhoneArtwork className="w-full h-full flex-1" />
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Headline & Contact Rectangle Form */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            {/* Headline */}
            <h2 className="font-editorial font-normal text-3xl sm:text-4xl md:text-5xl lg:text-[54px] leading-[1.08] tracking-[-0.015em] text-white scroll-reveal fade-child-2">
              Have a question or idea?<br className="hidden sm:inline" />
              Let's connect the dots.
            </h2>

            {/* Rectangle Box Form */}
            <div className="mt-8 sm:mt-10 bg-[#0A0A0A] border border-white/10 p-6 sm:p-8 sm:p-9 shadow-2xl scroll-reveal fade-child-3">
              {isSubmitted ? (
                <div className="py-12 sm:py-16 text-center space-y-5">
                  <div className="w-12 h-12 mx-auto rounded-full border border-[#FF4E18]/40 bg-[#FF4E18]/10 flex items-center justify-center text-[#FF4E18]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-mono tracking-widest uppercase text-[#FF4E18] block">
                      TRANSMISSION RECEIVED
                    </span>
                    <h3 className="font-editorial text-2xl sm:text-3xl text-white">
                      Your dispatch has been logged.
                    </h3>
                    <p className="text-xs sm:text-sm font-sans text-white/70 max-w-md mx-auto leading-relaxed">
                      Thank you, {formData.name || 'Investigator'}. Our team is reviewing your dossier regarding{' '}
                      <span className="text-white font-medium">{formData.category}</span> and will establish contact via {formData.email || 'the provided wire'}.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-2.5 border border-white/20 text-xs font-sans uppercase tracking-wider text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
                    >
                      Send Another Dispatch
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 select-text">
                  {/* Grid for Name & Organization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-[10px] sm:text-[11px] font-mono tracking-wider text-white/60 uppercase mb-1.5"
                      >
                        Name <span className="text-[#FF4E18]">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Miller"
                        className="w-full bg-[#121212] border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/25 focus:border-[#FF4E18] focus:bg-[#161616] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-organization"
                        className="block text-[10px] sm:text-[11px] font-mono tracking-wider text-white/60 uppercase mb-1.5"
                      >
                        Organization
                      </label>
                      <input
                        id="contact-organization"
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="e.g. Apex Labs / Forensic Unit"
                        className="w-full bg-[#121212] border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/25 focus:border-[#FF4E18] focus:bg-[#161616] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Grid for Email & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-[10px] sm:text-[11px] font-mono tracking-wider text-white/60 uppercase mb-1.5"
                      >
                        Email <span className="text-[#FF4E18]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="investigator@agency.org"
                        className="w-full bg-[#121212] border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/25 focus:border-[#FF4E18] focus:bg-[#161616] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-number"
                        className="block text-[10px] sm:text-[11px] font-mono tracking-wider text-white/60 uppercase mb-1.5"
                      >
                        Number
                      </label>
                      <input
                        id="contact-number"
                        type="tel"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-[#121212] border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/25 focus:border-[#FF4E18] focus:bg-[#161616] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Grid for City & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-city"
                        className="block text-[10px] sm:text-[11px] font-mono tracking-wider text-white/60 uppercase mb-1.5"
                      >
                        City
                      </label>
                      <input
                        id="contact-city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        className="w-full bg-[#121212] border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/25 focus:border-[#FF4E18] focus:bg-[#161616] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-country"
                        className="block text-[10px] sm:text-[11px] font-mono tracking-wider text-white/60 uppercase mb-1.5"
                      >
                        Country
                      </label>
                      <input
                        id="contact-country"
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="United States"
                        className="w-full bg-[#121212] border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/25 focus:border-[#FF4E18] focus:bg-[#161616] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-mono tracking-wider text-white/60 uppercase mb-2">
                      Category (Select One)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES.map((cat) => {
                        const isSelected = formData.category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategorySelect(cat)}
                            className={`px-3 py-2 text-xs font-mono uppercase tracking-wider text-center border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white text-black border-white font-semibold shadow-md'
                                : 'bg-[#121212] text-white/70 border-white/15 hover:border-white/40 hover:text-white'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Detail Box */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-[10px] sm:text-[11px] font-mono tracking-wider text-white/60 uppercase mb-1.5"
                    >
                      Message Details <span className="text-[#FF4E18]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Detail your question, inquiry, or evidentiary context here..."
                      className="w-full bg-[#121212] border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/25 focus:border-[#FF4E18] focus:bg-[#161616] focus:outline-none transition-colors resize-y min-h-[96px]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-white text-black font-sans font-semibold text-xs sm:text-sm tracking-wider uppercase hover:bg-[#FFA95A] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {isSubmitting ? 'Transmitting Dispatch...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
