import React from 'react';
import { ShieldAlert, TrendingUp, TrendingDown, Clock, Globe } from 'lucide-react';
import { MacroRegime } from '../types/snapshot';

interface MacroHeaderProps {
  lastUpdated: string;
  regime: MacroRegime;
  autoRefreshCountdown: number;
}

export const MacroHeader: React.FC<MacroHeaderProps> = ({
  lastUpdated,
  regime,
  autoRefreshCountdown,
}) => {
  const updateDate = new Date(lastUpdated);

  // UTC Standard Formatting
  const utcDate = updateDate.toISOString().slice(0, 10);
  const utcTime = updateDate.toTimeString().slice(0, 8);

  // Local Time Formatting
  const localFormatted = updateDate.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div id="overview" className="border-b border-slate-800/80 bg-gradient-to-b from-[#0F172A]/40 to-transparent py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Unboxed Metadata kicker (Zero-Pill Discipline) with clear UTC & Local Time */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Globe className="w-3.5 h-3.5 animate-pulse" />
            LIVE INTELLIGENCE STREAM
          </span>
          <span aria-hidden="true">·</span>
          <span>FEED: COINGECKO / NYMEX / COMEX / REUTERS RSS</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="font-semibold text-amber-300 tabular-nums">{utcDate} {utcTime} UTC</span>
            <span className="text-slate-500 font-normal">({localFormatted})</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-500">
            AUTO-SYNC IN <span className="text-amber-400 tabular-nums font-semibold">{autoRefreshCountdown}s</span>
          </span>
        </div>

        {/* Primary Editorial Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white" style={{ textWrap: 'balance' }}>
              Macro, Crypto &amp; Conflict Snapshot
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real-time cross-asset intelligence tracking the nexus between geopolitical conflict, safe-haven physical commodities (Crude Oil &amp; Gold), and digital risk-on assets (Bitcoin).
            </p>
          </div>

          {/* Current Macro Regime Posture */}
          <div className="flex items-start sm:items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-lg shrink-0">
            <div className={`p-2 rounded ${
              regime.tone === 'critical' ? 'bg-rose-500/10 text-rose-400' :
              regime.tone === 'warning' ? 'bg-amber-500/10 text-amber-400' :
              regime.tone === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              {regime.tone === 'critical' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : regime.tone === 'positive' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Macro Posture
              </div>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>{regime.status}</span>
                <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                  — {regime.summary}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
