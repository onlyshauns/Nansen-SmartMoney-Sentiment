/**
 * Smart Traders API Route
 * Using real Nansen HL Realised PnL Leaderboard Service
 * Build timestamp: 2026-01-24T01:42:00Z
 */

import { NextResponse } from 'next/server';
import { getHLRealisedPnlLeaderboard } from '@/services/nansenHLRealisedPnl';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('[SmartTraders] Fetching leaderboard from real service...');

    // Fetch using the NEW real service
    const leaderboard = await getHLRealisedPnlLeaderboard({ window: '7d', limit: 25 });

    console.log(`[SmartTraders] ✓ Fetched ${leaderboard.rows.length} traders`);

    // Map to format UI expects
    const traders = leaderboard.rows.map((row) => ({
      rank: leaderboard.rows.indexOf(row) + 1,
      address: row.address,
      traderNameOrLabel: row.traderLabel || row.address.slice(0, 10),
      realisedPnlUsd: row.realisedPnlUsd,
      tradeCount: row.trades,
      bias: row.bias,
      biasReason: row.biasReason,
      longExposureUsd: row.longUsd,
      shortExposureUsd: row.shortUsd,
    }));

    return NextResponse.json({
      traders,
      timestamp: leaderboard.timestamp,
      isStale: false,
    });
  } catch (error) {
    console.error('[SmartTraders] API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch smart traders',
        details: error instanceof Error ? error.message : 'Unknown error',
        traders: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
