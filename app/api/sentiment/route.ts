import { NextResponse } from 'next/server';
import { aggregateSentimentData } from '@/services/sentimentAggregator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Get full sentiment result from aggregator
    const result = await aggregateSentimentData();

    // Calculate actual long/short ratios from perps positions (not from finalScore)
    const longUsd = result.components.perpsNetExposure.longUsd || 0;
    const shortUsd = result.components.perpsNetExposure.shortUsd || 0;
    const totalOI = longUsd + shortUsd;
    const longRatio = totalOI > 0 ? (longUsd / totalOI) * 100 : 50;
    const shortRatio = 100 - longRatio;

    // Return full explainable payload + backward-compatible fields
    return NextResponse.json({
      // New explainable format
      label: result.label,
      finalScore: result.finalScore,
      confidence: result.confidence,
      windows: result.windows,
      components: result.components,
      meta: result.meta,
      drivers: result.drivers,

      // Backward-compatible fields (for existing UI)
      sentiment: result.label.toLowerCase() as 'bullish' | 'bearish' | 'neutral',
      longRatio: Math.round(longRatio * 10) / 10,
      shortRatio: Math.round(shortRatio * 10) / 10,
      estimatedLongValue: Math.round(result.components.perpsNetExposure.longUsd || 0),
      estimatedShortValue: Math.round(result.components.perpsNetExposure.shortUsd || 0),
      totalOpenInterestUsd: Math.round(
        (result.components.perpsNetExposure.longUsd || 0) +
          (result.components.perpsNetExposure.shortUsd || 0)
      ),
      netStableUsd: Math.round(result.components.spotRisk.netStableUsd || 0),
      positionScore: result.components.perpsNetExposure.score,
      stableFlowScore: result.components.spotRisk.score,
      timestamp: new Date().toISOString(),
      isStale: result.meta.stale,
    });
  } catch (error) {
    console.error('Sentiment API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sentiment data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

