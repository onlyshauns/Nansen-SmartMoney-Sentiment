import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

interface TokenInflow {
  token_symbol: string;
  token_address: string;
  chain: string;
  net_inflow_usd: number;
  buy_volume: number;
  sell_volume: number;
  trade_count: number;
}

export async function GET() {
  try {
    const nansenClient = getNansenClient();

    // Fetch DEX trades from multiple chains
    const chains = ['ethereum', 'base', 'polygon', 'arbitrum', 'optimism'];
    const allTrades: any[] = [];

    for (const chain of chains) {
      try {
        const trades = await nansenClient.getSmartMoneyDexTrades([chain], 1, 100);
        if (Array.isArray(trades)) {
          allTrades.push(...trades.map((trade: any) => ({ ...trade, chain })));
        }
      } catch (error) {
        console.error(`Error fetching trades for ${chain}:`, error);
      }
    }

    // Aggregate by token
    const tokenMap = new Map<string, TokenInflow>();
    const stablecoins = ['USDC', 'USDT', 'DAI', 'USDE', 'FDUSD'];

    allTrades.forEach((trade: any) => {
      // Determine if this is a buy or sell
      const isBuy = stablecoins.includes(trade.token_sold_symbol);
      const token = isBuy ? trade.token_bought_symbol : trade.token_sold_symbol;
      const tokenAddress = isBuy ? trade.token_bought_address : trade.token_sold_address;

      // Skip stablecoins and native tokens
      if (stablecoins.includes(token) || token === 'ETH' || token === 'MATIC' || token === 'WETH') {
        return;
      }

      const key = `${token}-${trade.chain}`;
      const tradeValue = trade.trade_value_usd || 0;

      if (!tokenMap.has(key)) {
        tokenMap.set(key, {
          token_symbol: token,
          token_address: tokenAddress || '',
          chain: trade.chain,
          net_inflow_usd: 0,
          buy_volume: 0,
          sell_volume: 0,
          trade_count: 0,
        });
      }

      const tokenData = tokenMap.get(key)!;
      if (isBuy) {
        tokenData.buy_volume += tradeValue;
        tokenData.net_inflow_usd += tradeValue;
      } else {
        tokenData.sell_volume += tradeValue;
        tokenData.net_inflow_usd -= tradeValue;
      }
      tokenData.trade_count += 1;
    });

    // Convert to array and sort by net inflow
    const topBuys = Array.from(tokenMap.values())
      .filter(token => token.net_inflow_usd > 0) // Only positive inflows
      .sort((a, b) => b.net_inflow_usd - a.net_inflow_usd)
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      data: topBuys,
    });
  } catch (error) {
    console.error('Error in top-buys API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top buys' },
      { status: 500 }
    );
  }
}
