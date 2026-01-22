/**
 * Nansen API Client
 * Documentation: https://docs.nansen.ai/api/smart-money
 */

const NANSEN_API_BASE = 'https://api.nansen.ai/api/beta';

interface NansenApiResponse<T> {
  data: T;
  error?: string;
}

export class NansenClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${NANSEN_API_BASE}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nansen API error: ${response.status} ${response.statusText}`);
    }

    const data: NansenApiResponse<T> = await response.json();

    if (data.error) {
      throw new Error(`Nansen API error: ${data.error}`);
    }

    return data.data;
  }

  /**
   * Get aggregated smart trader and fund token balances with 24h changes
   * @param chain - Blockchain network (e.g., 'ethereum', 'polygon')
   * @param limit - Number of results to return
   */
  async getSmartMoneyHoldings(chain: string = 'ethereum', limit: number = 20) {
    return this.request('/smart-money/holdings', {
      chain,
      limit: limit.toString(),
    });
  }

  /**
   * Get individual smart trader and fund DEX trade transactions in the last 24h
   * @param chain - Blockchain network
   * @param limit - Number of results to return
   */
  async getSmartMoneyDexTrades(chain: string = 'ethereum', limit: number = 50) {
    return this.request('/smart-money/dex-trades', {
      chain,
      limit: limit.toString(),
    });
  }

  /**
   * Get aggregated token flow analysis for smart money wallets
   * @param chain - Blockchain network
   * @param timeframe - Time period (e.g., '24h', '7d')
   */
  async getSmartMoneyNetflows(chain: string = 'ethereum', timeframe: string = '24h') {
    return this.request('/smart-money/netflows', {
      chain,
      timeframe,
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
