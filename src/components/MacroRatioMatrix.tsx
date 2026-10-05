import React from 'react';
import { Scale, Zap, ShieldCheck, Layers } from 'lucide-react';
import { CryptoAsset, CommodityAsset } from '../types/snapshot';

interface MacroRatioMatrixProps {
  bitcoin: CryptoAsset;
  ethereum?: CryptoAsset;
  crudeOil: CommodityAsset;
  gold: CommodityAsset;
}

export const MacroRatioMatrix: React.FC<MacroRatioMatrixProps> = ({
  bitcoin,
  ethereum,
  crudeOil,
  gold,
}) => {
  const goldOilRatio = crudeOil.price > 0 ? (gold.price / crudeOil.price).toFixed(2) : '0';
  const btcGoldRatio = gold.price > 0 ? (bitcoin.usd / gold.price).toFixed(2) : '0';
  const btcOilRatio = crudeOil.price > 0 ? (bitcoin.usd / crudeOil.price).toFixed(0) : '0';
  const ethBtcRatio = ethereum && bitcoin.usd > 0 ? (ethereum.usd / bitcoin.usd).toFixed(4) : '0.0315';

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 mb-8">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Cross-Asset Macro Ratios &amp; Systemic Risk Gauges
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          REAL-TIME INTER-MARKET ARBITRAGE
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ratio 1: Gold / Oil Ratio */}
        <div className="bg-[#0B0F19] border border-slate-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>GOLD / OIL RATIO</span>
            <span className="text-amber-400">GC=F / CL=F</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {goldOilRatio} <span className="text-xs font-normal text-slate-400">bbl / oz</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Historical crisis barometer. Measures how many barrels of crude one ounce of gold purchases. Spikes during geopolitical shocks.
          </div>
        </div>

        {/* Ratio 2: BTC / Gold Ratio */}
        <div className="bg-[#0B0F19] border border-slate-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>BITCOIN / GOLD</span>
            <span className="text-amber-400">BTC / GC=F</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {btcGoldRatio} <span className="text-xs font-normal text-slate-400">oz / BTC</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Digital vs. Physical Store of Value. Traces capital rotation between modern crypto liquidity and 5,000-year central bank gold reserves.
          </div>
        </div>

        {/* Ratio 3: BTC / Oil Ratio */}
        <div className="bg-[#0B0F19] border border-slate-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>BITCOIN / OIL</span>
            <span className="text-amber-400">BTC / CL=F</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {Number(btcOilRatio).toLocaleString()} <span className="text-xs font-normal text-slate-400">bbl / BTC</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Energy Purchasing Power. Gauges how much physical energy capacity can be acquired per Bitcoin unit under current geopolitical terms.
          </div>
        </div>

        {/* Ratio 4: ETH / BTC Ratio */}
        <div className="bg-[#0B0F19] border border-slate-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>ETH / BTC RATIO</span>
            <span className="text-indigo-400">ETH / BTC</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {ethBtcRatio} <span className="text-xs font-normal text-slate-400">BTC</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Crypto Risk-Tolerance Gauge. Demonstrates whether speculative liquidity is moving out the risk curve into smart contract platforms or consolidating into Bitcoin.
          </div>
        </div>
      </div>
    </div>
  );
};
