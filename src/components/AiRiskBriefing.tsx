import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, ShieldCheck, Layers, Eye } from 'lucide-react';
import { AiBriefingData, SnapshotData } from '../types/snapshot';

interface AiRiskBriefingProps {
  initialBriefing?: AiBriefingData | null;
  snapshot: SnapshotData | null;
}

export const AiRiskBriefing: React.FC<AiRiskBriefingProps> = ({
  initialBriefing,
  snapshot,
}) => {
  const [briefing, setBriefing] = useState<AiBriefingData | null>(initialBriefing || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAiBriefing = async () => {
    if (!snapshot) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-risk-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crypto: snapshot.crypto,
          commodities: snapshot.commodities,
          headlines: snapshot.news,
        }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setBriefing(data);
    } catch (err: any) {
      console.error('Failed to generate briefing:', err);
      setError('Could not synthesize fresh briefing. Displaying baseline intelligence model.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!briefing && snapshot) {
      fetchAiBriefing();
    }
  }, [snapshot]);

  const threatColor =
    briefing?.threatPosture === 'Severe' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
    briefing?.threatPosture === 'High' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
    briefing?.threatPosture === 'Elevated' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  return (
    <div id="ai-synthesis" className="bg-[#111827] border border-slate-800 rounded-xl p-5 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Macro Risk &amp; Conflict Synthesis
            </h3>
            <div className="text-xs font-mono text-slate-400">
              CROSS-ASSET TRANSMISSION &amp; GEOPOLITICAL IMPACT MODEL
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {briefing?.threatPosture && (
            <div className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${threatColor}`}>
              POSTURE: {briefing.threatPosture.toUpperCase()}
            </div>
          )}

          <button
            onClick={fetchAiBriefing}
            disabled={loading || !snapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50 font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>{loading ? 'Synthesizing...' : 'Regenerate Briefing'}</span>
          </button>
        </div>
      </div>

      {loading && !briefing ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <span>Synthesizing live prices, commodities, and global conflict headlines...</span>
        </div>
      ) : briefing ? (
        <div className="mt-4 space-y-4">
          {/* Executive Briefing */}
          <div className="bg-[#0B0F19] border border-slate-800/80 p-4 rounded-lg">
            <div className="text-xs font-mono text-amber-400 mb-1.5 flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5" />
              EXECUTIVE SITUATION SUMMARY
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {briefing.executiveBriefing}
            </p>
          </div>

          {/* Vectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0B0F19] border border-slate-800/80 p-4 rounded-lg">
              <div className="text-xs font-mono text-yellow-400 mb-1.5 flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                COMMODITY SUPPLY &amp; SAFE-HAVEN DYNAMICS
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {briefing.commodityImpact}
              </p>
            </div>

            <div className="bg-[#0B0F19] border border-slate-800/80 p-4 rounded-lg">
              <div className="text-xs font-mono text-emerald-400 mb-1.5 flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                CRYPTO &amp; LIQUIDITY SENSITIVITY
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {briefing.cryptoSensitivity}
              </p>
            </div>
          </div>

          {/* Strategic Watchpoint */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-lg flex items-start gap-3">
            <Eye className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-slate-300">
              <span className="text-amber-400 font-semibold mr-1.5">STRATEGIC WATCHPOINT:</span>
              <span>{briefing.strategicTakeaway}</span>
            </div>
          </div>

          {/* Unboxed Metadata Footer */}
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1">
            <span>MODEL: {briefing.source || 'Gemini 3.8 Flash Macro Risk Engine'}</span>
            <span>SYNTHESIS TIME: {new Date(briefing.generatedAt || Date.now()).toLocaleTimeString()}</span>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-500 font-mono">
          Ready to generate live risk synthesis. Click "Regenerate Briefing" above.
        </div>
      )}
    </div>
  );
};
