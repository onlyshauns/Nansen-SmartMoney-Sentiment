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

    // Fetch DEX trades
    const chains = ['ethereum', 'base', 'polygon', 'arbitrum', 'optimism'];
    const allTrades: any[] = [];

    for (const chain of chains) {
      try {
        const trades = await nansenClient.getSmartMoneyDexTrades([chain], 1, 200);
        if (Array.isArray(trades)) {
          allTrades.push(...trades.map((trade: any) => ({ ...trade, chain })));
        }
      } catch (error) {
        console.error(`Error fetching trades for ${chain}:`, error);
      }
    }

    console.log(`Total trades fetched: ${allTrades.length}`);

    // Aggregate by token
    const tokenMap = new Map<string, TokenInflow>();
    const stablecoins = ['USDC', 'USDT', 'DAI', 'USDE', 'FDUSD', 'BUSD', 'FRAX'];
    const nativeTokens = ['ETH', 'WETH', 'MATIC', 'WMATIC', 'BNB', 'WBNB'];

    allTrades.forEach((trade: any) => {
      // Determine buy/sell based on which side has stablecoin
      const soldIsStable = stablecoins.includes(trade.token_sold_symbol?.toUpperCase());
      const boughtIsStable = stablecoins.includes(trade.token_bought_symbol?.toUpperCase());

      let isBuy = false;
      let token = '';
      let tokenAddress = '';

      if (soldIsStable && !boughtIsStable) {
        // Sold stablecoin, bought token = BUY
        isBuy = true;
        token = trade.token_bought_symbol;
        tokenAddress = trade.token_bought_address;
      } else if (!soldIsStable && boughtIsStable) {
        // Sold token, bought stablecoin = SELL
        isBuy = false;
        token = trade.token_sold_symbol;
        tokenAddress = trade.token_sold_address;
      } else {
        // Skip token-to-token or stablecoin-to-stablecoin swaps
        return;
      }

      // Skip if token is native or stablecoin
      if (stablecoins.includes(token?.toUpperCase()) || nativeTokens.includes(token?.toUpperCase())) {
        return;
      }

      if (!token) return;

      const key = `${token}-${tokenAddress}-${trade.chain}`;
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

    console.log(`Top buys count: ${topBuys.length}`);

    return NextResponse.json({
      success: true,
      data: topBuys,
      metadata: {
        total_trades: allTrades.length,
        unique_tokens: tokenMap.size,
      },
    });
  } catch (error) {
    console.error('Error in top-buys API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top buys' },
      { status: 500 }
    );
  }
}
