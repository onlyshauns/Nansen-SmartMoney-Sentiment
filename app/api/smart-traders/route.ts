import { NextResponse } from 'next/server';
import { getSmartMoneyTraders } from '@/services/nansenHyperliquidTraders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const tradersData = await getSmartMoneyTraders();

    return NextResponse.json({
      traders: tradersData.traders,
      timestamp: tradersData.timestamp,
      isStale: tradersData.isStale || false,
    });
  } catch (error) {
    console.error('Error in /api/smart-traders:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch smart money traders',
        traders: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
