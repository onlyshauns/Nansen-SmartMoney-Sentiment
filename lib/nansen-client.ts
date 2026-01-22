/**
 * Nansen API Client
 * Documentation: https://docs.nansen.ai
 */

const NANSEN_API_BASE = 'https://api.nansen.ai/api/v1';

interface NansenApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    per_page: number;
    is_last_page: boolean;
  };
}

export class NansenClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, body: Record<string, any> = {}): Promise<T> {
    const response = await fetch(`${NANSEN_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Nansen API error: ${response.status} ${errorText}`);
    }

    const data: NansenApiResponse<T> = await response.json();
    return data.data;
  }

  /**
   * Get aggregated smart money holdings across chains
   * @param chains - Array of blockchain networks (e.g., ['ethereum', 'base', 'polygon'])
   * @param page - Page number for pagination
   * @param perPage - Results per page
   */
  async getSmartMoneyHoldings(chains: string[] = ['ethereum'], page: number = 1, perPage: number = 20) {
    return this.request('/smart-money/holdings', {
      chains,
      pagination: {
        page,
        per_page: perPage,
      },
    });
  }

  /**
   * Get recent DEX trades by smart money wallets
   * @param chains - Array of blockchain networks
   * @param page - Page number for pagination
   * @param perPage - Results per page
   */
  async getSmartMoneyDexTrades(chains: string[] = ['ethereum'], page: number = 1, perPage: number = 50) {
    return this.request('/smart-money/dex-trades', {
      chains,
      pagination: {
        page,
        per_page: perPage,
      },
    });
  }

  /**
   * Get recent perpetual trades by smart money wallets on Hyperliquid
   * @param page - Page number for pagination
   * @param perPage - Results per page
   * @param filters - Optional filters for side, action, token, etc.
   */
  async getSmartMoneyPerpTrades(
    page: number = 1,
    perPage: number = 50,
    filters: {
      side?: 'long' | 'short';
      action?: string;
      token_symbol?: string;
      min_value_usd?: number;
      max_value_usd?: number;
      show_new_positions_only?: boolean;
    } = {}
  ) {
    return this.request('/smart-money/perp-trades', {
      ...filters,
      pagination: {
        page,
        per_page: perPage,
      },
    });
  }

  /**
   * Get Hyperliquid PnL leaderboard for top traders
   * @param token_symbol - Optional token symbol to filter by (e.g., 'BTC', 'ETH')
   * @param period - Time period for PnL calculation
   * @param page - Page number for pagination
   * @param perPage - Results per page
   */
  async getHyperliquidLeaderboard(
    token_symbol?: string,
    period: '7d' | '30d' | 'all' = '7d',
    page: number = 1,
    perPage: number = 50
  ) {
    return this.request('/hyperliquid/perp-pnl-leaderboard', {
      ...(token_symbol && { token_symbol }),
      period,
      pagination: {
        page,
        per_page: perPage,
      },
    });
  }
}

// Singleton instance
let nansenClient: NansenClient | null = null;

export function getNansenClient(): NansenClient {
  if (!nansenClient) {
    const apiKey = process.env.NANSEN_API_KEY;

    if (!apiKey) {
      throw new Error('NANSEN_API_KEY environment variable is not set');
    }

    nansenClient = new NansenClient(apiKey);
  }

  return nansenClient;
}
