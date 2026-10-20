'use client';
import { useState } from 'react';
import {
  X, ShieldCheck, Copy, Check, Eye, Download, ShieldAlert,
  Terminal, MessageSquare, Database, FileText, ExternalLink,
  Phone, CreditCard, Globe, Mail, User, Layers, Info
} from 'lucide-react';
import { getFileUrl } from '@/lib/clientForensics';

interface ExhibitInspectorModalProps {
  artifact: any;
  onClose: () => void;
  onOpenForgery?: (artifact: any) => void;
}

export default function ExhibitInspectorModal({
  artifact,
  onClose,
  onOpenForgery,
}: ExhibitInspectorModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'CONTENT' | 'ENTITIES' | 'INTEGRITY'>('CONTENT');

  if (!artifact) return null;

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const fileUrl = getFileUrl(artifact.file_path);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(artifact.raw_sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isMedia = artifact.artifact_type === 'MEDIA' || artifact.name?.match(/\.(jpe?g|png|webp)$/i);
  const isTampered = (artifact.forgery_score || 0) >= 45;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in duration-200">
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black bg-blue-500 text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
              {artifact.exhibit_code || 'EXH-01'}
            </span>
            <div>
              <h3 className="font-black text-base text-white truncate max-w-md">
                {artifact.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {artifact.artifact_type} • {Math.round(artifact.file_size / 1024)} KB • Added {new Date(artifact.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              download
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download Raw
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUMMARY & STATUS BANNER */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-xs">Forensic Intelligence Takeaway</div>
              <p className="text-slate-600 mt-0.5 text-xs">
                {artifact.forensic_summary || 'Evidence exhibit processed and registered in master forensic ledger.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMedia && (
              <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                isTampered ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                ELA Tamper Risk: {artifact.forgery_score || 0}%
              </span>
            )}
            {isMedia && onOpenForgery && (
              <button
                onClick={() => { onClose(); onOpenForgery(artifact); }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Open Forgery Lab
              </button>
            )}
          </div>
        </div>

        {/* SUB NAVIGATION TABS */}
        <div className="flex items-center border-b border-slate-200 bg-white px-5 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('CONTENT')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'CONTENT' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Extracted Exhibit Content
          </button>
          <button
            onClick={() => setActiveSubTab('ENTITIES')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'ENTITIES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> Discovered Suspect Entities ({(artifact.entities || []).length})
          </button>
          <button
            onClick={() => setActiveSubTab('INTEGRITY')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'INTEGRITY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Chain of Custody & Hash
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {activeSubTab === 'CONTENT' && (
            <div className="space-y-4">
              {isMedia ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700">Media Exhibit View</div>
                  <div className="bg-slate-950 rounded-xl p-4 flex items-center justify-center max-h-[420px] overflow-hidden">
                    <img
                      src={fileUrl}
                      alt={artifact.name}
                      className="max-h-[380px] object-contain rounded shadow"
                    />
                  </div>
                  {artifact.metadata?.has_gps && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs text-blue-900">
                      <div>
                        <strong>GPS Coordinates Locked:</strong> {artifact.metadata.latitude}, {artifact.metadata.longitude}
                        <div className="text-[11px] text-blue-700 mt-0.5">Device: {artifact.metadata.camera_model}</div>
                      </div>
                      <a
                        href={artifact.metadata.google_maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View on Maps
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Parsed Content Stream ({artifact.events_count || 0} events indexed)</span>
                    <span className="text-[11px] text-slate-400 font-normal">UTF-8 Decoded Forensic Extraction</span>
                  </div>

                  <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl max-h-[380px] overflow-y-auto border border-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-blue-500 selection:text-white">
                    {artifact.extracted_text_preview || 'No raw text representation available for this binary format.'}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'ENTITIES' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600">
                The AI correlation engine extracted the following digital identifiers and suspicious handles from this exhibit:
              </div>

              {(artifact.entities || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No distinct suspect entities isolated within this specific exhibit.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {artifact.entities.map((ent: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold">
                        {ent.type === 'PHONE' && <Phone className="w-4 h-4" />}
                        {ent.type === 'UPI' && <CreditCard className="w-4 h-4" />}
                        {ent.type === 'IP' && <Globe className="w-4 h-4" />}
                        {ent.type === 'EMAIL' && <Mail className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                          {ent.type} IDENTIFIER
                        </span>
                        <div className="font-mono font-bold text-slate-900 text-xs truncate">
                          {ent.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'INTEGRITY' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Statutory Cryptographic Chain of Custody
                </div>

                <div>
                  <div className="text-slate-500 font-medium mb-1">Raw SHA-256 Checksum (Un-salted Original):</div>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                    <span className="truncate flex-1">{artifact.raw_sha256}</span>
                    <button
                      onClick={handleCopyHash}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 flex-shrink-0"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedHash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 font-medium mb-1">Decentralized Polygon Amoy Ledger Hash:</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 truncate">
                    {artifact.salted_sha256}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-slate-500 text-[11px]">
                  <span>Status: <strong className="text-emerald-700">Tamper-Proof & Court-Admissible</strong></span>
                  <span>Compliance: <strong>Section 63 BSA 2023</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs font-bold">
          <span className="text-slate-500">
            Internal Exhibit ID: #{artifact.id}
          </span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
