import React, { useState, useEffect } from 'react';
import { Clock, Globe } from 'lucide-react';

interface MarketZone {
  code: string;
  region: string;
  center: string;
  timeZone: string;
  isPrimary?: boolean;
}

const MARKET_ZONES: MarketZone[] = [
  {
    code: 'UTC',
    region: 'Global Standard',
    center: 'Universal Standard',
    timeZone: 'UTC',
    isPrimary: true,
  },
  {
    code: 'US / NY',
    region: 'United States',
    center: 'New York (COMEX/NYMEX)',
    timeZone: 'America/New_York',
  },
  {
    code: 'EU / LON',
    region: 'Europe',
    center: 'London / Frankfurt',
    timeZone: 'Europe/London',
  },
  {
    code: 'UA / KYIV',
    region: 'Eastern Europe',
    center: 'Kyiv / Warsaw',
    timeZone: 'Europe/Kyiv',
  },
  {
    code: 'ME / GULF',
    region: 'Middle East',
    center: 'Riyadh / Dubai',
    timeZone: 'Asia/Riyadh',
  },
  {
    code: 'CN / BJ',
    region: 'China',
    center: 'Beijing / Shanghai',
    timeZone: 'Asia/Shanghai',
  },
  {
    code: 'JP / TYO',
    region: 'Japan',
    center: 'Tokyo (TSE/BoJ)',
    timeZone: 'Asia/Tokyo',
  },
];

export const WorldClocksBar: React.FC = () => {
  const [now, setNow] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatZone = (timeZone: string) => {
    try {
      // Date part: e.g. "Sun, Oct 5"
      const datePart = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(now);

      // Time part: e.g. "03:26:57" (24h)
      const timePart = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);

      // Timezone offset / abbreviation: e.g. "UTC", "EDT", "BST", "GMT+3", "CST", "JST"
      const tzPart = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'short',
      })
        .formatToParts(now)
        .find((p) => p.type === 'timeZoneName')?.value || '';

      return { datePart, timePart, tzPart };
    } catch {
      return { datePart: '', timePart: now.toISOString().slice(11, 19), tzPart: timeZone };
    }
  };

  return (
    <div className="bg-[#070A10] border-b border-slate-800/80 px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-200">GLOBAL SESSIONS</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-500">UTC &amp; REGIONAL MARKET HUBS</span>
        </div>

        {/* Multi-Timezone Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-2.5 flex-1 lg:max-w-6xl">
          {MARKET_ZONES.map((zone) => {
            const { datePart, timePart, tzPart } = formatZone(zone.timeZone);

            return (
              <div
                key={zone.code}
                className={`p-1.5 sm:p-2 rounded-lg border text-left transition-colors ${
                  zone.isPrimary
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-[#0B0F19] border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                {/* Header label */}
                <div className="flex items-center justify-between text-[10px] font-mono leading-none mb-1">
                  <span className={zone.isPrimary ? 'font-bold text-amber-400' : 'text-slate-400'}>
                    {zone.region}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-tighter">
                    {tzPart}
                  </span>
                </div>

                {/* 24-Hour Time display (tabular-nums prevents layout jitter) */}
                <div className="text-xs sm:text-sm font-mono font-bold tabular-nums tracking-tight text-white flex items-center justify-between">
                  <span>{timePart}</span>
                  {zone.isPrimary && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-normal">
                      STD
                    </span>
                  )}
                </div>

                {/* Date display & Hub */}
                <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                  <span>{datePart}</span>
                  <span className="text-slate-600 mx-1">·</span>
                  <span className="text-slate-500">{zone.center.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
