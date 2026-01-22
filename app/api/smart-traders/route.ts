import { NextResponse } from 'next/server';
import { getHyperliquidClient } from '@/lib/hyperliquid-client';

// Mock smart trader addresses for demo (in production, you'd get these from Nansen or a database)
const SMART_TRADER_ADDRESSES = [
  '0x1234567890abcdef1234567890abcdef12345678',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  '0x9876543210fedcba9876543210fedcba98765432',
];

export async function GET() {
  try {
    const client = getHyperliquidClient();

    // Get market data
    const markets = await client.getAllMids();

    // Mock smart trader positions (in production, fetch real positions)
    const traders = SMART_TRADER_ADDRESSES.map((address, index) => {
      const isLong = Math.random() > 0.5;
      const pnl = (Math.random() - 0.4) * 100000;
      const size = Math.random() * 500000 + 50000;

      return {
        address: address.slice(0, 6) + '...' + address.slice(-4),
        position_size: size,
        pnl,
        leverage: Math.floor(Math.random() * 10) + 1,
        side: isLong ? 'long' : 'short',
        entry_price: 30000 + Math.random() * 10000,
        current_price: 35000 + Math.random() * 5000,
        roi: (pnl / size) * 100,
      };
    });

    // Sort by ROI
    traders.sort((a, b) => b.roi - a.roi);

    return NextResponse.json({
      success: true,
      data: traders,
    });
  } catch (error: any) {
    console.error('Error fetching smart traders:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch smart traders',
      },
      { status: 500 }
    );
  }
}
