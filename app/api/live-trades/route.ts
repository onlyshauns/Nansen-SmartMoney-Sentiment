import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

interface DexTrade {
  chain: string;
  block_timestamp: string;
  token_bought_symbol: string;
  token_sold_symbol: string;
  trade_value_usd: number;
  trader_address: string;
  trader_address_label?: string;
}

interface PerpTrade {
  trader_address: string;
  trader_address_label?: string;
  token_symbol: string;
  side: string;
  action: string;
  value_usd: number;
  block_timestamp: string;
}

interface LiveTrade {
  type: 'dex' | 'perp';
  action: 'buy' | 'sell' | 'long' | 'short';
  tokenSymbol: string;
  valueUsd: number;
  timestamp: string;
  chain?: string;
  traderLabel?: string;
  secondaryToken?: string;
}

export async function GET() {
  try {
    const client = getNansenClient();

    // Fetch both DEX and perp trades in parallel
    const [dexTrades, perpTrades] = await Promise.all([
      client.getSmartMoneyDexTrades(['ethereum', 'base', 'polygon', 'arbitrum'], 1, 50) as Promise<DexTrade[]>,
      client.getSmartMoneyPerpTrades(1, 50) as Promise<PerpTrade[]>,
    ]);

    const liveTrades: LiveTrade[] = [];

    // Process DEX trades
    if (Array.isArray(dexTrades)) {
      dexTrades.forEach((trade) => {
        liveTrades.push({
          type: 'dex',
          action: 'buy',
          tokenSymbol: trade.token_bought_symbol || 'Unknown',
          secondaryToken: trade.token_sold_symbol,
          valueUsd: Math.round(trade.trade_value_usd || 0),
          timestamp: trade.block_timestamp,
          chain: trade.chain,
          traderLabel: trade.trader_address_label,
        });
      });
    }

    // Process perp trades
    if (Array.isArray(perpTrades)) {
      perpTrades.forEach((trade) => {
        const isLong = trade.side?.toLowerCase() === 'long';
        const isAdd = trade.action?.toLowerCase() === 'add';

        liveTrades.push({
          type: 'perp',
          action: isLong ? 'long' : 'short',
          tokenSymbol: trade.token_symbol || 'Unknown',
          valueUsd: Math.round(trade.value_usd || 0),
          timestamp: trade.block_timestamp,
          chain: 'hyperliquid',
          traderLabel: trade.trader_address_label,
        });
      });
    }

    // Sort by timestamp descending (most recent first)
    liveTrades.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    // Return top 30 most recent trades
    return NextResponse.json(liveTrades.slice(0, 30));
  } catch (error) {
    console.error('Live Trades API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch live trades data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
