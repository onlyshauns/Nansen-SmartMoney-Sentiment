import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

export async function GET() {
  try {
    const client = getNansenClient();

    // Fetch data for sentiment calculation
    const [trades, netflows] = await Promise.all([
      client.getSmartMoneyDexTrades('ethereum', 100),
      client.getSmartMoneyNetflows('ethereum', '24h'),
    ]);

    // Calculate buy/sell volumes
    let buyVolume = 0;
    let sellVolume = 0;

    if (Array.isArray(trades)) {
      trades.forEach((trade: any) => {
        if (trade.type === 'buy' || trade.trade_type === 'buy') {
          buyVolume += trade.amount_usd || trade.value_usd || 0;
        } else {
          sellVolume += trade.amount_usd || trade.value_usd || 0;
        }
      });
    }

    // Calculate net flow
    let totalNetFlow = 0;
    if (Array.isArray(netflows)) {
      netflows.forEach((flow: any) => {
        totalNetFlow += flow.net_flow || 0;
      });
    }

    // Calculate sentiment score (-100 to +100)
    const totalVolume = buyVolume + sellVolume;
    const buyRatio = totalVolume > 0 ? buyVolume / totalVolume : 0.5;
    const sentimentScore = (buyRatio - 0.5) * 200; // Scale to -100 to +100

    // Determine overall sentiment
    let overall = 'neutral';
    if (sentimentScore > 20) overall = 'bullish';
    else if (sentimentScore < -20) overall = 'bearish';

    // Calculate 24h change (mock for now - would need historical data)
    const change24h = sentimentScore * 0.1; // Placeholder

    return NextResponse.json({
      success: true,
      data: {
        overall,
        score: Math.round(sentimentScore),
        change_24h: Math.round(change24h),
        buy_volume_24h: Math.round(buyVolume),
        sell_volume_24h: Math.round(sellVolume),
        buy_ratio: Math.round(buyRatio * 100),
        net_flow: Math.round(totalNetFlow),
      },
    });
  } catch (error: any) {
    console.error('Error calculating sentiment:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate sentiment',
      },
      { status: 500 }
    );
  }
}
