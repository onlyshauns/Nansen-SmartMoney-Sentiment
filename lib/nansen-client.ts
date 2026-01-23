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
  private readonly timeout = 10000; // 10s timeout
  private readonly maxRetries = 2; // 2 retries with backoff

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async requestWithTimeout<T>(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async request<T>(endpoint: string, body: Record<string, any> = {}): Promise<T> {
    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.requestWithTimeout(
          `${NANSEN_API_BASE}${endpoint}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.apiKey,
            },
            body: JSON.stringify(body),
          },
          this.timeout
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Nansen API error: ${response.status} ${errorText}`);
        }

        const data: NansenApiResponse<T> = await response.json();
        return data.data;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt
        if (attempt < this.maxRetries) {
          // Exponential backoff: 1s, 2s
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Nansen API request failed');
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
