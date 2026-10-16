'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Folder, 
  ShieldCheck, 
  FileText, 
  Plus, 
  Calendar, 
  Tag, 
  Lock, 
  ArrowRight, 
  Cpu 
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const CRIME_TYPES = [
  'Cyber Crime / Fraud', 'Corporate Espionage & Extortion', 'Theft / Robbery', 'Murder / Attempt to Murder',
  'Assault / Battery', 'Kidnapping / Abduction', 'Drug Trafficking',
  'Sexual Offence', 'Domestic Violence', 'Corruption / Bribery',
  'Property Dispute', 'Arson', 'Forgery / Cheating', 'Other',
];

const IPC_SECTIONS = [
  'Section 308(2) BNS – Extortion', 'Section 318(4) BNS – Cheating', 'Section 336(3) BNS – Forgery',
  'IT Act 66C – Identity Theft', 'IT Act 66D – Cheating by Personation',
  'Section 63 BSA 2023 – Electronic Records', '302 – Murder', '307 – Attempt to Murder',
  '420 – Cheating', '120B – Criminal Conspiracy', 'NDPS Act', 'Other',
];

const DEFAULT_CASE_METADATA: Record<number, {
  crime_type: string;
  incident_date: string;
  location: string;
  complainant_name: string;
  accused_name: string;
  ipc_sections: string[];
}> = {
  1: {
    crime_type: 'Corporate Espionage & Extortion',
    incident_date: '2026-07-14',
    location: 'Gurugram, Haryana',
    complainant_name: 'Nexus Technologies Pvt Ltd',
    accused_name: 'Kunal Malhotra (Former CTO)',
    ipc_sections: ['Section 308(2) BNS – Extortion', 'IT Act 66C – Identity Theft'],
  },
  2: {
    crime_type: 'Cyber Crime / Fraud',
    incident_date: '2026-06-22',
    location: 'Mumbai, Maharashtra',
    complainant_name: 'CloudMatrix Solutions',
    accused_name: 'Unknown Threat Actor (APT-Phantom)',
    ipc_sections: ['IT Act 66D – Cheating by Personation', 'Section 336(3) BNS – Forgery'],
  },
  3: {
    crime_type: 'Cyber Crime / Fraud',
    incident_date: '2026-08-29',
    location: 'New Delhi, India',
    complainant_name: 'State Cyber Crime Cell',
    accused_name: 'Rajiv Saxena & Associates',
    ipc_sections: [
      'Section 308(2) BNS – Extortion',
      'Section 318(4) BNS – Cheating',
      'IT Act 66C – Identity Theft',
      'IT Act 66D – Cheating by Personation',
      'Section 63 BSA 2023 – Electronic Records',
    ],
  },
  4: {
    crime_type: 'Cyber Crime / Fraud',
    incident_date: '2026-08-30',
    location: 'Bengaluru, Karnataka',
    complainant_name: 'PaySecure Financial Ltd',
    accused_name: 'Unidentified Syndicate (Operation Chimera)',
    ipc_sections: ['Section 318(4) BNS – Cheating', '420 – Cheating', '120B – Criminal Conspiracy'],
  },
  5: {
    crime_type: 'Forgery / Cheating',
    incident_date: '2026-09-15',
    location: 'Hyderabad, Telangana',
    complainant_name: 'Orion Pharmaceuticals',
    accused_name: 'Unknown Deepfake Operator',
    ipc_sections: ['Section 336(3) BNS – Forgery', 'IT Act 66D – Cheating by Personation'],
  },
  6: {
    crime_type: 'Cyber Crime / Fraud',
    incident_date: '2026-10-01',
    location: 'Visakhapatnam, Andhra Pradesh',
    complainant_name: 'NTPC Vizag Power Plant',
    accused_name: 'Unknown State-Sponsored Actor',
    ipc_sections: ['IT Act 66C – Identity Theft', 'Section 63 BSA 2023 – Electronic Records'],
  },
};

export default function CasesDashboard() {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const canCreateCase = currentUser?.role === 'Officer';

  // Seed default realistic forensic metadata for cases 1-6 if not already present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = JSON.parse(localStorage.getItem('case_metadata') || '{}');
      let changed = false;
      for (const [idStr, meta] of Object.entries(DEFAULT_CASE_METADATA)) {
        if (!stored[idStr] || !stored[idStr].crime_type) {
          stored[idStr] = { ...(stored[idStr] || {}), ...meta };
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('case_metadata', JSON.stringify(stored));
      }
    } catch (e) {
      console.error('Failed to initialize case_metadata', e);
    }
  }, []);

  useEffect(() => {
    // Auth check (defaulting to Officer if none set)
    const token = localStorage.getItem('sih_token');
    const userRaw = localStorage.getItem('sih_user');
    if (!token || !userRaw) {
      // Default to Sub-Inspector Sharma
      localStorage.setItem('sih_token', 'token_officer_sharma_9482A');
      const defaultUser = { id: 1, name: 'Sub-Inspector Sharma', role: 'Officer', badge: '9482A', unit: 'Cyber Operations' };
      localStorage.setItem('sih_user', JSON.stringify(defaultUser));
      setCurrentUser(defaultUser);
    } else {
      setCurrentUser(JSON.parse(userRaw));
    }
    fetchCases();
  }, []);

  const getHeaders = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('sih_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCases = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sih_token') : null;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/cases/`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(res => res.json())
      .then(data => setCases(data))
      .catch(err => console.error('Error fetching cases', err));
  };

  const toggleSection = (s: string) => {
    setSelectedSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleCreateCase = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const meta = {
      title: fd.get('title') as string,
      crime_type: fd.get('crime_type') as string,
      incident_date: fd.get('incident_date') as string,
      location: fd.get('location') as string,
      complainant_name: fd.get('complainant_name') as string,
      complainant_phone: fd.get('complainant_phone') as string,
      accused_name: fd.get('accused_name') as string,
      ipc_sections: selectedSections,
      description: fd.get('description') as string,
    };

    const payload = {
      case_number: fd.get('case_number') as string,
      title: meta.title,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/cases/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        const stored = JSON.parse(localStorage.getItem('case_metadata') || '{}');
        stored[created.id] = meta;
        localStorage.setItem('case_metadata', JSON.stringify(stored));

        setShowModal(false);
        setSelectedSections([]);
        fetchCases();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail}`);
      }
    } catch { alert('Network error.'); }
  };

  const getCaseMeta = (id: number) => {
    if (typeof window === 'undefined') return DEFAULT_CASE_METADATA[id] || null;
    const stored = JSON.parse(localStorage.getItem('case_metadata') || '{}');
    return stored[id] || DEFAULT_CASE_METADATA[id] || null;
  };

  const filteredCases = cases.filter((c: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const meta = getCaseMeta(c.id) || {};
    return (
      c.case_number?.toLowerCase().includes(q) ||
      c.title?.toLowerCase().includes(q) ||
      meta.crime_type?.toLowerCase().includes(q) ||
      meta.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#FF4E18] selection:text-white">
      <Navbar />

      <main className="p-6 max-w-[1440px] mx-auto w-full space-y-6">
        {/* HEADER HERO BANNER */}
        <div className="relative bg-zinc-900/60 rounded-xl border border-zinc-800 p-6 sm:p-7 overflow-hidden shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-zinc-400">Universal Digital Forensics Platform</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Investigation Cases
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Manage digital evidence files, cross-source timelines, and court-admissible forensic reports for cybercrime and fraud investigations.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {canCreateCase && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-white text-black font-semibold text-xs rounded-lg px-4 py-2.5 hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-black" /> New Case
                </button>
              )}
            </div>
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SIDEBAR METRICS */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-5 space-y-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 pb-3">
                Case Summary
              </h3>
              <div>
                <p className="text-xs text-zinc-400 mb-1">Total Registered Cases</p>
                <p className="text-white font-bold text-3xl font-sans">{cases.length}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-lg">
                  <p className="text-[11px] text-emerald-400 font-medium">Active / Open</p>
                  <p className="text-xl font-bold text-zinc-100 mt-1">{cases.filter((c: any) => !c.is_sealed).length}</p>
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-lg">
                  <p className="text-[11px] text-zinc-400 font-medium">Sealed for Trial</p>
                  <p className="text-xl font-bold text-zinc-400 mt-1">{cases.filter((c: any) => c.is_sealed).length}</p>
                </div>
              </div>
            </div>

            {/* SECTORS OVERVIEW */}
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-5 space-y-3">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Operating Sectors
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-zinc-950/70 rounded-lg border border-zinc-800/80 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <div>
                    <strong className="text-zinc-200 font-medium block">Law Enforcement (Police/CBI)</strong>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Section 193 BNSS & Section 63 BSA</p>
                  </div>
                </div>
                <div className="p-3 bg-zinc-950/70 rounded-lg border border-zinc-800/80 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FF4E18]" />
                  <div>
                    <strong className="text-zinc-200 font-medium block">Private Investigation & DFIR</strong>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Corporate Fraud & Ransomware IR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CASES LIST */}
          <div className="lg:col-span-9 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search cases by title, number, suspect, or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all font-sans"
              />
            </div>

            {/* Cases Container */}
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-400">All Cases ({filteredCases.length})</span>
                <span className="text-zinc-500 text-[11px]">Click any case to open investigation</span>
              </div>

              <div className="divide-y divide-zinc-800/80">
                {filteredCases.length === 0 ? (
                  <div className="py-16 text-center text-zinc-500 text-xs">
                    <Folder className="w-10 h-10 mx-auto mb-2 opacity-30 text-zinc-400" />
                    <p className="font-medium">No cases found matching your search.</p>
                  </div>
                ) : (
                  filteredCases.map((c: any) => {
                    const meta = getCaseMeta(c.id);
                    return (
                      <Link
                        href={`/case/${c.id}`}
                        key={c.id}
                        className="block hover:bg-zinc-800/40 transition-colors p-5 group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            {/* Case Number Badge */}
                            <div className="flex-shrink-0 text-center py-1 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 font-mono text-xs px-2.5">
                              {c.case_number}
                            </div>

                            {/* Case Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-medium text-base text-zinc-100 group-hover:text-white transition-colors truncate">
                                  {c.title}
                                </h3>
                                {c.is_sealed && (
                                  <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-sans">
                                    <Lock className="w-2.5 h-2.5 text-amber-400" /> Sealed for Court
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                                <span className="flex items-center gap-1 text-[11px]">
                                  <Calendar className="w-3 h-3 text-zinc-500" /> {new Date(c.created_at).toLocaleDateString()}
                                </span>
                                {meta?.crime_type && (
                                  <span className="flex items-center gap-1 text-[11px] bg-zinc-800/60 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700/50">
                                    <Tag className="w-2.5 h-2.5 text-zinc-500" /> {meta.crime_type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Arrow */}
                          <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-zinc-800 flex-shrink-0">
                            <span className="text-zinc-400 text-xs font-medium group-hover:text-white hidden sm:inline">
                              Open Case
                            </span>
                            <div className="w-8 h-8 rounded-lg border border-zinc-700 bg-zinc-800/60 group-hover:bg-white group-hover:text-black flex items-center justify-center transition-all flex-shrink-0">
                              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* REGISTER NEW CASE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0A0A0A] text-white border border-white/15 shadow-2xl w-full max-w-2xl my-4 overflow-hidden animate-[ctFadeIn_0.2s_ease-out]">
            <div className="bg-white/[0.02] px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-editorial text-white flex items-center gap-2 tracking-wide">
                  <FileText className="w-4 h-4 text-white/70" /> REGISTER NEW CASE DOCKET
                </h3>
                <p className="text-white/50 text-xs mt-0.5 font-mono">Government Police FIR or Enterprise DFIR Incident Docket</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-white/40 hover:text-white transition-colors text-sm px-1 py-0.5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 mb-1 font-mono text-[11px] uppercase tracking-wider">Case / FIR Identifier *</label>
                  <input 
                    required 
                    name="case_number" 
                    type="text" 
                    placeholder="e.g. FIR-2026-401 or DFIR-CORP-09"
                    className="w-full bg-white/[0.02] border border-white/20 p-2.5 text-white font-mono text-xs outline-none focus:border-white/50 transition-colors placeholder-white/20" 
                  />
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-mono text-[11px] uppercase tracking-wider">Case Title *</label>
                  <input 
                    required 
                    name="title" 
                    type="text" 
                    placeholder="e.g. Server Intrusion & Ransom Demand"
                    className="w-full bg-white/[0.02] border border-white/20 p-2.5 text-white text-xs outline-none focus:border-white/50 transition-colors placeholder-white/20" 
                  />
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-mono text-[11px] uppercase tracking-wider">Crime Category *</label>
                  <select 
                    required 
                    name="crime_type" 
                    className="w-full bg-[#0A0A0A] border border-white/20 p-2.5 text-white text-xs outline-none focus:border-white/50 transition-colors"
                  >
                    <option value="" className="bg-[#0A0A0A] text-white/40">-- Select Category --</option>
                    {CRIME_TYPES.map(t => <option key={t} value={t} className="bg-[#0A0A0A] text-white">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-mono text-[11px] uppercase tracking-wider">Date of Incident *</label>
                  <input 
                    required 
                    name="incident_date" 
                    type="date"
                    className="w-full bg-[#0A0A0A] border border-white/20 p-2.5 text-white text-xs outline-none focus:border-white/50 transition-colors" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-mono text-[11px] uppercase tracking-wider">Location / Jurisdiction *</label>
                <input 
                  required 
                  name="location" 
                  type="text" 
                  placeholder="e.g. Connaught Place, New Delhi or Cloud VPC Zone"
                  className="w-full bg-white/[0.02] border border-white/20 p-2.5 text-white text-xs outline-none focus:border-white/50 transition-colors placeholder-white/20" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 mb-1 font-mono text-[11px] uppercase tracking-wider">Complainant / Entity Name *</label>
                  <input 
                    required 
                    name="complainant_name" 
                    type="text" 
                    placeholder="Complainant or Corporate Victim"
                    className="w-full bg-white/[0.02] border border-white/20 p-2.5 text-white text-xs outline-none focus:border-white/50 transition-colors placeholder-white/20" 
                  />
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-mono text-[11px] uppercase tracking-wider">Accused / Suspect Actor</label>
                  <input 
                    name="accused_name" 
                    type="text" 
                    placeholder="Suspect name, alias, or threat actor handle"
                    className="w-full bg-white/[0.02] border border-white/20 p-2.5 text-white text-xs outline-none focus:border-white/50 transition-colors placeholder-white/20" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1.5 font-mono text-[11px] uppercase tracking-wider">Applicable Legal / Statutory Sections</label>
                <div className="flex flex-wrap gap-1.5">
                  {IPC_SECTIONS.map(s => (
                    <button 
                      key={s} 
                      type="button" 
                      onClick={() => toggleSection(s)}
                      className={`text-[11px] px-2.5 py-1 font-mono transition-all ${
                        selectedSections.includes(s)
                          ? 'bg-white text-black font-semibold'
                          : 'bg-white/[0.03] text-white/50 border border-white/15 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-mono text-[11px] uppercase tracking-wider">Brief Description</label>
                <textarea 
                  name="description" 
                  rows={3} 
                  placeholder="Initial incident findings..."
                  className="w-full bg-white/[0.02] border border-white/20 p-2.5 text-white text-xs outline-none focus:border-white/50 transition-colors resize-none placeholder-white/20" 
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-white/20 text-white/70 hover:text-white hover:bg-white/5 font-mono text-xs py-2.5 rounded-full transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-white hover:bg-stone-200 text-black font-semibold text-xs py-2.5 rounded-full transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-black" /> Register Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
