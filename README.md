# Smart Money Dashboard

A real-time dashboard for tracking smart money sentiment and activity on Hyperliquid using Nansen API data. Features sentiment analysis, top tokens, active traders, and live trade feeds.

## 🎯 Features

### Sentiment Hero
- **Large visual sentiment indicator** with emoji (🐂 Bull / 🐻 Bear / 😐 Neutral)
- **Aggregate statistics** showing total long/short positions
- **Visual ratio bar** displaying long vs short percentages
- **Dynamic color theming** based on market sentiment

### Top Tokens Widget
- **Top tokens by net inflow** from smart money wallets
- Click to open **Nansen Token God Mode** for detailed analysis
- **Copy token address** functionality
- Shows buy/sell counts and chain information

### Top Traders Widget
- **Most active traders by volume** on Hyperliquid
- **Long/Short ratio visualization** with color-coded bars
- Click to open **Nansen Wallet Profiler** for trader analysis
- Shows trade counts and dominant trading side

### Live Trades Feed
- **Real-time trade feed** across DEX and perpetual markets
- Color-coded buy/sell/long/short actions
- Token symbols, values (formatted $XXK/$XXM), and timestamps
- Auto-updates with new activity

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

## 📊 Data Sources

### Nansen API
- **Smart Money Holdings** - Token balances from top-performing wallets
- **DEX Trades** - Real-time transaction feed from smart money wallets
- **Hyperliquid Positions** - Smart trader perpetual positions and activity

**Smart Money Definition:**
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

## 📱 API Integration

The dashboard integrates with multiple Nansen endpoints:

- `/api/sentiment` - Aggregate smart money sentiment and position data
- `/api/top-tokens` - Tokens with highest net inflow from smart money
- `/api/top-traders` - Most active Hyperliquid traders by volume
- `/api/live-trades` - Real-time feed of smart money trades

All API routes include caching and error handling for reliability.

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
