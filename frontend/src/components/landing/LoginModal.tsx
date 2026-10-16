import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Eye, EyeOff, CheckCircle, Shield, Briefcase, Scale } from 'lucide-react';
import { CaseTraceLogo } from './CaseTraceLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'otp' | 'success' | 'reset_sent'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // 6-digit OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 5-minute countdown (300 seconds)
  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('login');
      setEmail('');
      setPassword('');
      setError('');
      setOtp(['', '', '', '', '', '']);
      setCountdown(300);
      setCanResend(false);
      setResendMessage('');
    }
  }, [isOpen]);

  // 5-minute timer countdown when in OTP step
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, step, countdown]);

  if (!isOpen) return null;

  // Format countdown into MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email and password validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Slide transition to OTP step
    setStep('otp');
    setCountdown(300);
    setCanResend(false);

    // Auto-focus first OTP input after transition
    setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 450);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric inputs
    const char = value.slice(-1);
    if (char && !/^\d+$/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto advance to next box
    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setCountdown(300);
    setCanResend(false);
    setResendMessage('A new 6-digit OTP has been dispatched.');
    setTimeout(() => setResendMessage(''), 4000);
  };

  const loginWithPersona = (role: 'officer' | 'dfir' | 'judge') => {
    if (role === 'officer') {
      localStorage.setItem('sih_token', 'token_officer_sharma_9482A');
      localStorage.setItem('sih_user', JSON.stringify({ id: 1, name: 'Sub-Inspector Sharma', role: 'Officer', badge: '9482A', unit: 'Cyber Crime Investigation Division' }));
    } else if (role === 'dfir') {
      localStorage.setItem('sih_token', 'token_dfir_vance_7731');
      localStorage.setItem('sih_user', JSON.stringify({ id: 2, name: 'Elena Vance (Lead DFIR)', role: 'Officer', badge: 'DFIR-EXT-7731', unit: 'Apex Forensics & Private Intelligence' }));
    } else {
      localStorage.setItem('sih_token', 'token_judge_patel_0102');
      localStorage.setItem('sih_user', JSON.stringify({ id: 3, name: 'Hon. Justice R.K. Patel', role: 'Judge', court: 'Tis Hazari Special Cyber Court' }));
    }
    onClose();
    router.push('/cases');
  };

  const handleEnterWorkspace = () => {
    if (!localStorage.getItem('sih_token')) {
      loginWithPersona('officer');
    } else {
      onClose();
      router.push('/cases');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    const isPrivate = email.toLowerCase().includes('kroll') || email.toLowerCase().includes('private') || email.toLowerCase().includes('dfir');
    const isJudge = email.toLowerCase().includes('court') || email.toLowerCase().includes('judge') || email.toLowerCase().includes('magistrate');
    if (isJudge) {
      localStorage.setItem('sih_token', 'token_judge_patel_0102');
      localStorage.setItem('sih_user', JSON.stringify({ id: 3, name: 'Hon. Justice R.K. Patel', role: 'Judge', court: 'Tis Hazari Special Cyber Court' }));
    } else if (isPrivate) {
      localStorage.setItem('sih_token', 'token_dfir_vance_7731');
      localStorage.setItem('sih_user', JSON.stringify({ id: 2, name: email.split('@')[0] || 'Lead DFIR', role: 'Officer', badge: 'DFIR-EXT-7731', unit: 'Apex Forensics & Private Intelligence' }));
    } else {
      localStorage.setItem('sih_token', 'token_officer_sharma_9482A');
      localStorage.setItem('sih_user', JSON.stringify({ id: 1, name: email.split('@')[0] || 'Investigating Officer', role: 'Officer', badge: 'LE-9482A', unit: 'Cyber Operations' }));
    }
    setError('');
    setStep('success');
  };

  const handleForgotPassword = () => {
    setError('');
    setStep('reset_sent');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dark Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Rectangle Popup with sleek thin white line styling */}
      <div className="relative w-full max-w-md bg-[#0A0A0A] text-white border border-white/20 p-7 sm:p-9 shadow-[0_0_50px_rgba(0,0,0,0.9)] z-10 overflow-hidden">
        {/* Top Right Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
          aria-label="Close login popup"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'reset_sent' ? (
          /* Cleared up popup with only 1 message displayed */
          <div className="py-12 sm:py-16 px-2 flex flex-col items-center justify-center text-center">
            <p className="text-sm sm:text-base font-sans text-white/95 leading-relaxed max-w-sm tracking-wide">
              The password reset mail has been sent to your registered Email ID, please check you inbox.
            </p>
          </div>
        ) : (
          <>
            {/* Top Center Logo */}
            <div className="flex flex-col items-center justify-center mb-7">
              <CaseTraceLogo className="w-9 h-9 text-white" size={36} />
              <span
                style={{ fontFamily: 'Cormorant Garamond' }}
                className="font-bold text-sm tracking-[0.2em] text-white mt-2.5"
              >
                CASETRACE
              </span>
              <span
                style={{ fontFamily: 'Verdana' }}
                className="text-[10px] tracking-widest text-white/40 uppercase mt-0.5"
              >
                Secure Investigator Portal
              </span>
            </div>

            {/* Sliding Content Track */}
            <div className="relative w-full overflow-hidden">
              <div
                className={`flex w-[200%] transition-transform duration-500 ease-in-out ${
                  step === 'login' ? 'translate-x-0' : '-translate-x-1/2'
                }`}
              >
                {/* ======================================================== */}
                {/* SLIDE 1: EMAIL & PASSWORD LOGIN FORM */}
                {/* ======================================================== */}
                <div className="w-1/2 pr-3 flex-shrink-0">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Left aligned Email */}
                    <div>
                      <label className="block text-left text-xs uppercase tracking-widest font-mono text-white/80 mb-2">
                        Email
                      </label>
                      {/* White thin lined box under it taking the input */}
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="investigator@casetrace.ai"
                        className="w-full bg-transparent border border-white text-white px-3.5 py-2.5 text-sm font-sans placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white transition-all rounded-none"
                      />
                    </div>

                    {/* Left aligned Password */}
                    <div>
                      <label className="block text-left text-xs uppercase tracking-widest font-mono text-white/80 mb-2">
                        Password
                      </label>
                      {/* Same thin white lined box with eye option on rightmost part */}
                      <div className="relative flex items-center border border-white rounded-none">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-transparent text-white px-3.5 py-2.5 pr-10 text-sm font-sans placeholder-white/25 focus:outline-none rounded-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 p-1 text-white/60 hover:text-white transition-colors cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Forgot Password ? option just below the password white box on right side */}
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-right text-[11px] font-mono text-white/60 hover:text-white transition-colors cursor-pointer tracking-wider focus:outline-none"
                        >
                          Forgot Password ?
                        </button>
                      </div>
                    </div>

                    {error && step === 'login' && (
                      <p className="text-xs text-[#FF5A1F] font-mono text-left">{error}</p>
                    )}

                    {/* White login rectangle spanning from left to right with Black LOGIN text */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-white text-black font-sans font-bold text-xs uppercase tracking-[0.2em] py-3.5 hover:bg-stone-200 active:scale-[0.99] transition-all cursor-pointer rounded-none shadow-md"
                      >
                        LOGIN
                      </button>
                    </div>

                    {/* Quick Persona Access for Government & Private DFIR */}
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                          ⚡ Instant Sector Access
                        </span>
                        <span className="text-[9px] font-mono text-[#FF5A1F] uppercase tracking-wider">
                          One-Click Demo
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => loginWithPersona('officer')}
                          className="flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                            <div>
                              <div className="text-[11px] font-mono text-white font-semibold">Govt Cyber Police (LE)</div>
                              <div className="text-[9px] font-sans text-white/40">SI Arvind Sharma • Cyber Operations</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => loginWithPersona('dfir')}
                          className="flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                            <div>
                              <div className="text-[11px] font-mono text-white font-semibold">Private DFIR / Corporate Fraud</div>
                              <div className="text-[9px] font-sans text-white/40">Elena Vance • Lead Investigator (Apex Forensics)</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => loginWithPersona('judge')}
                          className="flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <Scale className="w-3.5 h-3.5 text-emerald-400" />
                            <div>
                              <div className="text-[11px] font-mono text-white font-semibold">Judicial Magistrate / Court</div>
                              <div className="text-[9px] font-sans text-white/40">Hon. Justice R.K. Patel • Tis Hazari Special Court</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* ======================================================== */}
                {/* SLIDE 2: 6-DIGIT OTP VERIFICATION WITH 5-MINUTE RESEND */}
                {/* ======================================================== */}
                <div className="w-1/2 pl-3 flex-shrink-0">
                  {step !== 'success' ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div className="text-left">
                        <label className="block text-xs uppercase tracking-widest font-mono text-white/80 mb-1">
                          Enter 6-Digit OTP
                        </label>
                        <p className="text-[11px] font-sans text-white/60 leading-relaxed">
                          Security code dispatched to <span className="text-white">{email || 'investigator@casetrace.ai'}</span>
                        </p>
                      </div>

                      {/* 6 Individual Sleek Thin Line White Boxes */}
                      <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-1">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              otpRefs.current[i] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className="w-10 sm:w-11 h-12 sm:h-13 bg-transparent border border-white text-white text-center font-mono text-lg focus:outline-none focus:ring-1 focus:ring-white rounded-none transition-all"
                          />
                        ))}
                      </div>

                      {error && step === 'otp' && (
                        <p className="text-xs text-[#FF5A1F] font-mono text-left">{error}</p>
                      )}

                      {resendMessage && (
                        <p className="text-xs text-emerald-400 font-mono text-left">{resendMessage}</p>
                      )}

                      {/* White verify rectangle button with Black text */}
                      <div className="pt-1">
                        <button
                          type="submit"
                          className="w-full bg-white text-black font-sans font-bold text-xs uppercase tracking-[0.2em] py-3.5 hover:bg-stone-200 active:scale-[0.99] transition-all cursor-pointer rounded-none shadow-md"
                        >
                          VERIFY & PROCEED
                        </button>
                      </div>

                      {/* Resend OTP option below in each 5 minute */}
                      <div className="pt-2 text-center border-t border-white/10">
                        <div className="text-xs font-mono text-white/60">
                          {canResend ? (
                            <button
                              type="button"
                              onClick={handleResendOtp}
                              className="text-white underline hover:text-[#FF5A1F] transition-colors cursor-pointer"
                            >
                              Resend OTP now
                            </button>
                          ) : (
                            <span>
                              Resend OTP in{' '}
                              <span className="text-white font-semibold">
                                {formatTime(countdown)}
                              </span>
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep('login')}
                          className="text-[11px] font-sans text-white/40 hover:text-white transition-colors mt-2 cursor-pointer"
                        >
                          ← Back to login
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Success State */
                    <div className="text-center py-6 space-y-4">
                      <CheckCircle className="w-12 h-12 text-[#FF5A1F] mx-auto animate-bounce" />
                      <h4 className="font-editorial text-2xl text-white">Access Granted</h4>
                      <p className="text-xs font-sans text-white/70 max-w-xs mx-auto leading-relaxed">
                        Investigator identity authenticated. Digital traces and timeline correlation ready.
                      </p>
                      <button
                        onClick={handleEnterWorkspace}
                        className="w-full bg-white text-black font-sans font-bold text-xs uppercase tracking-[0.2em] py-3 hover:bg-stone-200 transition-all cursor-pointer mt-4"
                      >
                        ENTER WORKSPACE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
