/**
 * Hyperliquid API Client
 * Documentation: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api
 */

const HYPERLIQUID_API_BASE = 'https://api.hyperliquid.xyz';

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
   * Get open interest for all markets
   */
  async getOpenInterest() {
    return this.request('/info', {
      type: 'metaAndAssetCtxs',
    });
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
