import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

interface PerpTrade {
  trader_address: string;
  trader_address_label?: string;
  side: string;
  action: string;
  value_usd: number;
  token_symbol: string;
  token_amount: number;
  price_usd: number;
}

interface TraderAggregation {
  address: string;
  label: string;
  totalVolume: number;
  longVolume: number;
  shortVolume: number;
  tradeCount: number;
  dominantSide: 'long' | 'short' | 'neutral';
  tokens: Set<string>;
}

export async function GET() {
  try {
    const client = getNansenClient();

    // Fetch recent smart money perp trades
    const trades = await client.getSmartMoneyPerpTrades(1, 150) as PerpTrade[];

    if (!Array.isArray(trades) || trades.length === 0) {
      return NextResponse.json([]);
    }

    // Aggregate by trader
    const traderMap = new Map<string, TraderAggregation>();

    trades.forEach((trade) => {
      const address = trade.trader_address;
      if (!address) return;

      const existing = traderMap.get(address) || {
        address,
        label: trade.trader_address_label || address,
        totalVolume: 0,
        longVolume: 0,
        shortVolume: 0,
        tradeCount: 0,
        dominantSide: 'neutral' as const,
        tokens: new Set<string>(),
      };

      existing.totalVolume += trade.value_usd || 0;
      existing.tradeCount += 1;

      if (trade.token_symbol) {
        existing.tokens.add(trade.token_symbol);
      }

      const isLong = trade.side?.toLowerCase() === 'long';
      const isShort = trade.side?.toLowerCase() === 'short';

      if (isLong) {
        existing.longVolume += trade.value_usd || 0;
      } else if (isShort) {
        existing.shortVolume += trade.value_usd || 0;
      }

      traderMap.set(address, existing);
    });

    // Convert to array, determine dominant side, and sort by volume
    const topTraders = Array.from(traderMap.values())
      .map((trader) => {
        // Determine dominant side
        let dominantSide: 'long' | 'short' | 'neutral' = 'neutral';
        if (trader.longVolume > trader.shortVolume * 1.5) {
          dominantSide = 'long';
        } else if (trader.shortVolume > trader.longVolume * 1.5) {
          dominantSide = 'short';
        }

        return {
          address: trader.address,
          label: trader.label,
          totalVolume: Math.round(trader.totalVolume),
          longVolume: Math.round(trader.longVolume),
          shortVolume: Math.round(trader.shortVolume),
          tradeCount: trader.tradeCount,
          dominantSide,
          tokensTraded: Array.from(trader.tokens),
          longRatio: trader.totalVolume > 0
            ? Math.round((trader.longVolume / trader.totalVolume) * 100)
            : 0,
          shortRatio: trader.totalVolume > 0
            ? Math.round((trader.shortVolume / trader.totalVolume) * 100)
            : 0,
        };
      })
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 10); // Top 10 traders

    return NextResponse.json(topTraders);
  } catch (error) {
    console.error('Top Traders API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch top traders data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
