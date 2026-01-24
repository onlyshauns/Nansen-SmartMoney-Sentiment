/**
 * Spot Smart Money - Token Flows
 * Used for: Inflows and Outflows tables (8 rows each), ordered by net USD flow
 */

import { getNansenClient } from '../lib/nansen-client';

export interface TokenFlow {
  chain: string;
  token: string;
  address: string;
  valueUsd: number;
  rank: number;
  buyCount: number;
  sellCount: number;
}

export interface SpotSmartMoneyFlows {
  inflows: TokenFlow[];
  outflows: TokenFlow[];
  timestamp: string;
}

/**
 * Get spot smart money token flows (inflows and outflows)
 * @param window - Time window (default: "24h")
 * @param limit - Number of tokens per category (default: 8)
 * @returns Top inflows and outflows by net USD flow
 */
export async function getSpotSmartMoneyTokenFlows(params?: {
  window?: string;
  limit?: number;
}): Promise<SpotSmartMoneyFlows> {
  try {
    const limit = params?.limit || 8;
    const client = getNansenClient();

    // Fetch DEX trades across all chains (including Solana)
    const chains = ['ethereum', 'base', 'polygon', 'arbitrum', 'optimism', 'solana'];
    const dexTrades = await client.getSmartMoneyDexTrades(chains, 1, 200);

    if (!Array.isArray(dexTrades) || dexTrades.length === 0) {
      throw new Error('No DEX trades data available');
    }

    // Aggregate net flows by token+chain
    const flowMap = new Map<string, {
      chain: string;
      token: string;
      address: string;
      netFlow: number;
      buyCount: number;
      sellCount: number;
    }>();

    dexTrades.forEach((trade: any) => {
      const chain = trade.chain;
      const tokenBought = trade.token_bought_symbol;
      const tokenBoughtAddress = trade.token_bought_address || '';
      const tokenSold = trade.token_sold_symbol;
      const tokenSoldAddress = trade.token_sold_address || '';
      const tradeValue = trade.trade_value_usd || trade.value_usd || 0;

      // Process bought tokens (positive flow)
      if (tokenBought && chain) {
        const key = `${tokenBought}-${chain}`;
        const existing = flowMap.get(key) || {
          chain,
          token: tokenBought,
          address: tokenBoughtAddress,
          netFlow: 0,
          buyCount: 0,
          sellCount: 0
        };
        existing.netFlow += tradeValue;
        existing.buyCount += 1;
        if (tokenBoughtAddress) existing.address = tokenBoughtAddress; // Update if we get a better address
        flowMap.set(key, existing);
      }

      // Process sold tokens (negative flow)
      if (tokenSold && chain) {
        const key = `${tokenSold}-${chain}`;
        const existing = flowMap.get(key) || {
          chain,
          token: tokenSold,
          address: tokenSoldAddress,
          netFlow: 0,
          buyCount: 0,
          sellCount: 0
        };
        existing.netFlow -= tradeValue;
        existing.sellCount += 1;
        if (tokenSoldAddress) existing.address = tokenSoldAddress; // Update if we get a better address
        flowMap.set(key, existing);
      }
    });

    // Convert to arrays and sort
    const allFlows = Array.from(flowMap.values());

    // Top inflows (positive net flow)
    const inflows: TokenFlow[] = allFlows
      .filter((f) => f.netFlow > 0)
      .sort((a, b) => b.netFlow - a.netFlow)
      .slice(0, limit)
      .map((f, idx) => ({
        chain: f.chain,
        token: f.token,
        address: f.address || '',
        valueUsd: Math.round(f.netFlow),
        rank: idx + 1,
        buyCount: f.buyCount,
        sellCount: f.sellCount,
      }));

    // Top outflows (negative net flow, show as positive values)
    const outflows: TokenFlow[] = allFlows
      .filter((f) => f.netFlow < 0)
      .sort((a, b) => a.netFlow - b.netFlow) // Most negative first
      .slice(0, limit)
      .map((f, idx) => ({
        chain: f.chain,
        token: f.token,
        address: f.address || '',
        valueUsd: Math.round(Math.abs(f.netFlow)), // Absolute value for display
        rank: idx + 1,
        buyCount: f.buyCount,
        sellCount: f.sellCount,
      }));

    console.log(`[SpotFlows] Inflows: ${inflows.length} tokens, Outflows: ${outflows.length} tokens`);

    return {
      inflows,
      outflows,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[SpotFlows] Error:', error);
    throw error;
  }
}
