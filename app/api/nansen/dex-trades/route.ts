import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '50');

    const client = getNansenClient();
    const trades = await client.getSmartMoneyDexTrades(chain, limit);

    return NextResponse.json({
      success: true,
      data: trades,
    });
  } catch (error: any) {
    console.error('Error fetching Nansen DEX trades:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch smart money DEX trades',
      },
      { status: 500 }
    );
  }
}
