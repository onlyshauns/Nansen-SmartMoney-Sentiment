/**
 * Nansen Hyperliquid Smart Money API adapter
 * Handles API calls with retry logic, timeout, and error handling
 */

import { SENTIMENT_CONFIG, NANSEN_ENDPOINTS } from '../config/sentiment';
import { cache } from './cache';

const NANSEN_API_KEY = process.env.NANSEN_API_KEY || '';

interface Position {
  trader: string;
  longExposureUsd: number;
  shortExposureUsd: number;
  netExposureUsd: number;
  timestamp: string;
}

interface SmartMoneyPositionsResponse {
  positions: Position[];
  totalLongExposureUsd: number;
  totalShortExposureUsd: number;
  timestamp: string;
}

interface TokenFlow {
  token: string;
  chain: string;
  inflowUsd: number;
  outflowUsd: number;
  netFlowUsd: number;
}

interface TokenFlowsResponse {
  flows: TokenFlow[];
  timestamp: string;
}

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = SENTIMENT_CONFIG.API_MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = SENTIMENT_CONFIG.API_RETRY_DELAY_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Get smart money positions from Nansen Hyperliquid
 */
export async function getSmartMoneyPositions(): Promise<SmartMoneyPositionsResponse> {
  const cacheKey = 'smart_money_positions';

  // Check cache first
  const cached = cache.get<SmartMoneyPositionsResponse>(
    cacheKey,
    SENTIMENT_CONFIG.CACHE_TTL_MS
  );

  if (cached) {
    return cached.data;
  }

  // TODO: Replace with actual Nansen API call when endpoint is confirmed
  // For now, using mock data structure with real calculation logic

  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetchWithTimeout(
        NANSEN_ENDPOINTS.SMART_MONEY_POSITIONS,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${NANSEN_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
        SENTIMENT_CONFIG.API_TIMEOUT_MS
      );

      if (!res.ok) {
        throw new Error(`Nansen API error: ${res.status}`);
      }

      return res.json();
    });

    // Cache the response
    cache.set(
      cacheKey,
      response,
      SENTIMENT_CONFIG.CACHE_TTL_MS,
      SENTIMENT_CONFIG.STALE_CACHE_TTL_MS
    );

    return response;
  } catch (error) {
    console.error('Failed to fetch smart money positions:', error);

    // Try to serve stale cache
    const staleCache = cache.get<SmartMoneyPositionsResponse>(
      cacheKey,
      SENTIMENT_CONFIG.STALE_CACHE_TTL_MS
    );

    if (staleCache) {
      console.warn('Serving stale cache for smart money positions');
      return staleCache.data;
    }

    // Fallback to mock data if no cache available
    // TODO: Remove this fallback once real API is integrated
    return generateMockPositions();
  }
}

/**
 * Get token flows (including stablecoins)
 */
export async function getTokenFlows(): Promise<TokenFlowsResponse> {
  const cacheKey = 'token_flows';

  const cached = cache.get<TokenFlowsResponse>(cacheKey, SENTIMENT_CONFIG.CACHE_TTL_MS);

  if (cached) {
    return cached.data;
  }

  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetchWithTimeout(
        NANSEN_ENDPOINTS.TOKEN_FLOWS,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${NANSEN_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
        SENTIMENT_CONFIG.API_TIMEOUT_MS
      );

      if (!res.ok) {
        throw new Error(`Nansen API error: ${res.status}`);
      }

      return res.json();
    });

    cache.set(
      cacheKey,
      response,
      SENTIMENT_CONFIG.CACHE_TTL_MS,
      SENTIMENT_CONFIG.STALE_CACHE_TTL_MS
    );

    return response;
  } catch (error) {
    console.error('Failed to fetch token flows:', error);

    const staleCache = cache.get<TokenFlowsResponse>(
      cacheKey,
      SENTIMENT_CONFIG.STALE_CACHE_TTL_MS
    );

    if (staleCache) {
      console.warn('Serving stale cache for token flows');
      return staleCache.data;
    }

    // Fallback to mock data
    return generateMockFlows();
  }
}

/**
 * Mock data generator for development
 * TODO: Remove once real Nansen API is integrated
 */
function generateMockPositions(): SmartMoneyPositionsResponse {
  const positions: Position[] = Array.from({ length: 10 }, (_, i) => {
    const longBias = Math.random() > 0.4; // 60% bullish bias for mock
    const longExp = longBias ? Math.random() * 5000000 : Math.random() * 2000000;
    const shortExp = longBias ? Math.random() * 2000000 : Math.random() * 5000000;

    return {
      trader: `0x${Math.random().toString(16).slice(2, 42)}`,
      longExposureUsd: longExp,
      shortExposureUsd: shortExp,
      netExposureUsd: longExp - shortExp,
      timestamp: new Date().toISOString(),
    };
  });

  const totalLong = positions.reduce((sum, p) => sum + p.longExposureUsd, 0);
  const totalShort = positions.reduce((sum, p) => sum + p.shortExposureUsd, 0);

  return {
    positions,
    totalLongExposureUsd: totalLong,
    totalShortExposureUsd: totalShort,
    timestamp: new Date().toISOString(),
  };
}

function generateMockFlows(): TokenFlowsResponse {
  const flows: TokenFlow[] = [
    {
      token: 'USDT',
      chain: 'ethereum',
      inflowUsd: Math.random() * 8000000,
      outflowUsd: Math.random() * 12000000,
      netFlowUsd: 0,
    },
    {
      token: 'USDC',
      chain: 'ethereum',
      inflowUsd: Math.random() * 6000000,
      outflowUsd: Math.random() * 9000000,
      netFlowUsd: 0,
    },
  ];

  flows.forEach((f) => (f.netFlowUsd = f.inflowUsd - f.outflowUsd));

  return {
    flows,
    timestamp: new Date().toISOString(),
  };
}
