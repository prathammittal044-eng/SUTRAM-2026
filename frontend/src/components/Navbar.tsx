'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Shield, 
  Briefcase, 
  Scale, 
  LogOut, 
  ClipboardList, 
  BadgeCheck, 
  FolderLock, 
  ChevronDown,
  Activity
} from 'lucide-react';
import { CaseTraceLogo } from '@/components/landing/CaseTraceLogo';

export default function Navbar({ showBack = false, title }: { showBack?: boolean; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('sih_user');
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw));
      } catch (e) {
        // Fallback default
      }
    } else {
      // Default to Sub-Inspector Sharma
      const defaultUser = { 
        id: 1, 
        name: 'SI Arvind Sharma', 
        role: 'Officer', 
        badge: 'DP-9482A', 
        unit: 'Cyber Crime Investigation Cell', 
        sector: 'Govt Law Enforcement' 
      };
      localStorage.setItem('sih_user', JSON.stringify(defaultUser));
      localStorage.setItem('sih_token', 'token_officer_sharma_9482A');
      setCurrentUser(defaultUser);
    }
  }, []);

  const switchPersona = (persona: 'officer' | 'dfir' | 'judge') => {
    if (persona === 'officer') {
      const u = { 
        id: 1, 
        name: 'SI Arvind Sharma', 
        role: 'Officer', 
        badge: 'DP-9482A', 
        unit: 'Cyber Crime Cell (Special Cell)', 
        sector: 'Govt Law Enforcement' 
      };
      localStorage.setItem('sih_user', JSON.stringify(u));
      localStorage.setItem('sih_token', 'token_officer_sharma_9482A');
      setCurrentUser(u);
    } else if (persona === 'dfir') {
      const u = { 
        id: 2, 
        name: 'Elena Vance (Lead DFIR)', 
        role: 'Officer', 
        badge: 'DFIR-7731', 
        unit: 'Apex Forensics & Corporate Audit', 
        sector: 'Private Investigation & DFIR' 
      };
      localStorage.setItem('sih_user', JSON.stringify(u));
      localStorage.setItem('sih_token', 'token_dfir_vance_7731');
      setCurrentUser(u);
    } else {
      const u = { 
        id: 3, 
        name: 'Hon. Justice R.K. Patel', 
        role: 'Judge', 
        badge: 'MAG-0102', 
        unit: 'Tis Hazari Special Cyber Court', 
        sector: 'Judicial Magistrate / Judiciary' 
      };
      localStorage.setItem('sih_user', JSON.stringify(u));
      localStorage.setItem('sih_token', 'token_judge_patel_0102');
      setCurrentUser(u);
    }
    setShowPersonaMenu(false);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('sih_token');
    localStorage.removeItem('sih_user');
    localStorage.removeItem('sih_user_id');
    router.push('/');
  };

  const isDfir = currentUser?.name?.includes('Vance') || currentUser?.sector?.includes('Private');
  const isJudge = currentUser?.role === 'Judge' || currentUser?.name?.includes('Patel');
  const caseMatch = pathname?.match(/\/case\/([^\/]+)/);
  const activeCaseId = caseMatch ? caseMatch[1] : null;

  return (
    <header className="sticky top-0 z-40 w-full select-none">
      {/* ── TOP STATUS TICKER ── */}
      <div className="bg-zinc-950 border-b border-white/5 py-1 px-4 text-center">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between text-[11px] font-sans text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-zinc-300">CaseTrace Forensics</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-500 hidden sm:inline">Secure Digital Evidence System</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-zinc-400 text-[10px] font-mono">
            <span>BNSS SEC. 193</span>
            <span>•</span>
            <span>BSA SEC. 63</span>
            <span>•</span>
            <span>ISO/IEC 27037</span>
          </div>
        </div>
      </div>

      {/* ── MAIN UNIVERSAL NAV BAR ── */}
      <nav className="bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 font-bold tracking-[0.14em] text-white hover:opacity-90 transition-opacity"
            >
              <CaseTraceLogo size={22} className="text-[#FF4E18]" />
              <span className="text-sm sm:text-base font-black tracking-widest leading-none">CASETRACE</span>
            </Link>

            <span className="text-zinc-700 font-light select-none hidden sm:inline">|</span>

            {/* Navigation Links */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-sans">
              <Link
                href="/cases"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                  pathname === '/cases'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <FolderLock className="w-3.5 h-3.5" />
                <span>Cases</span>
              </Link>

              {activeCaseId && (
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-600">/</span>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 font-mono text-xs flex items-center gap-1">
                    <Activity className="w-3 h-3 text-[#FF4E18]" />
                    <span>Case #{activeCaseId}</span>
                  </span>
                </div>
              )}

              <Link
                href="/audit"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                  pathname === '/audit'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Audit Trail</span>
              </Link>
            </div>
          </div>

          {/* Right: Persona Profile & Switcher */}
          <div className="flex items-center gap-3">
            {/* Persona Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-all text-left"
                title="Switch Sector / Persona"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white/80">
                  {isDfir ? (
                    <Briefcase className="w-3.5 h-3.5" />
                  ) : isJudge ? (
                    <Scale className="w-3.5 h-3.5" />
                  ) : (
                    <Shield className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-bold font-sans tracking-wide flex items-center gap-1 text-white">
                    <span>{currentUser?.name || 'Investigating Officer'}</span>
                    <BadgeCheck className="w-3 h-3 text-white/60" />
                  </div>
                  <div className="text-[10px] font-mono text-white/50">
                    {isDfir ? 'Private DFIR & Fraud' : isJudge ? 'Judicial Magistrate' : 'State Cyber Police'}
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-white/50 ml-1" />
              </button>

              {/* Persona Switcher Modal Dropdown */}
              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0A0A0A] border border-white/15 shadow-2xl rounded p-2.5 z-50 animate-[ctFadeIn_0.2s_ease-out]">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 px-2 py-1 mb-1 border-b border-white/10">
                    Switch Active Persona & Sector
                  </div>

                  <button
                    onClick={() => switchPersona('officer')}
                    className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-white/5 rounded transition-all text-xs"
                  >
                    <Shield className="w-4 h-4 text-white/70 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Govt Cyber Police (LE)</div>
                      <div className="text-[10px] text-white/40 font-mono">SI Arvind Sharma • DP-9482A</div>
                    </div>
                  </button>

                  <button
                    onClick={() => switchPersona('dfir')}
                    className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-white/5 rounded transition-all text-xs"
                  >
                    <Briefcase className="w-4 h-4 text-white/70 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Private DFIR / Corporate Fraud</div>
                      <div className="text-[10px] text-white/40 font-mono">Elena Vance • Apex Forensics Lead</div>
                    </div>
                  </button>

                  <button
                    onClick={() => switchPersona('judge')}
                    className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-white/5 rounded transition-all text-xs"
                  >
                    <Scale className="w-4 h-4 text-white/70 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Judicial Magistrate / Court</div>
                      <div className="text-[10px] text-white/40 font-mono">Hon. Justice Patel • Special Court</div>
                    </div>
                  </button>

                  <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center text-[11px] font-mono">
                    <button
                      onClick={() => setShowPersonaMenu(false)}
                      className="text-white/40 hover:text-white px-2 py-1"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-white/40 hover:text-white flex items-center gap-1 px-2 py-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </nav>
    </header>
  );
}
