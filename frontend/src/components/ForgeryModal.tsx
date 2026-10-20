'use client';
import { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, ExternalLink, MapPin, Camera, Laptop, X, Eye } from 'lucide-react';
import { getFileUrl } from '@/lib/clientForensics';

interface ForgeryModalProps {
  artifact: any;
  onClose: () => void;
}

export default function ForgeryModal({ artifact, onClose }: ForgeryModalProps) {
  const [activeTab, setActiveTab] = useState<'ELA' | 'EXIF'>('ELA');

  if (!artifact) return null;

  const parseJsonSafe = (val: any) => {
    if (!val) return {};
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return {}; }
  };

  const fDetails = parseJsonSafe(artifact.forgery_details);
  const meta = parseJsonSafe(artifact.metadata);
  const tamperScore = artifact.forgery_score ?? fDetails.tamper_score ?? 0;
  const isTampered = tamperScore >= 45.0;

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const originalUrl = getFileUrl(artifact.file_path);
  const elaUrl = fDetails.ela_image_file ? getFileUrl(fDetails.ela_image_file) : null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isTampered ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">AI Forgery & Metadata Diagnostics</h3>
              <p className="text-xs text-slate-500 font-mono">{artifact.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">✕</button>
        </div>

        {/* Score Banner */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isTampered ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black ${isTampered ? 'text-red-600' : 'text-emerald-700'}`}>
                {tamperScore}%
              </span>
              <span className={`font-bold text-sm ${isTampered ? 'text-red-700' : 'text-emerald-800'}`}>
                {isTampered ? '🚨 SPLICING / PIXEL FORGERY DETECTED' : '✅ AUTHENTIC / UNIFORM COMPRESSION'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{fDetails.summary || 'Error Level Analysis completed.'}</p>
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setActiveTab('ELA')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'ELA' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600 hover:bg-slate-100'
              }`}
            >
              Error Level Analysis (ELA)
            </button>
            <button
              onClick={() => setActiveTab('EXIF')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'EXIF' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600 hover:bg-slate-100'
              }`}
            >
              EXIF & GPS Metadata
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'ELA' ? (
            <div className="space-y-6">
              {/* Image side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-xl p-3 bg-slate-50">
                  <div className="font-bold text-xs text-slate-700 mb-2">Original Exhibit</div>
                  <div className="bg-slate-900/10 rounded-lg h-64 flex items-center justify-center overflow-hidden">
                    <img src={originalUrl} alt="Original" className="max-h-full object-contain" />
                  </div>
                </div>

                <div className="border rounded-xl p-3 bg-slate-50">
                  <div className="font-bold text-xs text-slate-700 mb-2 flex items-center justify-between">
                    <span>Error Level Analysis (ELA) Diff Overlay</span>
                    <span className="text-[10px] text-blue-600 font-bold">JPEG 92% Recompression</span>
                  </div>
                  <div className="bg-black rounded-lg h-64 flex items-center justify-center overflow-hidden">
                    {elaUrl ? (
                      <img src={elaUrl} alt="ELA Diff" className="max-h-full object-contain" />
                    ) : (
                      <div className="text-slate-400 text-xs">ELA visualization not available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tamper indicators */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Forensic Indicators</h4>
                {(fDetails.tamper_indicators || []).length === 0 ? (
                  <p className="text-xs text-slate-500">No abnormal pixel compression anomalies detected.</p>
                ) : (
                  <ul className="space-y-1.5 text-xs text-red-700">
                    {(fDetails.tamper_indicators || []).map((ind: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Metadata Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border rounded-xl p-4 space-y-3 text-xs">
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" /> Device & Camera Signature
                  </div>
                  <div>Make: <strong className="text-slate-800">{meta.camera_make || 'Not Recorded / Stripped'}</strong></div>
                  <div>Model: <strong className="text-slate-800">{meta.camera_model || 'Not Recorded / Stripped'}</strong></div>
                  <div>Original Date: <strong className="text-slate-800">{meta.date_original || 'N/A'}</strong></div>
                </div>

                <div className="bg-slate-50 border rounded-xl p-4 space-y-3 text-xs">
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-purple-600" /> Software & Editing Footprints
                  </div>
                  <div>Software: <strong className="text-slate-800">{meta.software || 'None (Camera Default)'}</strong></div>
                  {meta.software && (
                    <div className="text-red-600 font-bold bg-red-50 p-2 rounded">
                      ⚠️ File contains signatures of external photo manipulation software.
                    </div>
                  )}
                </div>
              </div>

              {/* Geolocation */}
              <div className="bg-slate-50 border rounded-xl p-4 text-xs">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-2">
                  <MapPin className="w-4 h-4 text-red-600" /> Embedded GPS Coordinates
                </div>
                {meta.gps_latitude && meta.gps_longitude ? (
                  <div className="flex items-center justify-between bg-white border p-3 rounded-lg">
                    <div>
                      <div>Latitude: <strong className="font-mono">{meta.gps_latitude}</strong></div>
                      <div>Longitude: <strong className="font-mono">{meta.gps_longitude}</strong></div>
                    </div>
                    <a
                      href={meta.gps_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <span>View on Maps</span> <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-slate-500">No embedded GPS latitude/longitude found in EXIF header.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button onClick={onClose} className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-800">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
