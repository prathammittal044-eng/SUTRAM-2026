'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, Download, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { getLocalBSACert } from '@/lib/clientForensics';

interface BSACertificateModalProps {
  caseId: number | string;
  caseData?: any;
  meta?: any;
  exhibits?: any[];
  currentUser?: any;
  onClose: () => void;
}

export default function BSACertificateModal({
  caseId,
  caseData,
  meta,
  exhibits,
  currentUser,
  onClose
}: BSACertificateModalProps) {
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    let active = true;
    const loadCert = async () => {
      try {
        if (process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
          const res = await fetch(`${API}/cases/${caseId}/bsa-certificate/`);
          if (res.ok) {
            const data = await res.json();
            if (active && data?.certificate_id) {
              setCertData(data);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('BSA API unavailable, using verified local certificate:', err);
      }
      if (active) {
        setCertData(getLocalBSACert(caseId, caseData, meta, exhibits, currentUser));
        setLoading(false);
      }
    };
    loadCert();
    return () => { active = false; };
  }, [caseId, caseData, meta, exhibits, currentUser]);

  const handlePrint = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      window.open(`${API}/cases/${caseId}/bsa-certificate/html/`, '_blank');
    } else {
      window.print();
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-serif">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-100 font-sans">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-700" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Bharatiya Sakshya Adhiniyam, 2023 — Section 63 Certificate</h3>
              <p className="text-xs text-slate-500 font-mono">Case #{certData?.case_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF Export
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5">✕</button>
          </div>
        </div>

        {/* Certificate Body (Court document style) */}
        <div className="p-8 overflow-y-auto flex-1 text-slate-900 leading-relaxed text-sm bg-[#fafafa]">
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <h2 className="text-xl font-bold uppercase tracking-wider">Government of India / State Police</h2>
            <h3 className="text-base font-bold mt-1">CERTIFICATE UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023</h3>
            <p className="text-xs italic text-slate-600">(For Proof and Admissibility of Electronic Records in Court)</p>
            <div className="text-xs font-mono mt-2 text-slate-500">Certificate ID: {certData?.certificate_id}</div>
          </div>

          <div className="mb-6 font-sans text-xs bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <div><strong>Case Number:</strong> {certData?.case_number}</div>
            <div><strong>Case Title:</strong> {certData?.case_title}</div>
            <div><strong>Decentralized Anchoring:</strong> {certData?.blockchain_verification_network}</div>
          </div>

          {/* Part A */}
          <div className="font-bold uppercase text-xs underline mb-2 tracking-wide">
            PART A: Identification of Electronic Records & Cryptographic Fingerprints
          </div>
          <table className="w-full text-xs border-collapse border border-slate-400 mb-6 bg-white">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-400 p-2 text-left">Exhibit</th>
                <th className="border border-slate-400 p-2 text-left">Artifact Description</th>
                <th className="border border-slate-400 p-2 text-left">SHA-256 (Raw Un-salted)</th>
                <th className="border border-slate-400 p-2 text-left">Size</th>
              </tr>
            </thead>
            <tbody>
              {(certData?.part_a_exhibits || []).map((ex: any, idx: number) => (
                <tr key={idx}>
                  <td className="border border-slate-400 p-2 font-mono font-bold">{ex.exhibit_no}</td>
                  <td className="border border-slate-400 p-2">{ex.artifact_name}</td>
                  <td className="border border-slate-400 p-2 font-mono text-[10px] break-all">{ex.un_salted_sha256}</td>
                  <td className="border border-slate-400 p-2">{ex.file_size_bytes} B</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Part B */}
          <div className="font-bold uppercase text-xs underline mb-2 tracking-wide">
            PART B: Statutory Declaration under Section 63 BSA 2023
          </div>
          <div className="text-justify whitespace-pre-line text-xs bg-white p-4 border border-slate-300 rounded mb-8">
            {certData?.part_b_declaration}
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end font-sans pt-4">
            <div className="w-40 h-20 border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400 text-center">
              OFFICIAL SEAL OF<br />INVESTIGATING AGENCY
            </div>
            <div className="text-right text-xs">
              <div className="font-bold">{certData?.officer?.name}</div>
              <div className="text-slate-600">{certData?.officer?.role} (Badge: {certData?.officer?.badge})</div>
              <div className="text-slate-500">{certData?.officer?.department}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
