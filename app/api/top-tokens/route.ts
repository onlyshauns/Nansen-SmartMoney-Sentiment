/**
 * Top Tokens (Inflows) API Route
 * NOW USING REAL SPOT SMART MONEY FLOWS SERVICE
 */

import { NextResponse } from 'next/server';
import { getSpotSmartMoneyTokenFlows } from '@/services/nansenSpotSmartMoneyFlows';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('[TopTokens] Fetching spot flows from real service...');

    // Fetch using the NEW real service (returns top 8 inflows by default)
    const flows = await getSpotSmartMoneyTokenFlows({ limit: 8 });

    console.log(`[TopTokens] ✓ Fetched ${flows.inflows.length} inflow tokens`);

    // Map to format UI expects
    const topTokens = flows.inflows.map((flow) => ({
      rank: flow.rank,
      chain: flow.chain,
      symbol: flow.token,
      address: flow.address,
      netInflow: flow.valueUsd, // UI expects "netInflow" field
      valueUsd: flow.valueUsd,
      buyCount: flow.buyCount,
      sellCount: flow.sellCount,
    }));

    return NextResponse.json(topTokens);
  } catch (error) {
    console.error('[TopTokens] API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch top tokens',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
