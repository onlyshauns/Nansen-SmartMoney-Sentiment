# Smart Money Sentiment Dashboard

A real-time dashboard for tracking smart money sentiment and activity across multiple chains using Nansen API data. Features multi-chain token flows, sentiment analysis, Hyperliquid trader leaderboards, and market drivers.

## 🎯 Features

### Sentiment Hero
- **Visual sentiment indicator** with glowing emoji (🐂 Bull / 🐻 Bear / 😐 Neutral)
- **Sentiment spectrum bar** showing position on bearish-to-bullish scale
- **Aggregate statistics**: Long %, Total Open Interest, Short %
- **Colored glow effects** (green for bullish, red for bearish, yellow for neutral)

### Smart Money Inflows (24h)
- **Top 8 tokens by net inflow** across Ethereum, Base, and Solana
- **Multi-chain aggregation** with 200 trades per chain for balanced representation
- **Updates hourly** with 1-hour cache revalidation
- Click tokens to open **Nansen Token God Mode** for detailed analysis
- Displays chain, symbol, and USD inflow value

### Smart Money Outflows (24h)
- **Top 8 tokens by net outflow** across Ethereum, Base, and Solana
- **Multi-chain aggregation** with balanced data sampling
- **Updates hourly** with 1-hour cache revalidation
- Click tokens to open **Nansen Token God Mode**
- Shows which tokens smart money is exiting

### Sentiment Drivers
- **Four key metrics** driving overall sentiment calculation:
  1. **Long/Short Delta (4h)**: Change in aggregate position bias
  2. **Realized PnL (7d)**: Aggregate profit/loss from top 50 Hyperliquid traders
  3. **Stablecoin Flows**: Net flow into/out of stablecoins (risk-on/risk-off indicator)
  4. **Perp Positions**: Current aggregate long vs short exposure on Hyperliquid
- Each driver shows contribution to final sentiment score

### Smart Money Traders
- **Top 12-15 Hyperliquid traders** ranked by 7-day realized PnL
- Shows trader label/address, realized PnL, trade count, and bias (bullish/bearish/neutral)
- Real-time aggregation from 200 perpetual trades
- Identifies which smart traders are currently profitable

### Auto-Refresh
- Automatically refreshes data every 3 minutes
- Manual refresh button available
- Last updated timestamp with status indicator

## 🏗️ Tech Stack

- **Framework:** Next.js 16.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Theme:** Dark mode only
- **API:** Nansen API integration

## 🎨 Design

- **Clean table-based layout** with proper headers and spacing
- **Dark theme** with `#0a0e16` background
- **Accent colors:** Green (`#00ffa7`) for bullish, Red (`#ff4444`) for bearish
- **Glowing effects** on sentiment emoji for visual impact
- **Responsive design** optimized for desktop viewing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Nansen API key ([Get one here](https://www.nansen.ai/api))

### Installation

```bash
# Clone the repository
git clone https://github.com/onlyshauns/Nansen-SmartMoney-Sentiment.git
cd Nansen-SmartMoney-Sentiment

# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file with:
NANSEN_API_KEY=your_nansen_api_key_here

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 📊 Data Sources & Calculation Logic

### Nansen API Endpoints Used

1. **Smart Money DEX Trades** (`/smart-money/dex-trades`)
   - **Chains**: Ethereum, Base, Solana (200 trades each, fetched separately for balanced representation)
   - **Usage**: Inflows/Outflows widgets, Stablecoin Flows metric
   - **Logic**: Aggregates net flow by token+chain. Positive net = inflow, negative = outflow
   - **Cache**: 1 hour (revalidate: 3600s)

2. **Smart Money Perp Trades** (`/smart-money/perp-trades`)
   - **Platform**: Hyperliquid only
   - **Usage**: Sentiment calculation (Long/Short Delta, Perp Positions), Smart Traders widget
   - **Fetch**: 200 trades per request
   - **Aggregation**: Groups by trader to calculate positions and PnL

3. **Hyperliquid PnL Leaderboard** (`/hyperliquid/perp-pnl-leaderboard`)
   - **Period**: 7-day realized PnL
   - **Usage**: Realized PnL sentiment driver, Smart Traders ranking
   - **Fetch**: Top 50 traders

### Sentiment Calculation

The sentiment score is an aggregate of 4 weighted drivers:

1. **Long/Short Delta (4h)**: Measures change in position bias over 4 hours
   - Compares current total long/short with cached snapshot from 4h ago
   - Positive delta = increasing bullish positions

2. **Realized PnL (7d)**: Sum of top 50 Hyperliquid traders' 7-day PnL
   - Positive aggregate PnL = traders are winning = bullish
   - Negative aggregate PnL = traders are losing = bearish

3. **Stablecoin Flows**: Net flow into/out of stablecoins (USDT, USDC, DAI, etc.)
   - Buying stables = risk-off = bearish
   - Selling stables = risk-on = bullish
   - Calculated from DEX trades across all chains

4. **Perp Positions**: Current aggregate long vs short exposure
   - Higher long ratio = bullish
   - Higher short ratio = bearish

**Final Sentiment**: Weighted average of all drivers produces score from -1 (max bearish) to +1 (max bullish)
- Score > 0.2 = BULLISH 🐂
- Score < -0.2 = BEARISH 🐻
- Otherwise = NEUTRAL 😐

### Smart Money Definition (Nansen)
- Curated list of top 5,000 highest-performing wallets
- Ranked by realized profit, win rate, and consistent performance
- Includes Smart Traders (30D, 90D, 180D, all-time) and Funds

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📱 API Routes

The dashboard exposes the following Next.js API routes:

- **`/api/sentiment`** - Aggregate sentiment score with 4 drivers (dynamic, no cache)
- **`/api/top-tokens`** - Top 8 tokens by net inflow across ETH/Base/Solana (1h cache)
- **`/api/top-outflows`** - Top 8 tokens by net outflow across ETH/Base/Solana (1h cache)
- **`/api/smart-traders`** - Top 12-15 Hyperliquid traders by 7d PnL (dynamic, no cache)
- **`/api/market-sentiment`** - Hyperliquid perp position snapshot (dynamic)
- **`/api/stablecoin-flows`** - Stablecoin flow analysis across chains (dynamic)

All routes include error handling, retry logic, and fallback mechanisms for reliability.

## 🔗 External Links

Clicking on items in the dashboard opens relevant Nansen pages:
- **Token cards** → Nansen Token God Mode
- **Trader cards** → Nansen Wallet Profiler
- **Addresses** → Automatically copied to clipboard

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

Built for tracking smart money movements in real-time
