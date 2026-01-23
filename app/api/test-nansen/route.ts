/**
 * Test endpoint to verify Nansen API connectivity
 */

import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check if API key exists
    const apiKey = process.env.NANSEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'NANSEN_API_KEY environment variable not set',
        apiKeyLength: 0,
      }, { status: 500 });
    }

    // Try to fetch a small amount of data
    const client = getNansenClient();
    const trades = await client.getSmartMoneyPerpTrades(1, 5);

    return NextResponse.json({
      success: true,
      apiKeyExists: true,
      apiKeyLength: apiKey.length,
      tradesCount: Array.isArray(trades) ? trades.length : 0,
      sampleTrade: Array.isArray(trades) && trades.length > 0 ? {
        address: trades[0].trader_address || 'N/A',
        label: trades[0].trader_address_label || 'N/A',
        side: trades[0].side || 'N/A',
      } : null,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
