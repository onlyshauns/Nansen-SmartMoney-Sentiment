# Nansen SmartMoney Sentiment Tracker

A real-time dashboard for tracking smart money sentiment using Nansen smart money wallets and Hyperliquid smart trader positions.

## 🎯 Project Scope

### Core Functionality
- **Sentiment Overview Dashboard** - Aggregate and visualize overall smart money sentiment
- **Spot Market Tracker** - Monitor smart money buy/sell transactions from Nansen
- **Hyperliquid Positions Monitor** - Track smart trader positions and activity
- **Analytics & Insights** - Historical trends and correlation analysis

### Data Sources

#### 1. Nansen API
Official documentation: [Nansen Smart Money API](https://docs.nansen.ai/api/smart-money)

**Key Endpoints:**
- **Holdings** - Aggregated smart trader and fund token balances with 24h changes (5 credits/call)
- **DEX Trades** - Individual smart trader and fund DEX transactions in last 24h
- **Netflows** - Token flow analysis showing accumulation/distribution patterns

**Smart Money Definition:**
- Curated list of top 5,000 highest-performing wallets
- Ranked by realized profit, win rate, and strong performance across market cycles
- Includes Smart Traders (30D, 90D, 180D, all-time) and Funds

**Authentication:**
- Base URL: `https://api.nansen.ai/api/beta`
- API Key required in header

#### 2. Hyperliquid API
Official documentation: [Hyperliquid Docs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)

**Key Endpoints:**
- **Info Endpoint** - Query account data including positions
- **Perpetuals & Spot** - Trading data for perps and spot markets
- **WebSocket** - Real-time price feeds and position updates

**Smart Trader Tracking:**
- Via [Nansen Hyperliquid API](https://docs.nansen.ai/api/hyperliquid)
- Monitor positions, analyze trades, follow smart money activity
- Track open positions, margin, liquidation prices, P&L

## 🏗️ Tech Stack

- **Framework:** Next.js 16.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom React components
- **API Integration:** REST APIs + WebSocket (planned)

## 📋 Features Roadmap

### Phase 1: MVP Dashboard (Current)
- [x] Project setup with Next.js + TypeScript
- [x] Tailwind CSS configuration
- [x] Basic dashboard layout
- [x] Sentiment overview cards
- [ ] API integration setup
- [ ] Environment configuration

### Phase 2: Nansen Integration
- [ ] Nansen API client setup
- [ ] Smart money holdings display
- [ ] DEX trades feed
- [ ] Netflow analysis visualization
- [ ] Token-specific sentiment

### Phase 3: Hyperliquid Integration
- [ ] Hyperliquid API client setup
- [ ] Smart trader positions display
- [ ] Long/short ratio visualization
- [ ] Position size tracking
- [ ] Real-time WebSocket updates

### Phase 4: Analytics & Insights
- [ ] Historical sentiment trends
- [ ] Price correlation analysis
- [ ] Alert system for significant moves
- [ ] Export/share functionality

### Phase 5: Advanced Features
- [ ] Multi-timeframe analysis
- [ ] Custom wallet watchlists
- [ ] Portfolio tracking
- [ ] Mobile responsive optimizations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Nansen API key ([Get one here](https://www.nansen.ai/api))
- Hyperliquid account (optional, for private data)

### Installation

```bash
# Clone the repository
git clone https://github.com/onlyshauns/Nansen-SmartMoney-Sentiment.git
cd Nansen-SmartMoney-Sentiment

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Environment Variables

Create a `.env.local` file with the following:

```env
NANSEN_API_KEY=your_nansen_api_key_here
HYPERLIQUID_API_KEY=your_hyperliquid_api_key_here (optional)
```

## 📚 API Documentation References

- [Nansen API Reference](https://docs.nansen.ai/nansen-api-reference)
- [Nansen Smart Money API](https://docs.nansen.ai/api/smart-money)
- [Hyperliquid API Docs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)
- [Hyperliquid Info Endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint)

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

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

Built with ❤️ for tracking smart money movements
