# MacroRisk Intelligence Terminal

A real-time cross-asset intelligence terminal and geopolitical risk dashboard tracking the nexus between geopolitical conflict, safe-haven physical commodities (Crude Oil & Gold), and digital risk-on liquidity assets (Bitcoin).

![Terminal Overview](public/screenshot.png) <!-- Optional -->

---

## 🚀 Key Features

- **5-Currency Crypto Engine**: Live real-time pricing and 24-hour fluctuations for Bitcoin across **USD ($)**, **EUR (€)**, **JPY (¥)**, **GBP (£)**, and **CNY (¥ / 元)**.
- **Physical Commodities & Safe Havens**: Real-time quotes, daily fluctuation metrics, and intraday trajectory sparklines for **WTI Crude Oil (CL=F)**, **Brent Crude (BZ=F)**, and **COMEX Gold (GC=F)**.
- **Intermarket Cross-Asset Matrix**: Real-time calculated ratios including the **BTC/Gold Ratio**, **Gold/Oil Ratio** (historical conflict indicator), and **BTC/Oil Energy Purchasing Index**.
- **Interactive D3.js Conflict World Map**: Natural Earth vector projection highlighting regions currently mentioned in top-level conflict dispatches, with tactical radar beacons and one-click filtering.
- **Dual-Stream Conflict Wire**: Live news feed tracking the **Russia-Ukraine War Theater**, **Middle East Maritime Corridors & Red Sea**, and global central bank macro developments.
- **Global Market Clocks Ribbon**: Continuous 24-hour time and date synchronization across **UTC Standard**, **US (New York)**, **Western Europe (London)**, **Eastern Europe (Kyiv)**, **Middle East (Riyadh)**, **China (Beijing)**, and **Japan (Tokyo)**.
- **Custom Price Alert Thresholds**: Configure upside and downside price breach thresholds with persistent storage and non-intrusive toast notifications.
- **AI Geopolitical Risk Briefing**: Automated executive risk synthesis powered by Google Gemini via `@google/genai`.
- **Python Terminal Snapshot**: One-click ASCII format snapshot export replicating terminal output for sharing across Slack, Telegram, and research briefs.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Data Visualization**: D3.js (`d3-geo`, `topojson-client`)
- **Backend / API**: Node.js, Express, tsx
- **Data Providers**: CoinGecko API, NYMEX/COMEX Futures, Google News RSS
- **AI Intelligence**: Google Gemini API (`@google/genai`)

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or bun

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
npm install
```

### 3. Environment Setup (Optional for AI Briefings)
Copy the example environment file:
```bash
cp .env.example .env
```
Add your Google Gemini API key if you want live AI strategic briefings:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📄 License
MIT License
