import React from 'react';
import { ArrowUpRight, ArrowDownRight, Flame, Shield, Activity, Bell } from 'lucide-react';
import { CommodityAsset } from '../types/snapshot';
import { AssetSparkline } from './AssetSparkline';

interface CommodityCardProps {
  asset: CommodityAsset;
  type: 'oil' | 'gold';
  brentAsset?: CommodityAsset;
  onSetAlert?: () => void;
}

export const CommodityCard: React.FC<CommodityCardProps> = ({
  asset,
  type,
  brentAsset,
  onSetAlert,
}) => {
  const isPositive = asset.dailyChange >= 0;
  const isOil = type === 'oil';

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        {/* Unboxed Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${
              isOil ? 'bg-amber-500/10 text-amber-400' : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              {isOil ? <Flame className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {isOil ? 'Macro Driver / Energy Supply Risk' : 'Crisis Safe Haven / Reserve Hedge'}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{isOil ? 'Crude Oil (WTI)' : 'Physical Gold'}</span>
                <span className="text-xs font-mono text-slate-400">{asset.symbol}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSetAlert && (
              <button
                onClick={onSetAlert}
                title={`Set price alert for ${isOil ? 'Crude Oil' : 'Gold'}`}
                className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors text-xs font-mono flex items-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Alert</span>
              </button>
            )}

            {/* Daily Fluctuation Indicator */}
            <div className={`flex items-center gap-1 font-mono text-sm font-semibold px-2.5 py-1 rounded-md ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="tabular-nums">{isPositive ? '+' : ''}{asset.dailyChange.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Primary Hero Price */}
        <div className="my-5 flex items-baseline justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              ${asset.price.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              Daily Fluctuation (Open to Close):{' '}
              <span className={isPositive ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                {isPositive ? '+' : ''}{asset.dailyChange.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-500">
            <div>EXCHANGE: {asset.exchange}</div>
            <div>{asset.unit}</div>
          </div>
        </div>

        {/* Sparkline Visual */}
        <div className="mb-4 bg-[#0B0F19] p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-500" />
              5-DAY TRENDLINE
            </span>
            <span className="text-slate-500">24H CHANGE: {asset.changeFromPrevClose >= 0 ? '+' : ''}{asset.changeFromPrevClose}%</span>
          </div>
          <AssetSparkline data={asset.sparkline} isPositive={asset.dailyChange >= 0} height={52} />
        </div>

        {/* Detailed High-Density Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-slate-800/80 pt-3">
          <div className="bg-slate-900/50 p-2 rounded">
            <span className="text-slate-500 block text-[10px]">OPEN:</span>
            <span className="text-slate-200 tabular-nums font-semibold">${asset.open.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/50 p-2 rounded">
            <span className="text-slate-500 block text-[10px]">PREV CLOSE:</span>
            <span className="text-slate-200 tabular-nums font-semibold">${asset.prevClose.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/50 p-2 rounded">
            <span className="text-slate-500 block text-[10px]">DAY RANGE:</span>
            <span className="text-slate-200 tabular-nums font-semibold">${asset.dayLow.toFixed(2)} - ${asset.dayHigh.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/50 p-2 rounded">
            <span className="text-slate-500 block text-[10px]">{isOil ? 'BRENT CRUDE SPREAD' : '52W LOW / HIGH'}</span>
            <span className="text-slate-200 tabular-nums font-semibold">
              {isOil && brentAsset
                ? `$${(brentAsset.price - asset.price).toFixed(2)} (Brent $${brentAsset.price.toFixed(2)})`
                : asset.fiftyTwoWeekHigh
                ? `$${asset.fiftyTwoWeekLow?.toFixed(0)} - $${asset.fiftyTwoWeekHigh?.toFixed(0)}`
                : 'COMEX BENCHMARK'}
            </span>
          </div>
        </div>
      </div>

      {/* Domain Context Note */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 leading-snug">
        {isOil
          ? 'Conflict Sensitivity: Primary transmission mechanism for geopolitical shocks. Spikes directly inflate transport costs, sovereign risk premiums, and core CPI.'
          : 'Safe-Haven Role: Zero counterparty risk instrument. Historically accumulates institutional flight capital during regional conflict escalations and currency debasement.'}
      </div>
    </div>
  );
};
