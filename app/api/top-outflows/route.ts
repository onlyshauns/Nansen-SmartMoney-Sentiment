/**
 * Top Outflows API Route
 * NOW USING REAL SPOT SMART MONEY FLOWS SERVICE
 */

import { NextResponse } from 'next/server';
import { getSpotSmartMoneyTokenFlows } from '@/services/nansenSpotSmartMoneyFlows';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('[TopOutflows] Fetching spot flows from real service...');

    // Fetch using the NEW real service (returns top 8 outflows by default)
    const flows = await getSpotSmartMoneyTokenFlows({ limit: 8 });

    console.log(`[TopOutflows] ✓ Fetched ${flows.outflows.length} outflow tokens`);

    // Map to format UI expects
    const topOutflows = flows.outflows.map((flow) => ({
      rank: flow.rank,
      chain: flow.chain,
      symbol: flow.token,
      address: flow.address,
      netOutflow: flow.valueUsd, // UI expects "netOutflow" field
      valueUsd: flow.valueUsd,
      buyCount: flow.buyCount,
      sellCount: flow.sellCount,
    }));

    return NextResponse.json(topOutflows);
  } catch (error) {
    console.error('[TopOutflows] API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch top outflows',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
