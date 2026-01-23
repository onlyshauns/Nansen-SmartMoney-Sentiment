/**
 * Hyperliquid Smart Money - Perps Positions Snapshot
 * Used for: long %, short %, total OI, perps net exposure driver
 */

import { getNansenClient } from '../lib/nansen-client';

export interface HLPerpsSnapshot {
  longExposureUsd: number;
  shortExposureUsd: number;
  totalOiUsd: number;
  netExposureUsd: number;
  byWallet?: Array<{
    address: string;
    longUsd: number;
    shortUsd: number;
    netUsd: number;
  }>;
  timestamp: string;
}

/**
 * Get Hyperliquid perps smart money snapshot
 * @param window - Time window (not used for snapshot, but kept for API consistency)
 * @returns Current snapshot of smart money positions
 */
export async function getHLPerpsSmartMoneySnapshot(params?: {
  window?: string;
}): Promise<HLPerpsSnapshot> {
  try {
    const client = getNansenClient();

    // Fetch recent perp trades to aggregate into current positions
    const perpTrades = await client.getSmartMoneyPerpTrades(1, 150);

    if (!Array.isArray(perpTrades) || perpTrades.length === 0) {
      throw new Error('No perp trades data available');
    }

    // Aggregate positions by wallet
    const walletPositions = new Map<string, { long: number; short: number }>();

    perpTrades.forEach((trade: any) => {
      const address = trade.trader_address || trade.address;
      const side = (trade.side || '').toLowerCase();
      const valueUsd = trade.value_usd || trade.valueUsd || 0;

      if (!address || !side || !valueUsd) return;

      const existing = walletPositions.get(address) || { long: 0, short: 0 };
      if (side === 'long') {
        existing.long += valueUsd;
      } else if (side === 'short') {
        existing.short += valueUsd;
      }
      walletPositions.set(address, existing);
    });

    // Calculate totals
    let longExposureUsd = 0;
    let shortExposureUsd = 0;
    const byWallet: Array<{ address: string; longUsd: number; shortUsd: number; netUsd: number }> =
      [];

    walletPositions.forEach((position, address) => {
      longExposureUsd += position.long;
      shortExposureUsd += position.short;

      byWallet.push({
        address,
        longUsd: position.long,
        shortUsd: position.short,
        netUsd: position.long - position.short,
      });
    });

    const totalOiUsd = longExposureUsd + shortExposureUsd;
    const netExposureUsd = longExposureUsd - shortExposureUsd;

    console.log(`[HLPerpsSnapshot] Long: $${longExposureUsd.toFixed(0)}, Short: $${shortExposureUsd.toFixed(0)}, OI: $${totalOiUsd.toFixed(0)}`);

    return {
      longExposureUsd,
      shortExposureUsd,
      totalOiUsd,
      netExposureUsd,
      byWallet,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[HLPerpsSnapshot] Error:', error);
    throw error;
  }
}
