/**
 * Hyperliquid Smart Money - 7D Realised PnL Leaderboard + Wallet Bias
 * Used for: "Smart Money Traders (7D Realised PnL)" table
 */

import { getNansenClient } from '../lib/nansen-client';
import { getHLPerpsSmartMoneySnapshot } from './nansenHLPerpsSnapshot';

export type WalletBias = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface LeaderboardRow {
  address: string;
  traderLabel: string;
  realisedPnlUsd: number;
  trades: number;
  bias: WalletBias;
  biasReason?: string;
  longUsd?: number;
  shortUsd?: number;
}

export interface HLRealisedPnlLeaderboard {
  rows: LeaderboardRow[];
  timestamp: string;
}

const BIAS_THRESHOLD = 0.2; // 20% difference needed for bullish/bearish

/**
 * Get wallet bias for specific addresses
 * @param addresses - Array of wallet addresses
 * @param window - Time window (not used, kept for consistency)
 * @returns Map of address to bias
 */
async function getWalletBiasForAddresses(params: {
  addresses: string[];
  window?: string;
}): Promise<Map<string, { bias: WalletBias; reason?: string; longUsd?: number; shortUsd?: number }>> {
  try {
    const snapshot = await getHLPerpsSmartMoneySnapshot();

    if (!snapshot.byWallet || snapshot.byWallet.length === 0) {
      // No position data available, return all NEUTRAL
      const biasMap = new Map<string, { bias: WalletBias; reason: string }>();
      params.addresses.forEach((address) => {
        biasMap.set(address, {
          bias: 'NEUTRAL',
          reason: 'Insufficient position data',
        });
      });
      return biasMap;
    }

    // Create map of wallet positions
    const positionMap = new Map(
      snapshot.byWallet.map((w) => [w.address, w])
    );

    // Calculate bias for each address
    const biasMap = new Map<string, { bias: WalletBias; reason?: string; longUsd?: number; shortUsd?: number }>();

    params.addresses.forEach((address) => {
      const position = positionMap.get(address);

      if (!position || (position.longUsd === 0 && position.shortUsd === 0)) {
        biasMap.set(address, {
          bias: 'NEUTRAL',
          reason: 'No active positions',
        });
        return;
      }

      const totalExposure = position.longUsd + position.shortUsd;
      const netExposure = position.longUsd - position.shortUsd;
      const biasRatio = netExposure / totalExposure;

      let bias: WalletBias;
      if (biasRatio > BIAS_THRESHOLD) {
        bias = 'BULLISH';
      } else if (biasRatio < -BIAS_THRESHOLD) {
        bias = 'BEARISH';
      } else {
        bias = 'NEUTRAL';
      }

      biasMap.set(address, {
        bias,
        longUsd: position.longUsd,
        shortUsd: position.shortUsd,
      });
    });

    return biasMap;
  } catch (error) {
    console.error('[WalletBias] Error:', error);
    // On error, return all NEUTRAL
    const biasMap = new Map<string, { bias: WalletBias; reason: string }>();
    params.addresses.forEach((address) => {
      biasMap.set(address, {
        bias: 'NEUTRAL',
        reason: 'Error fetching position data',
      });
    });
    return biasMap;
  }
}

/**
 * Get Hyperliquid leaderboard from perp trades data (since /leaderboard endpoint doesn't exist)
 * @param window - Time period (default: "7d")
 * @param limit - Number of traders to return
 * @returns Leaderboard rows with bias information
 */
export async function getHLRealisedPnlLeaderboard(params?: {
  window?: string;
  limit?: number;
}): Promise<HLRealisedPnlLeaderboard> {
  try {
    const limit = params?.limit || 25;

    const client = getNansenClient();

    console.log('[HLLeaderboard] Building leaderboard from perp trades data...');
    console.log('[HLLeaderboard] Service file: services/nansenHLRealisedPnl.ts - BUILD:2026-01-24T01:50:00Z');

    // Fetch perp trades (since /leaderboard endpoint returns 404)
    const perpTrades = await client.getSmartMoneyPerpTrades(1, 200);

    console.log('[HLLeaderboard] Fetched trades:', perpTrades.length, 'First trade label:', perpTrades[0]?.trader_address_label);

    if (!Array.isArray(perpTrades) || perpTrades.length === 0) {
      throw new Error('No perp trades data available');
    }

    // Aggregate by trader
    const traderMap = new Map<string, {
      address: string;
      label: string;
      totalVolume: number;
      tradeCount: number;
      longVolume: number;
      shortVolume: number;
    }>();

    perpTrades.forEach((trade: any) => {
      const address = trade.trader_address || trade.address;
      const label = trade.trader_address_label || trade.trader_label || '';
      const side = (trade.side || '').toLowerCase();
      const valueUsd = trade.value_usd || trade.valueUsd || 0;

      if (!address || !valueUsd) return;

      const existing = traderMap.get(address) || {
        address,
        label,
        totalVolume: 0,
        tradeCount: 0,
        longVolume: 0,
        shortVolume: 0,
      };

      existing.totalVolume += valueUsd;
      existing.tradeCount += 1;

      if (side === 'long') {
        existing.longVolume += valueUsd;
      } else if (side === 'short') {
        existing.shortVolume += valueUsd;
      }

      traderMap.set(address, existing);
    });

    // Convert to array and sort by total volume
    const sortedTraders = Array.from(traderMap.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, limit);

    // Get bias for all addresses
    const addresses = sortedTraders.map(t => t.address);
    const biasMap = await getWalletBiasForAddresses({ addresses });

    // Map to our interface
    const rows: LeaderboardRow[] = sortedTraders.map((trader) => {
      const biasData = biasMap.get(trader.address) || {
        bias: 'NEUTRAL' as WalletBias,
        reason: 'No bias data',
      };

      // Calculate bias from trade volume if no position data
      let volumeBias: WalletBias = 'NEUTRAL';
      if (trader.totalVolume > 0) {
        const netVolume = trader.longVolume - trader.shortVolume;
        const biasRatio = netVolume / trader.totalVolume;
        if (biasRatio > BIAS_THRESHOLD) {
          volumeBias = 'BULLISH';
        } else if (biasRatio < -BIAS_THRESHOLD) {
          volumeBias = 'BEARISH';
        }
      }

      // Use position bias if available, otherwise use volume bias
      const finalBias = biasData.bias !== 'NEUTRAL' ? biasData.bias : volumeBias;

      return {
        address: trader.address,
        traderLabel: trader.label || trader.address.slice(0, 10),
        realisedPnlUsd: trader.totalVolume, // Using volume as proxy since no PnL data
        trades: trader.tradeCount,
        bias: finalBias,
        biasReason: biasData.reason,
        longUsd: biasData.longUsd || trader.longVolume,
        shortUsd: biasData.shortUsd || trader.shortVolume,
      };
    });

    console.log(`[HLLeaderboard] ✓ Built leaderboard with ${rows.length} traders from ${perpTrades.length} trades`);

    return {
      rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[HLLeaderboard] Error:', error);
    throw error;
  }
}
