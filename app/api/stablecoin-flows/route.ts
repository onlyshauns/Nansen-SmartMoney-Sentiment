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

// Common stablecoin symbols
const STABLECOINS = ['USDT', 'USDC', 'DAI', 'USDC.e', 'USDT.e', 'FRAX', 'TUSD', 'BUSD', 'USDP'];

export async function GET() {
  try {
    const client = getNansenClient();

    // Fetch recent DEX trades
    const trades = await client.getSmartMoneyDexTrades(
      ['ethereum', 'base', 'polygon', 'arbitrum', 'optimism'],
      1,
      200
    ) as DexTrade[];

    if (!Array.isArray(trades) || trades.length === 0) {
      return NextResponse.json({
        totalStablecoinFlow: 0,
        sentiment: 'neutral',
        stablecoins: [],
      });
    }

    let totalStablecoinFlow = 0;
    const stablecoinMap = new Map<string, { symbol: string; flow: number }>();

    trades.forEach((trade) => {
      // Check if token bought is a stablecoin
      if (trade.token_bought_symbol && STABLECOINS.includes(trade.token_bought_symbol.toUpperCase())) {
        const flow = trade.trade_value_usd || 0;
        totalStablecoinFlow += flow; // Buying stablecoin = bearish (money moving to safety)

        const existing = stablecoinMap.get(trade.token_bought_symbol) || {
          symbol: trade.token_bought_symbol,
          flow: 0,
        };
        existing.flow += flow;
        stablecoinMap.set(trade.token_bought_symbol, existing);
      }

      // Check if token sold is a stablecoin
      if (trade.token_sold_symbol && STABLECOINS.includes(trade.token_sold_symbol.toUpperCase())) {
        const flow = trade.trade_value_usd || 0;
        totalStablecoinFlow -= flow; // Selling stablecoin = bullish (deploying capital)

        const existing = stablecoinMap.get(trade.token_sold_symbol) || {
          symbol: trade.token_sold_symbol,
          flow: 0,
        };
        existing.flow -= flow;
        stablecoinMap.set(trade.token_sold_symbol, existing);
      }
    });

    // Determine sentiment
    // Positive flow = buying stablecoins = bearish
    // Negative flow = selling stablecoins = bullish
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    const threshold = 100000; // $100k threshold

    if (totalStablecoinFlow > threshold) {
      sentiment = 'bearish'; // Moving to stablecoins
    } else if (totalStablecoinFlow < -threshold) {
      sentiment = 'bullish'; // Deploying from stablecoins
    }

    const stablecoins = Array.from(stablecoinMap.values())
      .sort((a, b) => Math.abs(b.flow) - Math.abs(a.flow))
      .slice(0, 5);

    return NextResponse.json({
      totalStablecoinFlow: Math.round(totalStablecoinFlow),
      sentiment,
      stablecoins,
    });
  } catch (error) {
    console.error('Stablecoin Flows API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch stablecoin flows data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
