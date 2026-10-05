import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { WorldClocksBar } from './components/WorldClocksBar';
import { MacroHeader } from './components/MacroHeader';
import { CryptoCard } from './components/CryptoCard';
import { CommodityCard } from './components/CommodityCard';
import { MacroRatioMatrix } from './components/MacroRatioMatrix';
import { ConflictNewsFeed } from './components/ConflictNewsFeed';
import { AiRiskBriefing } from './components/AiRiskBriefing';
import { TerminalSnapshotModal } from './components/TerminalSnapshotModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { ToastNotificationCenter } from './components/ToastNotificationCenter';
import { SnapshotData, CurrencyCode, PriceAlert, ToastNotification, AlertAsset } from './types/snapshot';
import { RefreshCw, AlertCircle, Radio } from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 30;
const STORAGE_KEY_ALERTS = 'macrorisk_custom_alerts_v1';

// Initial sensible sample alerts for user convenience
const DEFAULT_ALERTS: PriceAlert[] = [
  {
    id: 'alert-btc-default',
    asset: 'BTC',
    condition: 'ABOVE',
    targetPrice: 90000,
    currency: 'USD',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert-oil-default',
    asset: 'OIL',
    condition: 'ABOVE',
    targetPrice: 95.0,
    currency: 'USD',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert-gold-default',
    asset: 'GOLD',
    condition: 'ABOVE',
    targetPrice: 4200.0,
    currency: 'USD',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('USD');
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SECONDS);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  // Price alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse alerts from storage:', e);
    }
    return DEFAULT_ALERTS;
  });

  // Active toast notifications
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;

  // Persist alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to store alerts:', e);
    }
  }, [alerts]);

  // Dispatch toast notification
  const addToast = useCallback((toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastNotification = {
      ...toast,
      id,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [newToast, ...prev].slice(0, 4));

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Evaluate alerts against snapshot prices
  const evaluateAlerts = useCallback((data: SnapshotData) => {
    const btcPrice = data.crypto.bitcoin.usd;
    const oilPrice = data.commodities.crudeOil.price;
    const goldPrice = data.commodities.gold.price;

    setAlerts((currentAlerts) => {
      let hasChanges = false;
      const updated = currentAlerts.map((alert) => {
        if (!alert.enabled) return alert;

        let currentPrice = btcPrice;
        let assetName = 'Bitcoin';
        if (alert.asset === 'OIL') {
          currentPrice = oilPrice;
          assetName = 'Crude Oil (WTI)';
        } else if (alert.asset === 'GOLD') {
          currentPrice = goldPrice;
          assetName = 'Gold Futures';
        }

        const isBreached =
          alert.condition === 'ABOVE'
            ? currentPrice >= alert.targetPrice
            : currentPrice <= alert.targetPrice;

        // If breached and not already marked as triggered
        if (isBreached && !alert.isTriggered) {
          hasChanges = true;
          addToast({
            title: `${assetName} Threshold Alert`,
            message: `${assetName} breached ${alert.condition === 'ABOVE' ? '≥' : '≤'} $${alert.targetPrice.toLocaleString()} (Current: $${currentPrice.toLocaleString()})`,
            asset: alert.asset,
            type: 'breach',
          });
          return {
            ...alert,
            isTriggered: true,
            lastTriggered: new Date().toISOString(),
          };
        } else if (!isBreached && alert.isTriggered) {
          // Reset trigger state when price returns within bounds
          hasChanges = true;
          return {
            ...alert,
            isTriggered: false,
          };
        }

        return alert;
      });

      return hasChanges ? updated : currentAlerts;
    });
  }, [addToast]);

  // Fetch real-time snapshot from server
  const fetchSnapshot = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/snapshot');
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: SnapshotData = await res.json();
      setSnapshot(data);
      evaluateAlerts(data);
      setError(null);
      setCountdown(REFRESH_INTERVAL_SECONDS);
    } catch (err: any) {
      console.error('Snapshot fetch error:', err);
      if (!snapshot) {
        setError('Unable to reach market intelligence feeds. Please check connection and retry.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [snapshot, evaluateAlerts]);

  // Initial load
  useEffect(() => {
    fetchSnapshot();
  }, []);

  // Auto-refresh countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchSnapshot(true);
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchSnapshot]);

  // Alert management handlers
  const handleAddAlert = (alertData: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const newAlert: PriceAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      isTriggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    // Check if new alert is already in breach
    if (snapshot) {
      let currentPrice = snapshot.crypto.bitcoin.usd;
      let assetName = 'Bitcoin';
      if (newAlert.asset === 'ETH') {
        currentPrice = snapshot.crypto.ethereum.usd;
        assetName = 'Ethereum';
      } else if (newAlert.asset === 'SOL') {
        currentPrice = snapshot.crypto.solana.usd;
        assetName = 'Solana';
      } else if (newAlert.asset === 'OIL') {
        currentPrice = snapshot.commodities.crudeOil.price;
        assetName = 'Crude Oil (WTI)';
      } else if (newAlert.asset === 'GOLD') {
        currentPrice = snapshot.commodities.gold.price;
        assetName = 'Gold Futures';
      }

      const isBreached =
        newAlert.condition === 'ABOVE'
          ? currentPrice >= newAlert.targetPrice
          : currentPrice <= newAlert.targetPrice;

      if (isBreached) {
        addToast({
          title: `${assetName} Threshold Alert`,
          message: `${assetName} breached ${newAlert.condition === 'ABOVE' ? '≥' : '≤'} $${newAlert.targetPrice.toLocaleString()} (Current: $${currentPrice.toLocaleString()})`,
          asset: newAlert.asset,
          type: 'breach',
        });
        newAlert.isTriggered = true;
      }
    }
  };

  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleTriggerTestToast = (asset: AlertAsset) => {
    const assetNames: Record<AlertAsset, string> = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      SOL: 'Solana',
      OIL: 'Crude Oil (WTI)',
      GOLD: 'Gold Futures',
    };
    const assetPrices: Record<AlertAsset, number> = {
      BTC: snapshot?.crypto.bitcoin.usd || 85247,
      ETH: snapshot?.crypto.ethereum?.usd || 2715,
      SOL: snapshot?.crypto.solana?.usd || 120.6,
      OIL: snapshot?.commodities.crudeOil.price || 91.15,
      GOLD: snapshot?.commodities.gold.price || 4162.3,
    };
    addToast({
      title: `${assetNames[asset]} Alert Triggered (Test)`,
      message: `Price breached target threshold of $${(assetPrices[asset] * 1.01).toLocaleString()} (Current: $${assetPrices[asset].toLocaleString()})`,
      asset,
      type: 'breach',
    });
  };

  const activeAlertsCount = alerts.filter((a) => a.enabled).length;

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Bar Header with 5 currencies & Alert manager */}
      <TopBar
        currency={activeCurrency}
        onCurrencyChange={setActiveCurrency}
        onOpenTerminalModal={() => setIsTerminalModalOpen(true)}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
        activeAlertsCount={activeAlertsCount}
        onRefresh={() => fetchSnapshot(false)}
        isRefreshing={isRefreshing}
      />

      {/* Global Market Clocks & Regional Sessions Ribbon */}
      <WorldClocksBar />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {loading && !snapshot ? (
          <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center gap-4 text-center">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <div className="font-mono text-sm text-slate-300">
              Gathering prices, FLUCTUATIONS, and news... Please wait!
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Connecting to CoinGecko (5 currencies: USD, EUR, JPY, GBP, CNY), NYMEX/COMEX &amp; Reuters RSS...
            </div>
          </div>
        ) : error && !snapshot ? (
          <div className="max-w-xl mx-auto my-20 p-6 bg-[#111827] border border-rose-500/30 rounded-xl text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white mb-2">Feed Connection Alert</h2>
            <p className="text-xs text-slate-300 mb-4">{error}</p>
            <button
              onClick={() => fetchSnapshot(false)}
              className="px-4 py-2 bg-amber-400 text-slate-900 font-semibold text-xs rounded-lg hover:bg-amber-300 transition-colors font-mono"
            >
              Retry Connection
            </button>
          </div>
        ) : snapshot ? (
          <div>
            {/* Macro Posture & Header */}
            <MacroHeader
              lastUpdated={snapshot.timestamp}
              regime={snapshot.macroRegime}
              autoRefreshCountdown={countdown}
            />

            {/* Core Telemetry Container */}
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* 1. Digital Assets (Crypto Risk-On & Liquidity Layer) */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
                  <span className="font-semibold text-white tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    DIGITAL RISK ASSETS &amp; LIQUIDITY LAYER (5-CURRENCY REAL-TIME)
                  </span>
                  <span className="text-slate-500">COINGECKO FEED · BTC / ETH / SOL</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Bitcoin (BTC) */}
                  <CryptoCard
                    assetId="BTC"
                    name="Bitcoin"
                    symbol="BTC"
                    roleLabel="Digital Gold / Macro Reserve Asset"
                    data={snapshot.crypto.bitcoin}
                    activeCurrency={activeCurrency}
                    onCurrencySelect={setActiveCurrency}
                    onSetAlert={() => setIsAlertsModalOpen(true)}
                    macroBehavior="Operates as a high-beta global liquidity indicator during initial shocks, transitioning into a censorship-resistant capital flight hedge."
                  />

                  {/* Ethereum (ETH) */}
                  <CryptoCard
                    assetId="ETH"
                    name="Ethereum"
                    symbol="ETH"
                    roleLabel="Smart Contract Settlement & DeFi"
                    data={snapshot.crypto.ethereum}
                    activeCurrency={activeCurrency}
                    onCurrencySelect={setActiveCurrency}
                    onSetAlert={() => setIsAlertsModalOpen(true)}
                    macroBehavior="Primary decentralized finance base currency. Reflects systemic risk appetite and gas fee throughput across global programmable capital."
                  />

                  {/* Solana (SOL) */}
                  <CryptoCard
                    assetId="SOL"
                    name="Solana"
                    symbol="SOL"
                    roleLabel="High-Throughput Liquidity & Velocity"
                    data={snapshot.crypto.solana}
                    activeCurrency={activeCurrency}
                    onCurrencySelect={setActiveCurrency}
                    onSetAlert={() => setIsAlertsModalOpen(true)}
                    macroBehavior="High-velocity speculative capital bellwether. Highly sensitive to retail liquidity flows and broader macro risk-on momentum shifts."
                  />
                </div>
              </div>

              {/* 2. Physical Commodities (Safe Havens & Macro Drivers) */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
                  <span className="font-semibold text-white tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    PHYSICAL COMMODITIES &amp; HARD SAFE HAVENS
                  </span>
                  <span className="text-slate-500">NYMEX / COMEX / ICE FUTURES</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Crude Oil (Macro Driver & Energy Security) */}
                  <CommodityCard
                    asset={snapshot.commodities.crudeOil}
                    type="oil"
                    brentAsset={snapshot.commodities.brentOil}
                    onSetAlert={() => setIsAlertsModalOpen(true)}
                  />

                  {/* Gold (Crisis Safe Haven & Reserve Asset) */}
                  <CommodityCard
                    asset={snapshot.commodities.gold}
                    type="gold"
                    onSetAlert={() => setIsAlertsModalOpen(true)}
                  />
                </div>
              </div>

              {/* Cross-Asset Intermarket Ratios */}
              <MacroRatioMatrix
                bitcoin={snapshot.crypto.bitcoin}
                ethereum={snapshot.crypto.ethereum}
                crudeOil={snapshot.commodities.crudeOil}
                gold={snapshot.commodities.gold}
              />

              {/* AI Geopolitical Risk Synthesis */}
              <AiRiskBriefing
                snapshot={snapshot}
              />

              {/* Conflict & Market News Feed */}
              <ConflictNewsFeed
                headlines={snapshot.news}
              />
            </div>
          </div>
        ) : null}
      </main>

      {/* Price Alert Thresholds Modal */}
      <PriceAlertModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onToggleAlert={handleToggleAlert}
        onDeleteAlert={handleDeleteAlert}
        onTriggerTestToast={handleTriggerTestToast}
        snapshot={snapshot}
        activeCurrency={activeCurrency}
      />

      {/* Terminal Snapshot Modal */}
      <TerminalSnapshotModal
        isOpen={isTerminalModalOpen}
        onClose={() => setIsTerminalModalOpen(false)}
        snapshot={snapshot}
      />

      {/* Floating Subtle Toast Notifications */}
      <ToastNotificationCenter
        notifications={notifications}
        onDismiss={dismissToast}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
      />

      {/* Institutional Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070A10] py-6 px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>MACRORISK INTELLIGENCE TERMINAL</span>
            <span aria-hidden="true">·</span>
            <span>5-CURRENCY CRYPTO ENGINE (USD, EUR, JPY, GBP, CNY)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsAlertsModalOpen(true)}
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              Custom Alerts ({activeAlertsCount})
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsTerminalModalOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Export Python Stdout
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => fetchSnapshot(false)}
              className="hover:text-amber-400 transition-colors"
            >
              Force Sync
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
