import { NextResponse } from 'next/server';
import { getHyperliquidClient } from '@/lib/hyperliquid-client';

export async function GET() {
  try {
    const client = getHyperliquidClient();

    // Fetch top 10 tokens by open interest
    const tokens = await client.getTopTokensByOpenInterest(10);

    // Format for the widget
    const formattedTokens = tokens.map(token => ({
      symbol: token.symbol,
      openInterestUsd: token.openInterestUsd,
      fundingRate: token.fundingRate,
      sentiment: token.sentiment,
    }));

    return NextResponse.json(formattedTokens);
  } catch (error) {
    console.error('Market Sentiment API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch market sentiment data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
