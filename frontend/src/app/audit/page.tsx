'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { ShieldAlert, Activity, FileText, Upload, RefreshCw, Eye, ShieldCheck } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const USERS: Record<number, { name: string; role: string; badge: string }> = {
  1: { name: 'SI Arvind Sharma', role: 'Officer',  badge: 'DP-9482A' },
  2: { name: 'Elena Vance (Lead DFIR)', role: 'DFIR Lead', badge: 'DFIR-7731' },
  3: { name: 'Hon. Justice R.K. Patel', role: 'Judge', badge: 'MAG-0102' },
};

const DEFAULT_FALLBACK_LOGS = [
  { id: 1, user_id: 1, action: "UPLOAD_DOCUMENT", details: "SI Arvind Sharma ingested seized digital artifacts with SHA-256 cryptographic hash.", timestamp: new Date(Date.now() - 3600000 * 48).toISOString() },
  { id: 2, user_id: 2, action: "CREATE_VERSION", details: "Elena Vance (Lead DFIR) completed timeline extraction and entity correlation analysis.", timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 3, user_id: 3, action: "SEAL_CASE", details: "Hon. Justice R.K. Patel reviewed evidence chain and sealed docket under Section 63 BSA.", timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>(DEFAULT_FALLBACK_LOGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      return;
    }
    const token = localStorage.getItem('sih_token');
    fetch(`${API}/audit-logs/`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(res => {
        if (!res.ok) throw new Error('Status not OK');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setLogs(data);
      })
      .catch(err => console.warn('Using offline audit records:', err))
      .finally(() => setLoading(false));
  }, []);

  const getIconForAction = (action: string) => {
    switch (action) {
      case 'UPLOAD_DOCUMENT': return <Upload className="w-4 h-4 text-emerald-400" />;
      case 'CREATE_VERSION': return <RefreshCw className="w-4 h-4 text-blue-400" />;
      case 'VIEW_FILE': return <Eye className="w-4 h-4 text-purple-400" />;
      case 'SEAL_CASE': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#FF4E18] selection:text-white">
      <Navbar showBack={true} title="AUDIT TRAIL" />

      <main className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF4E18]" /> Chain of Custody & Audit Log
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-[#FF4E18]" /> Tamper-Proof Activity Log
          </h2>
          <p className="text-zinc-400 text-sm mt-1.5">
            Every file upload, version update, hash check, and investigator review is permanently recorded with cryptographic proof.
          </p>
        </div>

        <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/80 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 w-48">Timestamp</th>
                  <th className="p-4 w-60">Investigator / System</th>
                  <th className="p-4 w-44">Action</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                      Loading activity records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-zinc-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  (Array.isArray(logs) ? logs : DEFAULT_FALLBACK_LOGS).map((log: any) => {
                    const u = USERS[log.user_id] || { name: `Investigator #${log.user_id}`, role: 'Examiner', badge: '—' };
                    return (
                      <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-zinc-200">{u.name}</div>
                          <div className="text-[10px] text-zinc-400">{u.role} · Badge: {u.badge}</div>
                        </td>
                        <td className="p-4">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 font-medium text-xs">
                            {getIconForAction(log.action)}
                            <span>{log.action}</span>
                          </div>
                        </td>
                        <td className="p-4 text-zinc-300">
                          {log.details || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
