'use client';

import { useState } from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert, Filter, Search, Terminal, MessageSquare, DollarSign, FileCode, Sparkles } from 'lucide-react';

interface ForensicEvent {
  id: number;
  timestamp: string;
  event_type: string;
  description: string;
  actor?: string;
  target?: string;
  severity: string;
  is_anomaly: boolean;
  source: string;
}

interface MasterTimelineProps {
  events: ForensicEvent[];
  onSynthesize?: () => void;
}

export default function MasterTimeline({ events, onSynthesize }: MasterTimelineProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = (events || []).filter(e => {
    const matchesSev = filterSeverity === 'ALL' || e.severity === filterSeverity || (filterSeverity === 'ANOMALY' && e.is_anomaly);
    const descMatch = (e.description || '').toLowerCase().includes(search.toLowerCase());
    const actorMatch = (e.actor || '').toLowerCase().includes(search.toLowerCase());
    const sourceMatch = (e.source || '').toLowerCase().includes(search.toLowerCase());
    const matchesSearch = !search || descMatch || actorMatch || sourceMatch;
    return matchesSev && matchesSearch;
  });

  const getEventIcon = (type?: string) => {
    const t = type || '';
    if (t.includes('NETWORK') || t.includes('LOG')) return <Terminal className="w-3.5 h-3.5 text-white/60" />;
    if (t.includes('CHAT')) return <MessageSquare className="w-3.5 h-3.5 text-white/60" />;
    if (t.includes('FINANCIAL') || t.includes('UPI')) return <DollarSign className="w-3.5 h-3.5 text-[#FFA95A]" />;
    return <FileCode className="w-3.5 h-3.5 text-white/60" />;
  };

  const getSeverityBadge = (severity: string, isAnomaly: boolean) => {
    if (isAnomaly) {
      return (
        <span className="bg-[#FF4E18]/10 text-[#FF4E18] font-mono font-bold text-[9px] px-2 py-0.5 rounded flex items-center gap-1 border border-[#FF4E18]/30">
          <ShieldAlert className="w-3 h-3 text-[#FF4E18]" /> ML ANOMALY
        </span>
      );
    }
    switch (severity) {
      case 'CRITICAL':
        return <span className="bg-white/10 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded border border-white/20">CRITICAL</span>;
      case 'WARNING':
        return <span className="bg-[#FFA95A]/10 text-[#FFA95A] border border-[#FFA95A]/30 font-mono font-bold text-[9px] px-2 py-0.5 rounded">WARNING</span>;
      default:
        return <span className="bg-white/5 text-white/50 border border-white/10 font-mono text-[9px] px-2 py-0.5 rounded">INFO</span>;
    }
  };

  return (
    <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 shadow-sm overflow-hidden font-sans">
      {/* Controls Bar */}
      <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider">
            Incident Timeline
          </h3>
          <span className="text-[11px] bg-zinc-800 text-zinc-300 font-medium px-2 py-0.5 rounded border border-zinc-700/60">
            {filtered.length} Events
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-xs bg-zinc-900 text-zinc-200 border border-zinc-700/70 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-zinc-500 w-48 placeholder-zinc-500"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
          </div>

          <div className="flex items-center gap-1 text-xs">
            {['ALL', 'CRITICAL', 'WARNING', 'ANOMALY'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {onSynthesize && (
            <button
              onClick={onSynthesize}
              className="bg-[#FF4E18] hover:bg-[#e04515] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ml-1"
              title="Re-synthesize timeline events from uploaded exhibits and metadata"
            >
              <Sparkles className="w-3.5 h-3.5" /> Re-Synthesize
            </button>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="p-6 max-h-[620px] overflow-y-auto bg-zinc-950/30">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30 text-zinc-400" />
            <p className="font-medium text-xs mb-3">No timeline events recorded yet or filter matched 0 items.</p>
            {onSynthesize && (
              <button
                onClick={onSynthesize}
                className="bg-[#FF4E18] hover:bg-[#e04515] text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" /> Synthesize Timeline from Exhibits
              </button>
            )}
          </div>
        ) : (
          <div className="relative border-l border-zinc-800 ml-4 space-y-5">
            {filtered.map((ev, i) => (
              <div key={ev.id || i} className="relative pl-6">
                {/* Timeline node dot */}
                <div className={`absolute -left-[7px] top-2 w-3.5 h-3.5 rounded-full border-2 border-black flex items-center justify-center ${
                  ev.is_anomaly ? 'bg-[#FF4E18]' :
                  ev.severity === 'CRITICAL' ? 'bg-white' :
                  ev.severity === 'WARNING' ? 'bg-[#FFA95A]' : 'bg-white/40'
                }`}></div>

                {/* Event Card */}
                <div className={`p-4 rounded-lg border transition-all ${
                  ev.is_anomaly ? 'bg-[#FF4E18]/5 border-[#FF4E18]/30 shadow-md' :
                  ev.severity === 'CRITICAL' ? 'bg-white/[0.04] border-white/20' :
                  ev.severity === 'WARNING' ? 'bg-[#FFA95A]/5 border-[#FFA95A]/20' :
                  'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-white/5">
                        {getEventIcon(ev.event_type)}
                      </div>
                      <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {ev.timestamp.replace('T', ' ').replace('Z', ' UTC')}
                      </span>
                      {getSeverityBadge(ev.severity, ev.is_anomaly)}
                    </div>
                    <span className="text-[10px] text-white/40">
                      Source: <span className="text-[#FFA95A] font-semibold">{ev.source}</span>
                    </span>
                  </div>

                  <p className="text-xs text-white/90 leading-relaxed font-sans font-normal">
                    {ev.description}
                  </p>

                  {(ev.actor || ev.target) && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-4 text-xs font-mono text-white/50">
                      {ev.actor && (
                        <div>Actor / Origin: <strong className="text-white font-medium">{ev.actor}</strong></div>
                      )}
                      {ev.target && (
                        <div>Target / Recipient: <strong className="text-[#FFA95A] font-medium">{ev.target}</strong></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
