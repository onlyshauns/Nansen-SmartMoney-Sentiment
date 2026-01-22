import { NextResponse } from 'next/server';

interface HLPosition {
  side: 'long' | 'short';
  position_size: number;
  pnl: number;
}

export async function GET() {
  try {
    // Fetch Hyperliquid positions
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/smart-traders`);
    const data = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No Hyperliquid data available',
      });
    }

    const positions: HLPosition[] = data.data;

    // Calculate sentiment based on position sizing and direction
    let totalLongSize = 0;
    let totalShortSize = 0;
    let longCount = 0;
    let shortCount = 0;

    positions.forEach((pos: HLPosition) => {
      if (pos.side === 'long') {
        totalLongSize += pos.position_size;
        longCount++;
      } else {
        totalShortSize += pos.position_size;
        shortCount++;
      }
    });

    const totalSize = totalLongSize + totalShortSize;
    const longRatio = totalSize > 0 ? Math.round((totalLongSize / totalSize) * 100) : 50;

    // Determine overall sentiment
    let overall = 'neutral';
    if (longRatio >= 60) {
      overall = 'bullish';
    } else if (longRatio <= 40) {
      overall = 'bearish';
    }

    return NextResponse.json({
      success: true,
      data: {
        overall,
        long_ratio: longRatio,
        short_ratio: 100 - longRatio,
        total_long_size: totalLongSize,
        total_short_size: totalShortSize,
        long_count: longCount,
        short_count: shortCount,
        total_positions: positions.length,
      },
    });
  } catch (error) {
    console.error('Error in HL sentiment API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate Hyperliquid sentiment' },
      { status: 500 }
    );
  }
}
