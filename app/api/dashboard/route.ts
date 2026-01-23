/**
 * Dashboard Aggregator Endpoint
 * Fetches all 4 data sources in one call to prevent frontend waterfalls
 */

import { NextResponse } from 'next/server';
import { getHLPerpsSmartMoneySnapshot } from '@/services/nansenHLPerpsSnapshot';
import { getHLPerpsSmartMoneyDelta } from '@/services/nansenHLPerpsDelta';
import { getSpotSmartMoneyTokenFlows } from '@/services/nansenSpotSmartMoneyFlows';
import { getHLRealisedPnlLeaderboard } from '@/services/nansenHLRealisedPnl';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  stale: boolean;
}

const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string, ttl: number): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > ttl) {
    // Mark as stale but keep it
    entry.stale = true;
    if (age > ttl * 3) {
      // Too old, delete it
      cache.delete(key);
      return null;
    }
  }

  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    stale: false,
  });
}

export async function GET() {
  try {
    const startTime = Date.now();

    // Fetch all 4 data sources in parallel (with caching)
    const [snapshot, delta, flows, leaderboard] = await Promise.allSettled([
      fetchWithCache('hl_snapshot', () => getHLPerpsSmartMoneySnapshot(), 45000), // 45s TTL
      fetchWithCache('hl_delta', () => getHLPerpsSmartMoneyDelta(), 60000), // 60s TTL
      fetchWithCache('spot_flows', () => getSpotSmartMoneyTokenFlows({ limit: 8 }), 45000), // 45s TTL
      fetchWithCache('hl_leaderboard', () => getHLRealisedPnlLeaderboard({ limit: 25 }), 120000), // 120s TTL
    ]);

    // Extract data or handle failures gracefully
    const snapshotData = snapshot.status === 'fulfilled' ? snapshot.value : null;
    const deltaData = delta.status === 'fulfilled' ? delta.value : null;
    const flowsData = flows.status === 'fulfilled' ? flows.value : null;
    const leaderboardData = leaderboard.status === 'fulfilled' ? leaderboard.value : null;

    const duration = Date.now() - startTime;

    console.log(`[Dashboard] Aggregated data in ${duration}ms`);
    console.log(`[Dashboard] Snapshot: ${snapshotData ? 'OK' : 'FAIL'}, Delta: ${deltaData ? 'OK' : 'FAIL'}, Flows: ${flowsData ? 'OK' : 'FAIL'}, Leaderboard: ${leaderboardData ? 'OK' : 'FAIL'}`);

    return NextResponse.json({
      success: true,
      data: {
        // Hyperliquid Perps Snapshot
        hlSnapshot: snapshotData || {
          longExposureUsd: 0,
          shortExposureUsd: 0,
          totalOiUsd: 0,
          netExposureUsd: 0,
          timestamp: new Date().toISOString(),
        },

        // Hyperliquid Perps Delta
        hlDelta: deltaData || {
          deltaNetExposureUsd: 0,
          currentNetExposureUsd: 0,
          lookbackNetExposureUsd: 0,
          lookbackWindow: '4h',
          timestamp: new Date().toISOString(),
        },

        // Spot Token Flows (Inflows + Outflows)
        spotInflows: flowsData?.inflows || [],
        spotOutflows: flowsData?.outflows || [],

        // Hyperliquid 7D Realised PnL Leaderboard
        hlLeaderboard7d: leaderboardData?.rows || [],
      },
      meta: {
        timestamp: new Date().toISOString(),
        durationMs: duration,
        stale: {
          snapshot: snapshot.status === 'fulfilled' && (snapshot.value as any).stale,
          delta: delta.status === 'fulfilled' && (delta.value as any).stale,
          flows: flows.status === 'fulfilled' && (flows.value as any).stale,
          leaderboard: leaderboard.status === 'fulfilled' && (leaderboard.value as any).stale,
        },
        errors: {
          snapshot: snapshot.status === 'rejected' ? (snapshot.reason as Error).message : null,
          delta: delta.status === 'rejected' ? (delta.reason as Error).message : null,
          flows: flows.status === 'rejected' ? (flows.reason as Error).message : null,
          leaderboard: leaderboard.status === 'rejected' ? (leaderboard.reason as Error).message : null,
        },
      },
    });
  } catch (error) {
    console.error('[Dashboard] Critical error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to aggregate dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch with caching helper
 */
async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  // Try cache first
  const cached = getCached<T>(key, ttl);
  if (cached) {
    console.log(`[Dashboard] Cache HIT: ${key}`);
    return cached;
  }

  console.log(`[Dashboard] Cache MISS: ${key}, fetching...`);

  // Fetch and cache
  const data = await fetcher();
  setCache(key, data);

  return data;
}
