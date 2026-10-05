import React, { useState } from 'react';
import { Copy, Check, X, Terminal, Download } from 'lucide-react';
import { SnapshotData } from '../types/snapshot';

interface TerminalSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: SnapshotData | null;
}

export const TerminalSnapshotModal: React.FC<TerminalSnapshotModalProps> = ({
  isOpen,
  onClose,
  snapshot,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !snapshot) return null;

  const { bitcoin, ethereum, solana } = snapshot.crypto;
  const { crudeOil, gold } = snapshot.commodities;
  const topHeadlines = snapshot.news.slice(0, 4);

  const snapshotDate = new Date(snapshot.timestamp);
  const fmt = (tz: string) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    }).format(snapshotDate);

  // Recreate the exact format from the user's Python script with global time standard & 3 cryptos
  const terminalText = `==================================================
 🌍 MACRO, CRYPTO, & CONFLICT SNAPSHOT 🌍 
==================================================
🕒 GLOBAL MARKET TIME & DATE:
• UTC (Standard):       ${fmt('UTC')}
• US (New York / COMEX): ${fmt('America/New_York')}
• Europe (London / ICE): ${fmt('Europe/London')}
• Middle East (Riyadh):  ${fmt('Asia/Riyadh')}
• China (Beijing / FX):  ${fmt('Asia/Shanghai')}
• Japan (Tokyo / TSE):   ${fmt('Asia/Tokyo')}
--------------------------------------------------

💰 CRYPTO (Risk-On Liquidity & Smart Contract Layer):
• Bitcoin (BTC):
  USD: $${bitcoin.usd.toLocaleString()}  |  24h: ${bitcoin.usd_24h_change >= 0 ? '+' : ''}${bitcoin.usd_24h_change.toFixed(2)}%
  EUR: €${bitcoin.eur.toLocaleString()}  |  JPY: ¥${bitcoin.jpy.toLocaleString()}  |  GBP: £${bitcoin.gbp.toLocaleString()}
  CNY: ¥${bitcoin.cny.toLocaleString()} (Chinese Yuan - 元)

• Ethereum (ETH):
  USD: $${ethereum.usd.toLocaleString()}  |  24h: ${ethereum.usd_24h_change >= 0 ? '+' : ''}${ethereum.usd_24h_change.toFixed(2)}%
  EUR: €${ethereum.eur.toLocaleString()}  |  CNY: ¥${ethereum.cny.toLocaleString()} (元)

• Solana (SOL):
  USD: $${solana.usd.toFixed(2)}  |  24h: ${solana.usd_24h_change >= 0 ? '+' : ''}${solana.usd_24h_change.toFixed(2)}%
  EUR: €${solana.eur.toFixed(2)}  |  CNY: ¥${solana.cny.toFixed(2)} (元)

🛢️  COMMODITIES (Safe Havens & Macro Drivers):
Crude Oil:     $${crudeOil.price.toFixed(2)}  |  Daily Fluctuation: ${crudeOil.dailyChange >= 0 ? '+' : ''}${crudeOil.dailyChange.toFixed(2)}%
Gold:          $${gold.price.toFixed(2)}  |  Daily Fluctuation: ${gold.dailyChange >= 0 ? '+' : ''}${gold.dailyChange.toFixed(2)}%

⚠️ TOP CONFLICT & MARKET HEADLINES:
${topHeadlines.map((h, i) => `${i + 1}. ${h.title}`).join('\n')}

==================================================
[Timestamp ISO: ${snapshot.timestamp}]
==================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(terminalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([terminalText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `macro_snapshot_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#070A10]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              python macro_snapshot.py — stdout
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              title="Download .txt snapshot"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 bg-[#050811] overflow-x-auto max-h-[70vh]">
          <pre className="font-mono text-xs text-amber-300 leading-relaxed selection:bg-amber-500/30 whitespace-pre">
            {terminalText}
          </pre>
        </div>

        {/* Terminal Footer */}
        <div className="px-4 py-2.5 bg-[#070A10] border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Python 3.11 Runtime Output Simulation</span>
          <span>Ready for Telegram / Slack / Report Paste</span>
        </div>
      </div>
    </div>
  );
};
