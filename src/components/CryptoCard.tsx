import React from 'react';
import { ArrowUpRight, ArrowDownRight, Coins, Bell, Zap, Layers } from 'lucide-react';
import { CryptoAsset, CurrencyCode, AlertAsset } from '../types/snapshot';

interface CryptoCardProps {
  assetId: AlertAsset;
  name: string;
  symbol: string;
  roleLabel: string;
  data: CryptoAsset;
  activeCurrency: CurrencyCode;
  onCurrencySelect: (c: CurrencyCode) => void;
  onSetAlert?: () => void;
  macroBehavior: string;
}

export const CryptoCard: React.FC<CryptoCardProps> = ({
  assetId,
  name,
  symbol,
  roleLabel,
  data,
  activeCurrency,
  onCurrencySelect,
  onSetAlert,
  macroBehavior,
}) => {
  const formatPrice = (val: number, cur: CurrencyCode) => {
    const isSmall = val < 500;
    const formatted = isSmall ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : val.toLocaleString(undefined, { maximumFractionDigits: 0 });

    switch (cur) {
      case 'EUR':
        return `€${formatted}`;
      case 'JPY':
        return `¥${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      case 'GBP':
        return `£${formatted}`;
      case 'CNY':
        return `¥${formatted}`;
      case 'USD':
      default:
        return `$${formatted}`;
    }
  };

  const getPrice = (cur: CurrencyCode) => {
    switch (cur) {
      case 'EUR':
        return data.eur;
      case 'JPY':
        return data.jpy;
      case 'GBP':
        return data.gbp;
      case 'CNY':
        return data.cny;
      case 'USD':
      default:
        return data.usd;
    }
  };

  const getChange = (cur: CurrencyCode) => {
    switch (cur) {
      case 'EUR':
        return data.eur_24h_change;
      case 'JPY':
        return data.jpy_24h_change;
      case 'GBP':
        return data.gbp_24h_change;
      case 'CNY':
        return data.cny_24h_change;
      case 'USD':
      default:
        return data.usd_24h_change;
    }
  };

  const activePrice = getPrice(activeCurrency);
  const activeChange = getChange(activeCurrency);
  const isCurPositive = activeChange >= 0;

  const currenciesList: { code: CurrencyCode; label: string; prefix: string }[] = [
    { code: 'USD', label: `${symbol} (USD)`, prefix: '$' },
    { code: 'EUR', label: `${symbol} (EUR)`, prefix: '€' },
    { code: 'JPY', label: `${symbol} (JPY)`, prefix: '¥' },
    { code: 'GBP', label: `${symbol} (GBP)`, prefix: '£' },
    { code: 'CNY', label: `${symbol} (CNY - 元)`, prefix: '¥' },
  ];

  const getIcon = () => {
    if (symbol === 'BTC') return <Coins className="w-5 h-5 text-amber-400" />;
    if (symbol === 'ETH') return <Layers className="w-5 h-5 text-indigo-400" />;
    return <Zap className="w-5 h-5 text-emerald-400" />;
  };

  const getThemeBg = () => {
    if (symbol === 'BTC') return 'bg-amber-500/10 text-amber-400';
    if (symbol === 'ETH') return 'bg-indigo-500/10 text-indigo-400';
    return 'bg-emerald-500/10 text-emerald-400';
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        {/* Unboxed Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${getThemeBg()}`}>
              {getIcon()}
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {roleLabel}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{name}</span>
                <span className="text-xs font-mono text-slate-400">{symbol}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Set Alert */}
            {onSetAlert && (
              <button
                onClick={onSetAlert}
                title={`Set ${symbol} price alert`}
                className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors text-xs font-mono flex items-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Alert</span>
              </button>
            )}

            {/* 24h Fluctuation Indicator */}
            <div className={`flex items-center gap-1 font-mono text-xs font-semibold px-2 py-1 rounded-md ${
              isCurPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {isCurPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span className="tabular-nums">{isCurPositive ? '+' : ''}{activeChange.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Primary Hero Price */}
        <div className="my-4">
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            {formatPrice(activePrice, activeCurrency)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
            <span>24h Fluctuation ({activeCurrency}):</span>
            <span className={isCurPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {isCurPositive ? '+' : ''}{activeChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 5-Currency Comparison Grid (USD, EUR, JPY, GBP, CNY) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-[#0B0F19] p-2.5 rounded-lg border border-slate-800/80 mb-4">
          {currenciesList.map(({ code, label, prefix }) => {
            const price = getPrice(code);
            const change = getChange(code);
            const isPos = change >= 0;
            const isSelected = activeCurrency === code;
            const isSmall = price < 500;

            return (
              <button
                key={code}
                onClick={() => onCurrencySelect(code)}
                className={`p-1.5 text-left rounded transition-colors ${
                  isSelected
                    ? 'bg-slate-800 border border-slate-700 text-white'
                    : 'hover:bg-slate-900 border border-transparent text-slate-400'
                }`}
              >
                <div className="text-[9.5px] font-mono text-slate-500 uppercase flex items-center justify-between">
                  <span>{label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </div>
                <div className="text-xs font-bold font-mono text-slate-200 tabular-nums mt-0.5">
                  {prefix}{isSmall ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className={`text-[9.5px] font-mono mt-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? '+' : ''}{change.toFixed(2)}%
                </div>
              </button>
            );
          })}
        </div>

        {/* Secondary Details */}
        <div className="space-y-1.5 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2.5">
          {data.usd_24h_vol ? (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">24H VOLUME:</span>
              <span className="text-slate-300 tabular-nums font-medium">
                ${(data.usd_24h_vol / 1e9).toFixed(2)}B
              </span>
            </div>
          ) : null}

          {data.usd_market_cap ? (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">MARKET CAP:</span>
              <span className="text-slate-300 tabular-nums font-medium">
                ${data.usd_market_cap >= 1e12 ? `${(data.usd_market_cap / 1e12).toFixed(3)}T` : `${(data.usd_market_cap / 1e9).toFixed(1)}B`}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Domain Context Note */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-[10.5px] text-slate-400 leading-snug">
        {macroBehavior}
      </div>
    </div>
  );
};
