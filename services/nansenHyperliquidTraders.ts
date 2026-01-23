import { cache } from './cache';
import { SENTIMENT_CONFIG } from '../config/sentiment';

// TODO: Update with actual Nansen Hyperliquid Smart Money trader endpoints
const NANSEN_TRADERS_ENDPOINT = 'https://api.nansen.ai/v1/hyperliquid/smart-money/traders';

// Cache config for traders data
const TRADERS_CACHE_KEY = 'hyperliquid_smart_traders';
const TRADERS_CACHE_TTL_MS = 60000; // 60 seconds fresh
const TRADERS_STALE_TTL_MS = 600000; // 10 minutes stale

export interface SmartMoneyTrader {
  rank: number;
  traderNameOrLabel: string;
  address: string;
  realisedPnlUsd: number;
  tradeCount?: number;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  longExposureUsd?: number;
  shortExposureUsd?: number;
}

export interface TradersLeaderboardResponse {
  traders: SmartMoneyTrader[];
  timestamp: string;
  isStale?: boolean;
}

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Generate mock traders data for development/fallback
 */
function generateMockTraders(): SmartMoneyTrader[] {
  const mockNames = [
    'SmartWhale',
    'AlphaSeeker',
    'DegenKing',
    'CryptoSavant',
    'YieldFarmer',
    'LeverageGod',
    'MEVMaster',
    'DeltaNeutral',
    'ArbitrageBot',
    'VolatilityHunter',
    'MarketMaker',
    'TrendFollower',
    'SwingTrader',
    'ScalpMaster',
    'GridBot',
    'FundingHarvester',
    'OrderFlowTrader',
    'QuantGuru',
    'RiskArbiter',
    'LiquiditySniper',
    'FlashTrader',
    'ContrarianApe',
    'MomentumChad',
    'RangeNinja',
    'BreakoutHunter',
  ];

  return mockNames.map((name, idx) => {
    const longExposureUsd = Math.random() * 3000000;
    const shortExposureUsd = Math.random() * 3000000;
    const netExposure = longExposureUsd - shortExposureUsd;
    const totalExposure = longExposureUsd + shortExposureUsd;

    // Calculate bias based on net exposure
    let bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (totalExposure > 100000) {
      const biasRatio = netExposure / totalExposure;
      if (biasRatio > 0.2) {
        bias = 'BULLISH';
      } else if (biasRatio < -0.2) {
        bias = 'BEARISH';
      }
    }

    return {
      rank: idx + 1,
      traderNameOrLabel: name,
      address: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
      realisedPnlUsd: Math.random() * 5000000 - 500000, // -500K to +4.5M
      tradeCount: Math.floor(Math.random() * 500) + 50,
      bias,
      longExposureUsd,
      shortExposureUsd,
    };
  })
    .sort((a, b) => b.realisedPnlUsd - a.realisedPnlUsd)
    .map((trader, idx) => ({ ...trader, rank: idx + 1 }));
}

/**
 * Fetch smart money traders from Nansen Hyperliquid endpoint
 * Returns top 10 traders by 7D realised PnL
 */
export async function getSmartMoneyTraders(): Promise<TradersLeaderboardResponse> {
  const cacheKey = TRADERS_CACHE_KEY;

  // Check cache first
  const cached = cache.get<TradersLeaderboardResponse>(cacheKey, TRADERS_CACHE_TTL_MS);
  if (cached && !cached.isStale) {
    return cached.data;
  }

  try {
    // Try to fetch from Nansen API with retry logic
    const response = await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        SENTIMENT_CONFIG.API_TIMEOUT_MS
      );

      try {
        // TODO: Update query params when actual endpoint is confirmed
        const res = await fetch(`${NANSEN_TRADERS_ENDPOINT}?period=7d&limit=25`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            // TODO: Add API key header if required
            // 'X-API-Key': process.env.NANSEN_API_KEY || '',
          },
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Nansen API error: ${res.status}`);
        }

        return res.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    });

    // Map API response to our interface
    // TODO: Adjust mapping based on actual API response structure
    const traders: SmartMoneyTrader[] = (response.traders || response.data || [])
      .slice(0, 25)
      .map((trader: any, idx: number) => {
        const longExposureUsd = trader.longExposure || trader.longExposureUsd || 0;
        const shortExposureUsd = trader.shortExposure || trader.shortExposureUsd || 0;
        const netExposure = longExposureUsd - shortExposureUsd;
        const totalExposure = longExposureUsd + shortExposureUsd;

        // Calculate bias based on exposure data
        let bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
        if (totalExposure > 100000) {
          const biasRatio = netExposure / totalExposure;
          if (biasRatio > 0.2) {
            bias = 'BULLISH';
          } else if (biasRatio < -0.2) {
            bias = 'BEARISH';
          }
        }

        return {
          rank: idx + 1,
          traderNameOrLabel: trader.name || trader.label || `Trader ${idx + 1}`,
          address: trader.address || trader.walletAddress || '',
          realisedPnlUsd: trader.realisedPnl || trader.pnl || 0,
          tradeCount: trader.tradeCount || trader.trades || undefined,
          bias,
          longExposureUsd,
          shortExposureUsd,
        };
      });

    const result: TradersLeaderboardResponse = {
      traders,
      timestamp: new Date().toISOString(),
      isStale: false,
    };

    // Cache the result
    cache.set(cacheKey, result, TRADERS_CACHE_TTL_MS, TRADERS_STALE_TTL_MS);

    return result;
  } catch (error) {
    console.error('Failed to fetch smart money traders:', error);

    // Try stale cache
    const staleCache = cache.get<TradersLeaderboardResponse>(
      cacheKey,
      TRADERS_STALE_TTL_MS
    );
    if (staleCache) {
      console.warn('Serving stale cache for smart money traders');
      return {
        ...staleCache.data,
        isStale: true,
      };
    }

    // Fallback to mock data
    console.warn('Using mock data for smart money traders');
    const mockTraders = generateMockTraders();
    const mockResult: TradersLeaderboardResponse = {
      traders: mockTraders,
      timestamp: new Date().toISOString(),
      isStale: false,
    };

    // Cache mock data briefly
    cache.set(cacheKey, mockResult, TRADERS_CACHE_TTL_MS, TRADERS_STALE_TTL_MS);

    return mockResult;
  }
}
