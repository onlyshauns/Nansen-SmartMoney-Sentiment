/**
 * Sentiment calculation configuration
 */

export const SENTIMENT_CONFIG = {
  // Weighting
  POSITION_WEIGHT: 0.8, // 80% weight for position bias
  STABLE_FLOW_WEIGHT: 0.2, // 20% weight for stablecoin flows

  // Sentiment thresholds
  BEARISH_THRESHOLD: -0.15,
  BULLISH_THRESHOLD: 0.15,

  // Position calculation
  MIN_POSITION_THRESHOLD: 1000, // USD - ignore dust positions below this

  // Stablecoin flow normalization
  STABLE_FLOW_SCALE: 10000000, // 10M USD - scale factor for normalization

  // Time window
  TIME_WINDOW_HOURS: 24,

  // Caching
  CACHE_TTL_MS: 30000, // 30 seconds
  STALE_CACHE_TTL_MS: 300000, // 5 minutes for stale fallback

  // API retry
  API_TIMEOUT_MS: 10000,
  API_MAX_RETRIES: 3,
  API_RETRY_DELAY_MS: 1000,
};

export const STABLECOINS = {
  ethereum: ['USDT', 'USDC', 'DAI', 'FDUSD', 'TUSD'],
  base: ['USDC', 'USDbC', 'DAI'],
  arbitrum: ['USDT', 'USDC', 'DAI', 'FRAX'],
  optimism: ['USDT', 'USDC', 'DAI'],
  polygon: ['USDT', 'USDC', 'DAI'],
};

// TODO: Update with actual Nansen Hyperliquid API endpoints when available
export const NANSEN_ENDPOINTS = {
  SMART_MONEY_POSITIONS: 'https://api.nansen.ai/v1/hyperliquid/smart-money/positions',
  TRADER_ACTIVITY: 'https://api.nansen.ai/v1/hyperliquid/smart-money/activity',
  TOKEN_FLOWS: 'https://api.nansen.ai/v1/hyperliquid/token-flows',
};
