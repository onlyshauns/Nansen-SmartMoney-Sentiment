import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

interface DexTrade {
  chain: string;
  token_bought_symbol: string;
  token_bought_address: string;
  token_sold_symbol: string;
  token_sold_address: string;
  trade_value_usd: number;
  block_timestamp: string;
}

interface TokenAggregation {
  symbol: string;
  address: string;
  chain: string;
  netInflow: number;
  buyCount: number;
  sellCount: number;
  totalBuyValue: number;
  totalSellValue: number;
}

export async function GET() {
  try {
    const client = getNansenClient();

    // Fetch recent DEX trades across multiple chains
    const trades = await client.getSmartMoneyDexTrades(
      ['ethereum', 'base', 'polygon', 'arbitrum', 'optimism'],
      1,
      200
    ) as DexTrade[];

    if (!Array.isArray(trades) || trades.length === 0) {
      return NextResponse.json([]);
    }

    // Aggregate by token to calculate net inflow
    const tokenMap = new Map<string, TokenAggregation>();

    trades.forEach((trade) => {
      // Process token bought
      if (trade.token_bought_symbol && trade.token_bought_address) {
        const key = `${trade.token_bought_address}-${trade.chain}`;
        const existing = tokenMap.get(key) || {
          symbol: trade.token_bought_symbol,
          address: trade.token_bought_address,
          chain: trade.chain,
          netInflow: 0,
          buyCount: 0,
          sellCount: 0,
          totalBuyValue: 0,
          totalSellValue: 0,
        };

        existing.netInflow += trade.trade_value_usd || 0;
        existing.buyCount += 1;
        existing.totalBuyValue += trade.trade_value_usd || 0;
        tokenMap.set(key, existing);
      }

      // Process token sold
      if (trade.token_sold_symbol && trade.token_sold_address) {
        const key = `${trade.token_sold_address}-${trade.chain}`;
        const existing = tokenMap.get(key) || {
          symbol: trade.token_sold_symbol,
          address: trade.token_sold_address,
          chain: trade.chain,
          netInflow: 0,
          buyCount: 0,
          sellCount: 0,
          totalBuyValue: 0,
          totalSellValue: 0,
        };

        existing.netInflow -= trade.trade_value_usd || 0;
        existing.sellCount += 1;
        existing.totalSellValue += trade.trade_value_usd || 0;
        tokenMap.set(key, existing);
      }
    });

    // Convert to array and sort by net inflow descending
    const topTokens = Array.from(tokenMap.values())
      .filter((token) => token.netInflow > 0) // Only tokens with positive net inflow
      .sort((a, b) => b.netInflow - a.netInflow)
      .slice(0, 15) // Top 15 tokens
      .map((token) => ({
        symbol: token.symbol,
        address: token.address,
        chain: token.chain,
        netInflow: Math.round(token.netInflow),
        buyCount: token.buyCount,
        sellCount: token.sellCount,
        totalBuyValue: Math.round(token.totalBuyValue),
        totalSellValue: Math.round(token.totalSellValue),
      }));

    return NextResponse.json(topTokens);
  } catch (error) {
    console.error('Top Tokens API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch top tokens data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
