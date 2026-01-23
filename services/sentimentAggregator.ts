/**
 * Sentiment Data Aggregator
 *
 * Combines data from all sources for sentiment calculation
 */

import { cache } from './cache';
import { calculateSentiment, SentimentResult } from '../lib/sentimentScore';

const CACHE_KEY = 'sentiment_aggregated';
const CACHE_TTL_MS = 30000; // 30s fresh
const STALE_TTL_MS = 600000; // 10min stale

// Historical tracking for delta calculation
interface HistoricalSnapshot {
  timestamp: number;
  netExposureUsd: number;
}

const historicalSnapshots: HistoricalSnapshot[] = [];
const MAX_HISTORICAL_SNAPSHOTS = 100;

/**
 * Store a historical snapshot for delta calculation
 */
function storeHistoricalSnapshot(netExposureUsd: number) {
  historicalSnapshots.push({
    timestamp: Date.now(),
    netExposureUsd,
  });

  // Keep only last N snapshots
  if (historicalSnapshots.length > MAX_HISTORICAL_SNAPSHOTS) {
    historicalSnapshots.shift();
  }
}

/**
 * Get historical net exposure from N hours ago
 */
function getHistoricalNetExposure(hoursAgo: number): number | null {
  const targetTimestamp = Date.now() - hoursAgo * 3600 * 1000;

  // Find closest snapshot to target timestamp
  let closest: HistoricalSnapshot | null = null;
  let minDiff = Infinity;

  for (const snapshot of historicalSnapshots) {
    const diff = Math.abs(snapshot.timestamp - targetTimestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = snapshot;
    }
  }

  // Only return if within reasonable window (± 30 minutes)
  if (closest && minDiff < 1800000) {
    return closest.netExposureUsd;
  }

  return null;
}

/**
 * Mock data generator for development
 */
function generateMockSentimentData(): SentimentResult {
  const longUsd = 50000000 + Math.random() * 20000000;
  const shortUsd = 30000000 + Math.random() * 15000000;
  const netExposureNow = longUsd - shortUsd;
  const netExposureLookback = netExposureNow - (Math.random() - 0.5) * 10000000;
  const netStableUsd = (Math.random() - 0.5) * 20000000;
  const realisedPnl7dUsd = (Math.random() - 0.3) * 5000000;

  const mockWallets = Array.from({ length: 20 }, (_, i) => ({
    netExposureUsd: (Math.random() - 0.5) * 10000000,
  }));

  return calculateSentiment({
    perps: {
      longUsd,
      shortUsd,
      netExposureNow,
      netExposureLookback,
    },
    spot: {
      netStableUsd,
    },
    pnl: {
      realisedPnl7dUsd,
    },
    wallets: mockWallets,
    stale: false,
  });
}

/**
 * Fetch perps positions from Nansen Hyperliquid
 */
async function fetchPerpsPositions(): Promise<{
  longUsd: number;
  shortUsd: number;
  wallets: Array<{ netExposureUsd: number }>;
}> {
  // TODO: Replace with actual Nansen API call
  // const response = await fetch(NANSEN_PERPS_ENDPOINT, {
  //   headers: { 'X-API-Key': process.env.NANSEN_API_KEY }
  // });
  // const data = await response.json();

  // Mock implementation
  const longUsd = 50000000 + Math.random() * 20000000;
  const shortUsd = 30000000 + Math.random() * 15000000;
  const wallets = Array.from({ length: 20 }, () => ({
    netExposureUsd: (Math.random() - 0.5) * 10000000,
  }));

  return { longUsd, shortUsd, wallets };
}

/**
 * Fetch spot flows from Nansen Spot Smart Money
 */
async function fetchSpotFlows(): Promise<{
  netStableUsd: number;
}> {
  // TODO: Replace with actual Nansen API call
  // const response = await fetch(NANSEN_SPOT_ENDPOINT, {
  //   headers: { 'X-API-Key': process.env.NANSEN_API_KEY }
  // });
  // const data = await response.json();

  // Mock implementation
  const netStableUsd = (Math.random() - 0.5) * 20000000;

  return { netStableUsd };
}

/**
 * Fetch 7D realised PnL from Nansen Hyperliquid
 */
async function fetchRealisedPnL(): Promise<{
  realisedPnl7dUsd: number;
}> {
  // TODO: Replace with actual Nansen API call
  // const response = await fetch(NANSEN_PNL_ENDPOINT, {
  //   headers: { 'X-API-Key': process.env.NANSEN_API_KEY }
  // });
  // const data = await response.json();

  // Mock implementation
  const realisedPnl7dUsd = (Math.random() - 0.3) * 5000000;

  return { realisedPnl7dUsd };
}

/**
 * Main aggregator function
 */
export async function aggregateSentimentData(): Promise<SentimentResult> {
  // Check cache first
  const cached = cache.get<SentimentResult>(CACHE_KEY, CACHE_TTL_MS);
  if (cached && !cached.isStale) {
    return cached.data;
  }

  try {
    // Fetch all data in parallel
    const [perpsData, spotData, pnlData] = await Promise.all([
      fetchPerpsPositions(),
      fetchSpotFlows(),
      fetchRealisedPnL(),
    ]);

    const netExposureNow = perpsData.longUsd - perpsData.shortUsd;

    // Store current snapshot for future delta calculations
    storeHistoricalSnapshot(netExposureNow);

    // Get historical snapshot for delta (default 4h ago)
    const netExposureLookback =
      getHistoricalNetExposure(4) ?? netExposureNow * 0.95; // Fallback: assume 5% growth

    // Calculate sentiment
    const result = calculateSentiment({
      perps: {
        longUsd: perpsData.longUsd,
        shortUsd: perpsData.shortUsd,
        netExposureNow,
        netExposureLookback,
      },
      spot: {
        netStableUsd: spotData.netStableUsd,
      },
      pnl: {
        realisedPnl7dUsd: pnlData.realisedPnl7dUsd,
      },
      wallets: perpsData.wallets,
      stale: false,
    });

    // Cache the result
    cache.set(CACHE_KEY, result, CACHE_TTL_MS, STALE_TTL_MS);

    return result;
  } catch (error) {
    console.error('Failed to aggregate sentiment data:', error);

    // Try stale cache
    const staleCache = cache.get<SentimentResult>(CACHE_KEY, STALE_TTL_MS);
    if (staleCache) {
      console.warn('Serving stale sentiment data');
      return {
        ...staleCache.data,
        meta: {
          ...staleCache.data.meta,
          stale: true,
        },
      };
    }

    // Fallback to mock data
    console.warn('Using mock sentiment data');
    const mockResult = generateMockSentimentData();
    cache.set(CACHE_KEY, mockResult, CACHE_TTL_MS, STALE_TTL_MS);
    return mockResult;
  }
}
