import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

// Stablecoins and ETH addresses for determining buy vs sell
const STABLE_AND_ETH = new Set([
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
]);

export async function GET() {
  try {
    const client = getNansenClient();

    // Fetch recent DEX trades
    const trades = await client.getSmartMoneyDexTrades(['ethereum'], 1, 100);

    // Calculate buy/sell volumes
    // Buy = buying tokens with ETH/stables
    // Sell = selling tokens for ETH/stables
    let buyVolume = 0;
    let sellVolume = 0;
    let buyCount = 0;
    let sellCount = 0;

    if (Array.isArray(trades)) {
      trades.forEach((trade: any) => {
        const tradeValue = trade.trade_value_usd || 0;

        // If sold ETH/stable and bought token = BUY
        if (STABLE_AND_ETH.has(trade.token_sold_address?.toLowerCase())) {
          buyVolume += tradeValue;
          buyCount++;
        }
        // If bought ETH/stable and sold token = SELL
        else if (STABLE_AND_ETH.has(trade.token_bought_address?.toLowerCase())) {
          sellVolume += tradeValue;
          sellCount++;
        }
      });
    }

    // Calculate sentiment score (-100 to +100)
    const totalVolume = buyVolume + sellVolume;
    const buyRatio = totalVolume > 0 ? buyVolume / totalVolume : 0.5;
    const sentimentScore = (buyRatio - 0.5) * 200; // Scale to -100 to +100

    // Determine overall sentiment
    let overall = 'neutral';
    if (sentimentScore > 15) overall = 'bullish';
    else if (sentimentScore < -15) overall = 'bearish';

    // Net flow = buy volume - sell volume
    const netFlow = buyVolume - sellVolume;

    // Calculate 24h change (simplified based on trade distribution)
    const recentBias = buyCount - sellCount;
    const change24h = (recentBias / Math.max(buyCount + sellCount, 1)) * 10;

    return NextResponse.json({
      success: true,
      data: {
        overall,
        score: Math.round(sentimentScore),
        change_24h: Number(change24h.toFixed(1)),
        buy_volume_24h: Math.round(buyVolume),
        sell_volume_24h: Math.round(sellVolume),
        buy_ratio: Math.round(buyRatio * 100),
        net_flow: Math.round(netFlow),
        trade_count: buyCount + sellCount,
        buy_count: buyCount,
        sell_count: sellCount,
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
