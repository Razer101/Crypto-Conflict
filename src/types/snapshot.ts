export type CurrencyCode = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CNY';

export interface CryptoAsset {
  usd: number;
  eur: number;
  jpy: number;
  gbp: number;
  cny: number;
  usd_24h_change: number;
  eur_24h_change: number;
  jpy_24h_change: number;
  gbp_24h_change: number;
  cny_24h_change: number;
  usd_24h_vol?: number;
  usd_market_cap?: number;
  sparkline?: number[];
}

export interface CommodityAsset {
  symbol: string;
  name: string;
  price: number;
  open: number;
  prevClose: number;
  dailyChange: number;
  changeFromPrevClose: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  unit: string;
  currency: string;
  sparkline: number[];
  exchange: string;
}

export interface NewsHeadline {
  id: string;
  title: string;
  fullTitle: string;
  source: string;
  link: string;
  pubDate: string;
  category: string;
}

export interface MacroRegime {
  status: string;
  tone: 'critical' | 'positive' | 'neutral' | 'warning';
  summary: string;
}

export interface SnapshotData {
  timestamp: string;
  crypto: {
    bitcoin: CryptoAsset;
    ethereum: CryptoAsset;
    solana: CryptoAsset;
  };
  commodities: {
    crudeOil: CommodityAsset;
    gold: CommodityAsset;
    brentOil?: CommodityAsset;
  };
  news: NewsHeadline[];
  macroRegime: MacroRegime;
}

export interface AiBriefingData {
  executiveBriefing: string;
  threatPosture: 'Low' | 'Elevated' | 'High' | 'Severe';
  commodityImpact: string;
  cryptoSensitivity: string;
  strategicTakeaway: string;
  source?: string;
  generatedAt?: string;
}

export type AlertAsset = 'BTC' | 'ETH' | 'SOL' | 'OIL' | 'GOLD';
export type AlertCondition = 'ABOVE' | 'BELOW';

export interface PriceAlert {
  id: string;
  asset: AlertAsset;
  condition: AlertCondition;
  targetPrice: number;
  currency: CurrencyCode;
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  isTriggered?: boolean;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  asset: AlertAsset;
  type: 'breach' | 'info';
  timestamp: number;
}
