// Nansen API Types
export interface NansenSmartMoneyHolding {
  token: string;
  symbol: string;
  balance: number;
  value_usd: number;
  change_24h: number;
  chain: string;
}

export interface NansenDEXTrade {
  wallet_address: string;
  token: string;
  symbol: string;
  trade_type: 'buy' | 'sell';
  amount: number;
  value_usd: number;
  timestamp: string;
  dex: string;
}

export interface NansenNetflow {
  token: string;
  symbol: string;
  net_flow: number;
  buy_volume: number;
  sell_volume: number;
  unique_wallets: number;
  timestamp: string;
}

// Hyperliquid API Types
export interface HyperliquidPosition {
  user: string;
  coin: string;
  position_size: number;
  entry_price: number;
  mark_price: number;
  pnl: number;
  margin_used: number;
  liquidation_price: number;
  leverage: number;
  side: 'long' | 'short';
}

export interface HyperliquidTrade {
  user: string;
  coin: string;
  side: 'long' | 'short';
  size: number;
  price: number;
  timestamp: string;
}

// Dashboard Types
export interface SentimentData {
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number;
  change_24h: number;
  buy_volume_24h: number;
  sell_volume_24h: number;
  long_short_ratio: number;
}

export interface TokenSentiment {
  token: string;
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  smart_money_holders: number;
  net_flow_24h: number;
  hyperliquid_long_ratio: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

// Hyperliquid Market Data Types
export interface TokenMarketData {
  symbol: string;
  fundingRate: number;
  openInterest: number;         // in tokens
  openInterestUsd: number;      // in USD
  markPrice: number;
  volume24h: number;
  premium: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface TokenBreakdown {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  fundingRate: number;
  openInterestUsd: number;
  contributionPercent: number;
}
