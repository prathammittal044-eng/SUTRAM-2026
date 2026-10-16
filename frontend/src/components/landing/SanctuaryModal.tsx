import React, { useEffect, useState } from 'react';
import { X, Volume2, Sparkles, Heart, Clock } from 'lucide-react';
import { CaseTraceLogo } from './CaseTraceLogo';

interface SanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleSound?: () => void;
  isSoundOn?: boolean;
}

export const SanctuaryModal: React.FC<SanctuaryModalProps> = ({
  isOpen,
  onClose,
  onToggleSound,
  isSoundOn = false,
}) => {
  const [activeTab, setActiveTab] = useState<'presence' | 'hours' | 'gatherings'>('presence');
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Gentle breathing cycle timer for presence mode
  useEffect(() => {
    if (!isOpen || activeTab !== 'presence') return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dark Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#140C0D] text-white rounded-2xl border border-white/15 p-6 sm:p-9 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close sanctuary"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <CaseTraceLogo className="w-5 h-5 text-[#FF6329]" size={20} />
            <span className="font-sans font-bold tracking-widest text-base text-[#FF6329]">
              CASETRACE
            </span>
            <span className="text-white/40 text-xs">/ Investigation Briefing</span>
          </div>
          <h3 className="font-editorial text-3xl sm:text-4xl text-white mt-2 font-normal">
            Welcome to the quiet.
          </h3>
          <p className="text-sm text-white/70 mt-1.5 font-sans leading-relaxed">
            Step away from the demands, notifications, and noise of the world. Take a moment to settle into stillness.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 text-xs font-sans">
          <button
            onClick={() => setActiveTab('presence')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'presence'
                ? 'bg-white/15 text-white font-medium'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Silent Presence
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'hours'
                ? 'bg-white/15 text-white font-medium'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Sanctuary Hours
          </button>
          <button
            onClick={() => setActiveTab('gatherings')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'gatherings'
                ? 'bg-white/15 text-white font-medium'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Quiet Gatherings
          </button>
        </div>

        {/* Tab Content 1: Presence Breathing Exercise */}
        {activeTab === 'presence' && (
          <div className="text-center py-6">
            <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF4E18]/20 to-[#FFA54A]/30 border border-[#FF6B30]/40 transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'scale-110 opacity-90'
                    : breathPhase === 'Hold'
                    ? 'scale-105 opacity-80'
                    : 'scale-90 opacity-40'
                }`}
              />
              <div className="relative text-center">
                <span className="font-editorial text-2xl tracking-wide text-white block">
                  {breathPhase}
                </span>
                <span className="text-[11px] font-sans text-white/50 uppercase tracking-widest mt-1 block">
                  4 seconds
                </span>
              </div>
            </div>

            <p className="font-editorial italic text-lg text-white/90 max-w-sm mx-auto">
              “A place to slow down, feel held, breathe, and remember what matters.”
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              {onToggleSound && (
                <button
                  onClick={onToggleSound}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-sans flex items-center gap-2 border border-white/15 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#FF6329]" />
                  <span>{isSoundOn ? 'Sound is playing (click to mute)' : 'Turn on sanctuary drone'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab Content 2: Sanctuary Hours */}
        {activeTab === 'hours' && (
          <div className="space-y-4 py-2 text-sm font-sans">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3.5">
              <Clock className="w-5 h-5 text-[#FF6329] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-white">Daily Open Sanctuary</h4>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  The sanctuary doors are open every morning and evening for silent contemplation, reading, or quiet sitting.
                </p>
                <div className="mt-2 text-xs font-mono text-white/90">
                  Morning: 06:30 — 09:30 &nbsp;•&nbsp; Evening: 17:30 — 21:00
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3.5">
              <Sparkles className="w-5 h-5 text-[#FFA54A] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-white">Silent Sundays</h4>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  No scheduled talks, no digital devices. Ambient warmth, tea in silence, and a resting space for the weary.
                </p>
                <div className="mt-2 text-xs font-mono text-white/90">
                  Every Sunday 08:00 — 18:00
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Quiet Gatherings */}
        {activeTab === 'gatherings' && (
          <div className="space-y-3 py-2 text-sm font-sans">
            {[
              { title: 'Evening Candlelight Sitting', time: 'Every Tuesday & Thursday, 19:30', desc: 'A 45-minute collective stillness session with soft acoustic drone.' },
              { title: 'The Breath Circle', time: 'Saturdays, 10:00', desc: 'Guided somatic down-regulation for nervous system restoration.' },
              { title: 'Community Tea & Silent Reading', time: 'Sundays, 15:00', desc: 'Bring your book, journal, or simply enjoy hot herbal tea in silence.' },
            ].map((ev, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-xs sm:text-sm">{ev.title}</span>
                  <span className="text-[11px] text-[#FFA54A] font-mono">{ev.time}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">{ev.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#FF6329]" />
            Free and open to everyone
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-black font-medium text-xs hover:bg-stone-200 transition-colors"
          >
            Close Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
};
