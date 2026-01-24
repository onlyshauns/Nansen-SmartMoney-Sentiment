/**
 * Smart Traders API - Completely Rebuilt v3
 * Direct implementation without intermediate service layers
 * Build: 2026-01-24T02:00:00Z
 */

import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

interface WalletBias {
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  longUsd: number;
  shortUsd: number;
}

export async function GET() {
  try {
    console.log('[SmartTraders-V2] Direct fetch from Nansen API...');
    
    const client = getNansenClient();
    const perpTrades = await client.getSmartMoneyPerpTrades(1, 200);

    if (!Array.isArray(perpTrades) || perpTrades.length === 0) {
      throw new Error('No trades available');
    }

    console.log(`[SmartTraders-V2] Got ${perpTrades.length} trades, first trader: ${perpTrades[0]?.trader_address_label}`);

    // Aggregate by trader address
    const traderMap = new Map<string, {
      address: string;
      label: string;
      volume: number;
      count: number;
      longVol: number;
      shortVol: number;
    }>();

    perpTrades.forEach((trade: any) => {
      const addr = trade.trader_address;
      const label = trade.trader_address_label || '';
      const side = (trade.side || '').toLowerCase();
      const value = trade.value_usd || 0;

      if (!addr || !value) return;

      const existing = traderMap.get(addr) || {
        address: addr,
        label,
        volume: 0,
        count: 0,
        longVol: 0,
        shortVol: 0,
      };

      existing.volume += value;
      existing.count += 1;
      if (side === 'long') existing.longVol += value;
      if (side === 'short') existing.shortVol += value;

      traderMap.set(addr, existing);
    });

    // Sort and take top 15
    const topTraders = Array.from(traderMap.values())
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 15);

    // Calculate bias
    const traders = topTraders.map((t, idx) => {
      const totalExposure = t.longVol + t.shortVol;
      const netExposure = t.longVol - t.shortVol;
      const biasRatio = totalExposure > 0 ? netExposure / totalExposure : 0;
      
      let bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      if (biasRatio > 0.2) bias = 'BULLISH';
      else if (biasRatio < -0.2) bias = 'BEARISH';

      return {
        rank: idx + 1,
        address: t.address,
        traderNameOrLabel: t.label || t.address.slice(0, 10),
        realisedPnlUsd: t.volume,
        tradeCount: t.count,
        bias,
        longExposureUsd: t.longVol,
        shortExposureUsd: t.shortVol,
      };
    });

    console.log(`[SmartTraders-V2] Returning ${traders.length} traders`);

    return NextResponse.json(
      {
        traders,
        timestamp: new Date().toISOString(),
        isStale: false,
        version: 'v2-direct-implementation',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('[SmartTraders-V2] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch',
        details: error instanceof Error ? error.message : 'Unknown',
        traders: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
