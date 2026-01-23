/**
 * Hyperliquid API Client
 * Documentation: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api
 */

import { TokenMarketData } from '@/types';

const HYPERLIQUID_API_BASE = 'https://api.hyperliquid.xyz';

interface AssetContext {
  funding: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  premium: string;
  oraclePx: string;
  markPx: string;
  midPx: string;
  impactPxs: [string, string];
  dayBaseVlm: string;
}

interface MetaAndAssetCtxsResponse {
  universe: Array<{ name: string; szDecimals: number; }>;
  [key: string]: any;
}

export class HyperliquidClient {
  private async request<T>(endpoint: string, body?: any): Promise<T> {
    const url = `${HYPERLIQUID_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body || {}),
    });

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all mids (current prices) for perpetual markets
   */
  async getAllMids() {
    return this.request('/info', {
      type: 'allMids',
    });
  }

  /**
   * Get user open positions
   * @param user - User address
   */
  async getUserOpenPositions(user: string) {
    return this.request('/info', {
      type: 'clearinghouseState',
      user,
    });
  }

  /**
   * Get user fills (trade history)
   * @param user - User address
   */
  async getUserFills(user: string) {
    return this.request('/info', {
      type: 'userFills',
      user,
    });
  }

  /**
   * Get funding rates for all markets
   */
  async getFundingRates() {
    return this.request('/info', {
      type: 'meta',
    });
  }

  /**
   * Get meta and asset contexts (market data including funding rates and OI)
   */
  async getMetaAndAssetCtxs() {
    return this.request<[MetaAndAssetCtxsResponse, AssetContext[]]>('/info', {
      type: 'metaAndAssetCtxs',
    });
  }

  /**
   * Calculate sentiment from funding rate
   * @param fundingRate - Funding rate as decimal (e.g., 0.00005 for 0.005%)
   */
  calculateSentiment(fundingRate: number): 'bullish' | 'bearish' | 'neutral' {
    const threshold = 0.00005; // 0.005%
    if (fundingRate > threshold) return 'bullish';
    if (fundingRate < -threshold) return 'bearish';
    return 'neutral';
  }

  /**
   * Parse asset context data into TokenMarketData
   */
  private parseAssetContext(symbol: string, ctx: AssetContext): TokenMarketData {
    const fundingRate = parseFloat(ctx.funding);
    const openInterest = parseFloat(ctx.openInterest);
    const markPrice = parseFloat(ctx.markPx);
    const openInterestUsd = openInterest * markPrice;
    const volume24h = parseFloat(ctx.dayNtlVlm);
    const premium = parseFloat(ctx.premium);

    return {
      symbol,
      fundingRate,
      openInterest,
      openInterestUsd,
      markPrice,
      volume24h,
      premium,
      sentiment: this.calculateSentiment(fundingRate),
    };
  }

  /**
   * Get market data for specific tokens
   * @param symbols - Array of token symbols (e.g., ['BTC', 'ETH', 'SOL'])
   */
  async getMarketData(symbols: string[]): Promise<TokenMarketData[]> {
    const [meta, assetCtxs] = await this.getMetaAndAssetCtxs();
    const result: TokenMarketData[] = [];

    // Create a map of symbol to index
    const symbolToIndex = new Map<string, number>();
    meta.universe.forEach((asset, index) => {
      symbolToIndex.set(asset.name, index);
    });

    // Get data for requested symbols
    for (const symbol of symbols) {
      const index = symbolToIndex.get(symbol);
      if (index !== undefined && assetCtxs[index]) {
        result.push(this.parseAssetContext(symbol, assetCtxs[index]));
      }
    }

    return result;
  }

  /**
   * Get top N tokens by open interest
   * @param limit - Number of top tokens to return
   */
  async getTopTokensByOpenInterest(limit: number): Promise<TokenMarketData[]> {
    const [meta, assetCtxs] = await this.getMetaAndAssetCtxs();

    // Parse all tokens and calculate USD open interest
    const allTokens: TokenMarketData[] = meta.universe.map((asset, index) => {
      return this.parseAssetContext(asset.name, assetCtxs[index]);
    });

    // Sort by open interest USD (descending) and take top N
    return allTokens
      .sort((a, b) => b.openInterestUsd - a.openInterestUsd)
      .slice(0, limit);
  }
}

// Singleton instance
let hyperliquidClient: HyperliquidClient | null = null;

export function getHyperliquidClient(): HyperliquidClient {
  if (!hyperliquidClient) {
    hyperliquidClient = new HyperliquidClient();
  }

  return hyperliquidClient;
}
