import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '20');

    const client = getNansenClient();
    const holdings = await client.getSmartMoneyHoldings(chain, limit);

    return NextResponse.json({
      success: true,
      data: holdings,
    });
  } catch (error: any) {
    console.error('Error fetching Nansen holdings:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch smart money holdings',
      },
      { status: 500 }
    );
  }
}
