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
