/**
 * Hyperliquid Smart Money - Perps Position Change (Delta)
 * Used for: "Perps exposure change" driver (e.g., change over 4h)
 */

import { getHLPerpsSmartMoneySnapshot } from './nansenHLPerpsSnapshot';

export interface HLPerpsDelta {
  deltaNetExposureUsd: number;
  currentNetExposureUsd: number;
  lookbackNetExposureUsd: number;
  lookbackWindow: string;
  timestamp: string;
}

// Simple in-memory cache for lookback snapshots
const snapshotCache = new Map<string, { netExposure: number; timestamp: number }>();
const CACHE_KEY = 'hl_perps_lookback';
const LOOKBACK_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Get Hyperliquid perps smart money delta (position change over time)
 * @param lookbackWindow - Time window to look back (default: "4h")
 * @returns Delta between current and lookback net exposure
 */
export async function getHLPerpsSmartMoneyDelta(params?: {
  lookbackWindow?: string;
}): Promise<HLPerpsDelta> {
  try {
    const lookbackWindow = params?.lookbackWindow || '4h';

    // Get current snapshot
    const currentSnapshot = await getHLPerpsSmartMoneySnapshot();
    const currentNetExposureUsd = currentSnapshot.netExposureUsd;

    // Try to get lookback snapshot from cache
    const cached = snapshotCache.get(CACHE_KEY);
    const now = Date.now();

    let lookbackNetExposureUsd = 0;
    let deltaNetExposureUsd = 0;

    if (cached && now - cached.timestamp < LOOKBACK_MS) {
      // Cache is still valid (less than 4h old)
      lookbackNetExposureUsd = cached.netExposure;
      deltaNetExposureUsd = currentNetExposureUsd - lookbackNetExposureUsd;

      console.log(`[HLPerpsDelta] Delta: $${deltaNetExposureUsd.toFixed(0)} (Current: $${currentNetExposureUsd.toFixed(0)}, Lookback: $${lookbackNetExposureUsd.toFixed(0)})`);
    } else {
      // No valid lookback data, store current as new baseline
      snapshotCache.set(CACHE_KEY, {
        netExposure: currentNetExposureUsd,
        timestamp: now,
      });

      console.log(`[HLPerpsDelta] No lookback data, setting baseline: $${currentNetExposureUsd.toFixed(0)}`);

      // Delta is 0 when we don't have lookback data yet
      deltaNetExposureUsd = 0;
      lookbackNetExposureUsd = currentNetExposureUsd;
    }

    return {
      deltaNetExposureUsd,
      currentNetExposureUsd,
      lookbackNetExposureUsd,
      lookbackWindow,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[HLPerpsDelta] Error:', error);
    throw error;
  }
}
