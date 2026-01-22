import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

interface PerpTrade {
  side: string;
  action: string;
  value_usd: number;
  trader_address: string;
  token_symbol: string;
}

export async function GET() {
  try {
    const client = getNansenClient();

    // Fetch recent smart money perp trades
    const perpTrades = await client.getSmartMoneyPerpTrades(1, 100) as PerpTrade[];

    if (!Array.isArray(perpTrades) || perpTrades.length === 0) {
      return NextResponse.json({
        sentiment: 'neutral',
        longValue: 0,
        shortValue: 0,
        longRatio: 50,
        shortRatio: 50,
        totalPositions: 0,
        message: 'No perp trades data available',
      });
    }

    // Calculate long vs short values (only count "Add" actions to see new positions being opened)
    let longValue = 0;
    let shortValue = 0;
    let longCount = 0;
    let shortCount = 0;

    perpTrades.forEach((trade) => {
      const isLong = trade.side?.toLowerCase() === 'long';
      const isShort = trade.side?.toLowerCase() === 'short';
      const isAdd = trade.action?.toLowerCase() === 'add';

      if (isAdd) {
        if (isLong) {
          longValue += trade.value_usd || 0;
          longCount++;
        } else if (isShort) {
          shortValue += trade.value_usd || 0;
          shortCount++;
        }
      }
    });

    const totalValue = longValue + shortValue;
    const longRatio = totalValue > 0 ? (longValue / totalValue) * 100 : 50;
    const shortRatio = totalValue > 0 ? (shortValue / totalValue) * 100 : 50;

    // Determine sentiment based on long/short ratio
    // Bullish if > 55% long, Bearish if < 45% long, otherwise neutral
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (longRatio > 55) {
      sentiment = 'bullish';
    } else if (longRatio < 45) {
      sentiment = 'bearish';
    }

    return NextResponse.json({
      sentiment,
      longValue: Math.round(longValue),
      shortValue: Math.round(shortValue),
      longRatio: Math.round(longRatio * 10) / 10,
      shortRatio: Math.round(shortRatio * 10) / 10,
      totalPositions: longCount + shortCount,
      longCount,
      shortCount,
    });
  } catch (error) {
    console.error('Sentiment API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sentiment data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
