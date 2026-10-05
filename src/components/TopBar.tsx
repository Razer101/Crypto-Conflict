import React from 'react';
import { Terminal, RefreshCw, Bell } from 'lucide-react';
import { CurrencyCode } from '../types/snapshot';

interface TopBarProps {
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onOpenTerminalModal: () => void;
  onOpenAlertsModal: () => void;
  activeAlertsCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currency,
  onCurrencyChange,
  onOpenTerminalModal,
  onOpenAlertsModal,
  activeAlertsCount,
  onRefresh,
  isRefreshing,
}) => {
  const currencies: CurrencyCode[] = ['USD', 'EUR', 'JPY', 'GBP', 'CNY'];

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark in Cabinet Grotesk / Sans */}
      <a href="#" className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors">
        MacroRisk Intelligence
      </a>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        <a href="#overview" className="hover:text-white transition-colors">Overview</a>
        <a href="#crypto-section" className="hover:text-white transition-colors">Crypto (Risk-On)</a>
        <a href="#commodities-section" className="hover:text-white transition-colors">Commodities</a>
        <a href="#conflict-news" className="hover:text-white transition-colors">Conflict Wire</a>
        <a href="#ai-synthesis" className="hover:text-white transition-colors">AI Briefing</a>
      </nav>

      {/* Zone 3: 1-2 primary actions & currency selector */}
      <div className="flex items-center gap-2.5">
        {/* 5-Currency Switcher (USD, EUR, JPY, GBP, CNY) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-mono">
          {currencies.map((c) => (
            <button
              key={c}
              onClick={() => onCurrencyChange(c)}
              title={c === 'CNY' ? 'Chinese Yuan (CNY)' : c === 'GBP' ? 'British Pound (GBP)' : c}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                currency === c
                  ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Custom Price Alerts Action */}
        <button
          onClick={onOpenAlertsModal}
          title="Configure custom price alert thresholds"
          className="relative p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all font-mono text-xs flex items-center gap-1.5"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Alerts</span>
          {activeAlertsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh real-time market data"
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>

        {/* Terminal Snapshot Action */}
        <button
          onClick={onOpenTerminalModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-400/10 font-mono"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Terminal Snapshot</span>
        </button>
      </div>
    </header>
  );
};
