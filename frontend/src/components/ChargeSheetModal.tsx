'use client';
import { useState, useEffect } from 'react';
import {
  X, Printer, Download, ShieldCheck, FileText, CheckCircle2,
  AlertTriangle, ExternalLink, Scale, Building2, User, Phone,
  CreditCard, Globe, Calendar, BadgePercent, Lock, ShieldAlert
} from 'lucide-react';
import { getLocalChargeSheet } from '@/lib/clientForensics';

interface ChargeSheetModalProps {
  caseId: number | string;
  onClose: () => void;
}

export default function ChargeSheetModal({ caseId, onClose }: ChargeSheetModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchChargeSheet();
  }, [caseId]);

  const fetchChargeSheet = async () => {
    setLoading(true);
    setError(null);
    try {
      if (process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
        const res = await fetch(`${API}/cases/${caseId}/charge-sheet/`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.court_name) {
            setData(json);
            setLoading(false);
            return;
          }
        }
      }
    } catch (err: any) {
      console.warn('Backend unavailable, using verified local charge-sheet:', err);
    }
    setData(getLocalChargeSheet(caseId));
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Charge_Sheet_${data.fir_number || caseId}_BNSS_193.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* TOP BAR / CONTROLS (Hidden during print) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">POLICE REPORT / FINAL CHARGE-SHEET</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
                  Section 193 BNSS, 2023
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Statutory Final Report for Judicial Cognizance • Bharatiya Nagarik Suraksha Sanhita
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading || !!error}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={handleDownloadJson}
              disabled={loading || !!error}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> JSON Dossier
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-slate-800 font-serif leading-relaxed print:p-4 print:text-black">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-3" />
              <p className="text-xs font-sans font-medium">Assembling statutory charge-sheet dossier...</p>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-xl text-center font-sans">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="font-bold text-sm">Failed to generate Charge-Sheet</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}

          {data && !loading && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* COURT HEADER */}
              <div className="text-center border-b-2 border-slate-900 pb-5">
                <div className="text-xs uppercase tracking-widest font-sans font-bold text-slate-500 mb-1">
                  Form No. 193 — Police Final Report (Charge-Sheet)
                </div>
                <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-slate-950 font-serif">
                  {data.court_name}
                </h1>
                <p className="text-xs sm:text-sm font-sans font-semibold text-slate-700 mt-1">
                  Under Section 193 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs font-sans">
                  <span className="font-bold">FIR No: <span className="font-mono text-blue-700">{data.fir_number}</span></span>
                  <span className="font-bold">Dated: <span className="font-mono">{data.fir_date}</span></span>
                  <span className="font-bold">Police Station: <span className="font-medium">{data.police_station}</span></span>
                </div>
              </div>

              {/* STATUTORY PENAL PROVISIONS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-sans">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-600" /> Penal & Statutory Sections Invoked:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {data.statutory_provisions?.map((sec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5 bg-white p-2 rounded-lg border border-slate-200 font-medium">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{sec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PARTIES PARTICULARS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                {/* Complainant Card */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" /> 1. Complainant / Informant
                  </div>
                  <div className="space-y-1.5 text-slate-700">
                    <div><span className="font-bold">Name:</span> {data.complainant?.name}</div>
                    <div><span className="font-bold">Contact:</span> <span className="font-mono">{data.complainant?.contact}</span></div>
                    <div><span className="font-bold">Address:</span> {data.complainant?.address}</div>
                    <div><span className="font-bold">Financial Loss:</span> <strong className="text-red-700">{data.complainant?.loss_amount}</strong></div>
                  </div>
                </div>

                {/* Accused Card */}
                <div className="border border-red-200 rounded-xl p-4 bg-red-50/30">
                  <div className="font-bold text-red-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" /> 2. Accused Person(s)
                  </div>
                  <div className="space-y-1.5 text-slate-800">
                    <div><span className="font-bold">Name & Alias:</span> <strong className="text-red-900">{data.accused?.name}</strong></div>
                    <div><span className="font-bold">Phone Number:</span> <span className="font-mono font-bold">{data.accused?.phone}</span></div>
                    <div><span className="font-bold">Mule UPI VPA:</span> <span className="font-mono">{data.accused?.upi_beneficiary}</span></div>
                    <div><span className="font-bold">Intrusion IP:</span> <span className="font-mono">{data.accused?.origin_ip}</span></div>
                    <div><span className="font-bold">Custody Status:</span> <strong className="text-emerald-700">{data.accused?.arrest_status}</strong></div>
                  </div>
                </div>
              </div>

              {/* BRIEF FACTS & MODUS OPERANDI */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 font-sans flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" /> 3. Brief Facts of the Case & Modus Operandi
                </h3>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed text-justify space-y-3 font-serif">
                  <p>{data.modus_operandi}</p>
                  <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 font-sans text-xs">
                    <strong className="text-blue-900">AI Forensic Corroboration: </strong>
                    {data.ai_forensic_findings}
                  </p>
                </div>
              </div>

              {/* SCHEDULE OF EXHIBITS */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 font-sans flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> 4. Schedule of Electronic & Digital Exhibits (Section 63 BSA Admissibility)
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Exhibit</th>
                        <th className="p-2.5">Artifact Name & Type</th>
                        <th className="p-2.5">Cryptographic SHA-256 Hash</th>
                        <th className="p-2.5">Forensic Analysis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.exhibits?.map((ex: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-blue-700">{ex.exhibit_no}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900">{ex.name}</div>
                            <div className="text-[10px] text-slate-500">{ex.type}</div>
                          </td>
                          <td className="p-2.5 font-mono text-[10px] text-slate-600 break-all max-w-[200px]">
                            {ex.raw_sha256}
                          </td>
                          <td className="p-2.5">
                            {ex.is_tampered ? (
                              <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] bg-red-100 text-red-700 border border-red-200">
                                Altered (ELA {ex.forgery_score}%)
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Verified Bitstream
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BLOCKCHAIN AUDIT PROOF */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 font-sans text-xs">
                <div className="font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-700" /> 5. Immutable Blockchain Custody Anchoring
                </div>
                <div className="text-slate-700 space-y-1">
                  <div><span className="font-bold">Ledger Network:</span> {data.blockchain_anchoring?.network}</div>
                  <div><span className="font-bold">Evidence Registry Contract:</span> <span className="font-mono text-[11px] font-bold text-blue-800">{data.blockchain_anchoring?.smart_contract}</span></div>
                  <div><span className="font-bold">Security Standard:</span> {data.blockchain_anchoring?.verification_method}</div>
                </div>
              </div>

              {/* PRAYER */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 font-sans">
                  6. Prayer / Judicial Submission
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed text-justify font-serif p-4 bg-slate-50 rounded-xl border border-slate-200">
                  "{data.prayer}"
                </p>
              </div>

              {/* SIGNATURE BLOCK */}
              <div className="pt-8 grid grid-cols-2 gap-8 font-sans text-xs">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-400 min-h-[100px]">
                  <Scale className="w-6 h-6 mb-1 opacity-50" />
                  <span className="font-bold text-[10px] uppercase">Official Seal of Cyber Crime Bureau</span>
                  <span className="text-[9px]">Mandir Marg, New Delhi</span>
                </div>

                <div className="text-right space-y-1 flex flex-col justify-end">
                  <div className="font-serif italic text-sm text-slate-900">Signed & Submitted,</div>
                  <div className="font-bold text-slate-900">{data.investigating_officer?.name}</div>
                  <div className="text-slate-600">{data.investigating_officer?.rank} • Badge #{data.investigating_officer?.badge_no}</div>
                  <div className="text-slate-500 text-[11px]">{data.investigating_officer?.police_unit}</div>
                  <div className="text-slate-400 text-[10px]">Date of Submission: {data.fir_date}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
