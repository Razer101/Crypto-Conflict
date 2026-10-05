import React, { useState } from 'react';
import { Bell, X, Plus, Trash2, ArrowUpRight, ArrowDownRight, Check, AlertCircle, Coins, Flame, Shield, Volume2, Zap, Layers } from 'lucide-react';
import { PriceAlert, AlertAsset, AlertCondition, SnapshotData, CurrencyCode } from '../types/snapshot';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  onTriggerTestToast: (asset: AlertAsset) => void;
  snapshot: SnapshotData | null;
  activeCurrency: CurrencyCode;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
  onTriggerTestToast,
  snapshot,
  activeCurrency,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<AlertAsset>('BTC');
  const [condition, setCondition] = useState<AlertCondition>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPrices: Record<AlertAsset, number> = {
    BTC: snapshot?.crypto.bitcoin.usd || 85247,
    ETH: snapshot?.crypto.ethereum?.usd || 2715,
    SOL: snapshot?.crypto.solana?.usd || 120.6,
    OIL: snapshot?.commodities.crudeOil.price || 91.15,
    GOLD: snapshot?.commodities.gold.price || 4162.3,
  };

  const currentVal = currentPrices[selectedAsset];

  const handleAssetSelect = (asset: AlertAsset) => {
    setSelectedAsset(asset);
    setFormError(null);
    // Pre-populate target price with ~1% above current
    const base = currentPrices[asset];
    const defaultVal = condition === 'ABOVE' ? base * 1.01 : base * 0.99;
    setTargetPrice(asset === 'OIL' ? defaultVal.toFixed(2) : Math.round(defaultVal).toString());
  };

  const handleQuickOffset = (percentage: number) => {
    const base = currentPrices[selectedAsset];
    const val = base * (1 + percentage / 100);
    setTargetPrice(selectedAsset === 'OIL' ? val.toFixed(2) : Math.round(val).toString());
    setCondition(percentage > 0 ? 'ABOVE' : 'BELOW');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(targetPrice);
    if (isNaN(num) || num <= 0) {
      setFormError('Please enter a valid positive target price threshold.');
      return;
    }

    onAddAlert({
      asset: selectedAsset,
      condition,
      targetPrice: num,
      currency: 'USD',
      enabled: true,
    });

    setFormError(null);
    // reset with +2%
    const nextVal = currentPrices[selectedAsset] * 1.02;
    setTargetPrice(selectedAsset === 'OIL' ? nextVal.toFixed(2) : Math.round(nextVal).toString());
  };

  const getAssetLabel = (asset: AlertAsset) => {
    switch (asset) {
      case 'BTC':
        return 'Bitcoin (BTC)';
      case 'ETH':
        return 'Ethereum (ETH)';
      case 'SOL':
        return 'Solana (SOL)';
      case 'OIL':
        return 'Crude Oil (WTI)';
      case 'GOLD':
        return 'Gold Futures';
    }
  };

  const getAssetIcon = (asset: AlertAsset) => {
    switch (asset) {
      case 'BTC':
        return <Coins className="w-4 h-4 text-amber-400" />;
      case 'ETH':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'SOL':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'OIL':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'GOLD':
        return <Shield className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070A10]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Price Alert Thresholds
              </h2>
              <div className="text-xs font-mono text-slate-400">
                CUSTOM NOTIFICATIONS FOR BITCOIN, GOLD &amp; CRUDE OIL
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* New Alert Form */}
          <form onSubmit={handleCreate} className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>Configure New Price Alert</span>
              <span className="text-slate-400 font-normal">Active Spot: ${currentVal.toLocaleString()}</span>
            </div>

            {/* Step 1: Select Asset */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">1. Target Asset:</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['BTC', 'ETH', 'SOL', 'OIL', 'GOLD'] as AlertAsset[]).map((asset) => (
                  <button
                    key={asset}
                    type="button"
                    onClick={() => handleAssetSelect(asset)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-mono transition-all ${
                      selectedAsset === asset
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {getAssetIcon(asset)}
                    <span>{asset}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Condition & Target Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">2. Breach Condition:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCondition('ABOVE')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-mono transition-colors ${
                      condition === 'ABOVE'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Rises Above (≥)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('BELOW')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-mono transition-colors ${
                      condition === 'BELOW'
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Drops Below (≤)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">3. Target Price (USD):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    value={targetPrice}
                    onChange={(e) => {
                      setTargetPrice(e.target.value);
                      setFormError(null);
                    }}
                    placeholder={`e.g. ${currentVal}`}
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <span className="text-slate-500">Quick set:</span>
              <button
                type="button"
                onClick={() => handleQuickOffset(1)}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white"
              >
                +1% (${(currentVal * 1.01).toFixed(selectedAsset === 'OIL' ? 2 : 0)})
              </button>
              <button
                type="button"
                onClick={() => handleQuickOffset(2.5)}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white"
              >
                +2.5%
              </button>
              <button
                type="button"
                onClick={() => handleQuickOffset(-1)}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white"
              >
                -1% (${(currentVal * 0.99).toFixed(selectedAsset === 'OIL' ? 2 : 0)})
              </button>
              <button
                type="button"
                onClick={() => handleQuickOffset(-2.5)}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white"
              >
                -2.5%
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-amber-400/10"
            >
              <Plus className="w-4 h-4" />
              <span>Create Alert Threshold</span>
            </button>
          </form>

          {/* Active Alerts List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                Configured Thresholds ({alerts.length})
              </h3>
              <button
                type="button"
                onClick={() => onTriggerTestToast(selectedAsset)}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 underline"
              >
                <Volume2 className="w-3 h-3" />
                <span>Test Toast Notification</span>
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="bg-[#0B0F19] border border-slate-800/80 rounded-xl p-8 text-center text-xs font-mono text-slate-500">
                No custom price alerts configured yet. Add one above to be notified when thresholds are breached.
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.map((alert) => {
                  const currentPrice = currentPrices[alert.asset];
                  const isBreached =
                    alert.condition === 'ABOVE'
                      ? currentPrice >= alert.targetPrice
                      : currentPrice <= alert.targetPrice;

                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-lg border flex items-center justify-between gap-4 transition-all ${
                        isBreached && alert.enabled
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-[#111827] border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          {getAssetIcon(alert.asset)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-white">
                              {getAssetLabel(alert.asset)}
                            </span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              alert.condition === 'ABOVE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                            }`}>
                              {alert.condition === 'ABOVE' ? '≥ RISE ABOVE' : '≤ DROP BELOW'}
                            </span>
                            {isBreached && alert.enabled && (
                              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded animate-pulse">
                                BREACHED
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-mono text-slate-400 mt-1">
                            Target: <span className="text-white font-semibold">${alert.targetPrice.toLocaleString()}</span>
                            <span className="mx-2 text-slate-600">|</span>
                            Live: <span className="text-slate-300">${currentPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle switch */}
                        <button
                          type="button"
                          onClick={() => onToggleAlert(alert.id)}
                          className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                            alert.enabled
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {alert.enabled ? 'Active' : 'Muted'}
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#070A10] flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Alerts evaluate on every 30s market synchronization</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
