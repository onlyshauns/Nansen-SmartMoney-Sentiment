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

    // Fetch DEX trades for each chain separately to ensure balanced data
    // Nansen API returns biased results when multiple chains are requested together
    const chains = ['ethereum', 'base', 'solana'];
    const tradesPerChain = 200; // Fetch 200 trades from each chain

    const dexTradesPromises = chains.map(chain =>
      client.getSmartMoneyDexTrades([chain], 1, tradesPerChain)
        .catch(err => {
          console.warn(`[SpotFlows] Failed to fetch ${chain} trades:`, err.message);
          return []; // Return empty array if chain fails
        })
    );

    const dexTradesArrays = await Promise.all(dexTradesPromises);
    const dexTrades = dexTradesArrays.flat();

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

    // Debug: Count trades by chain
    const chainCounts = new Map<string, number>();
    dexTrades.forEach((trade: any) => {
      const chain = trade.chain;
      chainCounts.set(chain, (chainCounts.get(chain) || 0) + 1);
    });
    console.log('[SpotFlows] Trades by chain:', Object.fromEntries(chainCounts));

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
    const inflowsSorted = allFlows
      .filter((f) => f.netFlow > 0)
      .sort((a, b) => b.netFlow - a.netFlow);

    // Debug: Show top 20 inflows by chain
    console.log('[SpotFlows] Top 20 inflows:');
    inflowsSorted.slice(0, 20).forEach((f, i) => {
      console.log(`  ${i+1}. ${f.token} (${f.chain}): $${Math.round(f.netFlow)}`);
    });

    const inflows: TokenFlow[] = inflowsSorted
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
