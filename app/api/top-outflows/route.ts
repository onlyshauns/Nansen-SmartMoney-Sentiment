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
  netOutflow: number;
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

    // Aggregate by token to calculate net outflow
    const tokenMap = new Map<string, TokenAggregation>();

    trades.forEach((trade) => {
      // Process token bought
      if (trade.token_bought_symbol && trade.token_bought_address) {
        const key = `${trade.token_bought_address}-${trade.chain}`;
        const existing = tokenMap.get(key) || {
          symbol: trade.token_bought_symbol,
          address: trade.token_bought_address,
          chain: trade.chain,
          netOutflow: 0,
          buyCount: 0,
          sellCount: 0,
          totalBuyValue: 0,
          totalSellValue: 0,
        };

        existing.netOutflow -= trade.trade_value_usd || 0; // Buying reduces outflow
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
          netOutflow: 0,
          buyCount: 0,
          sellCount: 0,
          totalBuyValue: 0,
          totalSellValue: 0,
        };

        existing.netOutflow += trade.trade_value_usd || 0; // Selling increases outflow
        existing.sellCount += 1;
        existing.totalSellValue += trade.trade_value_usd || 0;
        tokenMap.set(key, existing);
      }
    });

    // Convert to array and sort by net outflow descending (most sold)
    const topOutflows = Array.from(tokenMap.values())
      .filter((token) => token.netOutflow > 0) // Only tokens with positive net outflow (being sold)
      .sort((a, b) => b.netOutflow - a.netOutflow)
      .slice(0, 10) // Top 10 tokens
      .map((token) => ({
        symbol: token.symbol,
        address: token.address,
        chain: token.chain,
        netOutflow: Math.round(token.netOutflow),
        buyCount: token.buyCount,
        sellCount: token.sellCount,
        totalBuyValue: Math.round(token.totalBuyValue),
        totalSellValue: Math.round(token.totalSellValue),
      }));

    return NextResponse.json(topOutflows);
  } catch (error) {
    console.error('Top Outflows API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch top outflows data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
