import { NextResponse } from 'next/server';
import { getHyperliquidClient } from '@/lib/hyperliquid-client';

export async function GET() {
  try {
    const client = getHyperliquidClient();

    // Get market data and open interest
    const [mids, metaData] = await Promise.all([
      client.getAllMids(),
      client.getOpenInterest(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        mids,
        meta: metaData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Hyperliquid markets:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Hyperliquid markets',
      },
      { status: 500 }
    );
  }
}
