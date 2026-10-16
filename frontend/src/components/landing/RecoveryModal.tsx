import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedFocus, setSelectedFocus] = useState<string>('hormones');
  const [duration, setDuration] = useState<string>('6-12-months');
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setStep(1);
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-[#FAF5EF] text-[#2E2420] rounded-2xl shadow-2xl p-6 sm:p-10 border border-[#E9DEC9] z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="mb-6">
              <span className="font-editorial italic text-2xl tracking-normal text-[#2E2420]">
                Veil
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-[#2E2420] mt-2 font-normal">
                Begin Your Clinical Recovery Intake
              </h3>
              <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                Personalized care for hormone balance, autonomic nervous system regulation, and deep restorative vitality.
              </p>
            </div>

            {/* Stepper Header */}
            <div className="flex items-center gap-2 mb-6 text-xs text-stone-600">
              <span className={`px-2.5 py-1 rounded-full ${step >= 1 ? 'bg-[#2E2420] text-white font-medium' : 'bg-stone-200 text-stone-600'}`}>
                1. Focus
              </span>
              <span className="text-stone-300">—</span>
              <span className={`px-2.5 py-1 rounded-full ${step >= 2 ? 'bg-[#2E2420] text-white font-medium' : 'bg-stone-200 text-stone-600'}`}>
                2. Timeline
              </span>
              <span className="text-stone-300">—</span>
              <span className={`px-2.5 py-1 rounded-full ${step >= 3 ? 'bg-[#2E2420] text-white font-medium' : 'bg-stone-200 text-stone-600'}`}>
                3. Intake
              </span>
            </div>

            {/* Step 1: Core Depletion Pattern */}
            {step === 1 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-[#2E2420]">
                  Where do you feel the most acute exhaustion?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'hormones', title: 'Hormonal Dysregulation', desc: 'Cycles, thyroid, progesterone / estrogen shifts' },
                    { id: 'nervous-system', title: 'Nervous System Overdrive', desc: 'Fight-or-flight, chronic stress, sensory overload' },
                    { id: 'fatigue', title: 'Cellular & Adrenal Fatigue', desc: 'Waking unrefreshed, mid-day crashes, brain fog' },
                    { id: 'sleep', title: 'Circadian & Sleep Disruption', desc: 'Night waking, racing mind, unrestorative sleep' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedFocus(item.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        selectedFocus === item.id
                          ? 'border-[#2E2420] bg-white shadow-sm ring-1 ring-[#2E2420]'
                          : 'border-stone-200/80 bg-white/50 hover:bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#2E2420]">{item.title}</span>
                        {selectedFocus === item.id && <Check className="w-4 h-4 text-[#2E2420]" />}
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-snug">{item.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-2.5 px-6 rounded-xl bg-[#2E2420] text-white text-sm font-medium hover:bg-[#453630] transition-colors flex items-center gap-2"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Duration */}
            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-[#2E2420]">
                  How long have these symptoms persisted?
                </label>
                <div className="space-y-2.5">
                  {[
                    { id: 'under-6-months', label: 'Under 6 months (Recent acute onset)' },
                    { id: '6-12-months', label: '6 to 12 months (Persistent fatigue)' },
                    { id: '1-3-years', label: '1 to 3 years (Chronic depletion)' },
                    { id: 'over-3-years', label: 'Over 3 years (Protracted exhaustion)' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDuration(option.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        duration === option.id
                          ? 'border-[#2E2420] bg-white shadow-sm ring-1 ring-[#2E2420]'
                          : 'border-stone-200/80 bg-white/50 hover:bg-white hover:border-stone-300'
                      }`}
                    >
                      <span className="text-sm text-[#2E2420]">{option.label}</span>
                      {duration === option.id && <Check className="w-4 h-4 text-[#2E2420]" />}
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-2.5 px-4 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="py-2.5 px-6 rounded-xl bg-[#2E2420] text-white text-sm font-medium hover:bg-[#453630] transition-colors flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Clinical Contact */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2E2420]">
                    Where should we send your recovery protocol?
                  </label>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Your confidential assessment will be reviewed by a board-certified physician.
                  </p>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="mt-3 w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-sm text-[#2E2420] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2E2420] focus:border-transparent transition-all"
                  />
                </div>

                <div className="p-3.5 bg-stone-100/70 rounded-xl text-xs text-stone-600 leading-relaxed">
                  ✓ HIPAA-compliant & confidential<br />
                  ✓ Includes AI biomarker breakdown & hormone telehealth appointment matching
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-2.5 px-4 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="py-3 px-7 rounded-xl bg-[#2E2420] text-white text-sm font-medium hover:bg-[#453630] transition-colors shadow-sm"
                  >
                    Request Protocol
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-editorial text-3xl text-[#2E2420] font-normal">
              Intake Protocol Initialized
            </h3>
            <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
              We have dispatched your intake link to <strong className="text-stone-900">{email}</strong>. Our clinical team and AI diagnostic recovery system are preparing your hormone & nervous system overview.
            </p>
            <button
              onClick={handleReset}
              className="mt-6 py-2.5 px-6 rounded-xl bg-[#2E2420] text-white text-sm font-medium hover:bg-[#453630] transition-colors"
            >
              Return to Veil
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
