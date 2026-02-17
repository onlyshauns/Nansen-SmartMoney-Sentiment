# Claude Code Agent Context

This file provides context for AI coding agents working on this project.

## Project Overview

**Smart Money Sentiment Dashboard** - A Next.js dashboard that tracks smart money (institutional/whale) sentiment using Nansen API data. Displays real-time sentiment indicators, token flows, and Hyperliquid trader activity.

## Tech Stack

- **Framework**: Next.js 16.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (dark mode only)
- **API**: Nansen MCP integration for blockchain data

## Directory Structure

```
/app              # Next.js app router pages and API routes
  /api            # API route handlers (sentiment, tokens, traders)
  /components     # React components (widgets, tables, cards)
/lib              # Utility functions and helpers
/services         # API service layers and data fetching
/config           # Configuration files
/types            # TypeScript type definitions
```

## Key Files

- `app/page.tsx` - Main dashboard page
- `app/api/sentiment/route.ts` - Sentiment calculation endpoint
- `app/api/top-tokens/route.ts` - Token inflows endpoint
- `app/api/top-outflows/route.ts` - Token outflows endpoint
- `app/api/smart-traders/route.ts` - Hyperliquid traders endpoint
- `services/` - Nansen API service integrations

## Development Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
```

## Environment Variables

Required in `.env.local`:
```
NANSEN_API_KEY=your_nansen_api_key_here
```

## Nansen API Integration

This project uses Nansen MCP tools for data:
- `smart_traders_and_funds_perp_trades` - Hyperliquid perp trades
- `token_discovery_screener` - Token metrics and flows
- `hyperliquid_leaderboard` - Trader PnL rankings

## Design Guidelines

- **Background**: `#0a0e16` (dark)
- **Bullish**: `#00ffa7` (green glow)
- **Bearish**: `#ff4444` (red glow)
- **Neutral**: Yellow glow
- All tables should be scrollable with reduced font sizes
- Line spacing should be minimal in widgets

## Sentiment Calculation

The sentiment score (-1 to +1) is derived from 4 weighted drivers:
1. **Long/Short Delta (4h)** - Position bias change
2. **Realized PnL (7d)** - Top 50 traders' profit/loss
3. **Stablecoin Flows** - Risk-on/risk-off indicator
4. **Perp Positions** - Current long vs short exposure

Thresholds: > 0.2 = Bullish, < -0.2 = Bearish, else Neutral

## Recent Changes

- Restored scrollable format in Sentiment Drivers widget
- Reduced line spacing in dashboard tables
- Removed subtitle from Sentiment Drivers widget
- Added scrolling to all dashboard tables
- Widened sentiment thresholds for better visual alignment

## Notes for Agents

- Always test API routes after changes (`npm run dev`)
- The dashboard auto-refreshes every 3 minutes
- Token cards link to Nansen Token God Mode
- Trader cards link to Nansen Wallet Profiler
- Use the Nansen MCP tools when fetching blockchain data
