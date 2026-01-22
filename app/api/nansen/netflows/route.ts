import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'ethereum';
    const timeframe = searchParams.get('timeframe') || '24h';

    const client = getNansenClient();
    const netflows = await client.getSmartMoneyNetflows(chain, timeframe);

    return NextResponse.json({
      success: true,
      data: netflows,
    });
  } catch (error: any) {
    console.error('Error fetching Nansen netflows:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch smart money netflows',
      },
      { status: 500 }
    );
  }
}
