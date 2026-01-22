import { NextResponse } from 'next/server';
import { getNansenClient } from '@/lib/nansen-client';

export async function GET() {
  const client = getNansenClient();
  const results: any = {
    success: true,
    tests: {},
  };

  console.log('Testing Nansen API endpoints...');

  // Test 1: Get DEX trades
  try {
    console.log('\n=== Testing Smart Money DEX Trades ===');
    const dexTrades = await client.getSmartMoneyDexTrades(['ethereum', 'base', 'polygon'], 1, 5);
    console.log('DEX Trades Response:', JSON.stringify(dexTrades, null, 2));
    results.tests.dexTrades = {
      success: true,
      count: Array.isArray(dexTrades) ? dexTrades.length : 0,
      sample: Array.isArray(dexTrades) && dexTrades.length > 0 ? dexTrades[0] : null,
    };
  } catch (error) {
    console.error('DEX Trades Error:', error);
    results.tests.dexTrades = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test 2: Get Holdings
  try {
    console.log('\n=== Testing Smart Money Holdings ===');
    const holdings = await client.getSmartMoneyHoldings(['ethereum', 'base', 'polygon'], 1, 5);
    console.log('Holdings Response:', JSON.stringify(holdings, null, 2));
    results.tests.holdings = {
      success: true,
      count: Array.isArray(holdings) ? holdings.length : 0,
      sample: Array.isArray(holdings) && holdings.length > 0 ? holdings[0] : null,
    };
  } catch (error) {
    console.error('Holdings Error:', error);
    results.tests.holdings = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test 3: Get Smart Money Perp Trades (Hyperliquid)
  try {
    console.log('\n=== Testing Smart Money Perp Trades (Hyperliquid) ===');
    const perpTrades = await client.getSmartMoneyPerpTrades(1, 5);
    console.log('Perp Trades Response:', JSON.stringify(perpTrades, null, 2));
    results.tests.perpTrades = {
      success: true,
      count: Array.isArray(perpTrades) ? perpTrades.length : 0,
      sample: Array.isArray(perpTrades) && perpTrades.length > 0 ? perpTrades[0] : null,
    };
  } catch (error) {
    console.error('Perp Trades Error:', error);
    results.tests.perpTrades = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test 4: Get Hyperliquid Leaderboard
  try {
    console.log('\n=== Testing Hyperliquid PnL Leaderboard ===');
    const leaderboard = await client.getHyperliquidLeaderboard(undefined, '7d', 1, 5);
    console.log('Leaderboard Response:', JSON.stringify(leaderboard, null, 2));
    results.tests.leaderboard = {
      success: true,
      count: Array.isArray(leaderboard) ? leaderboard.length : 0,
      sample: Array.isArray(leaderboard) && leaderboard.length > 0 ? leaderboard[0] : null,
    };
  } catch (error) {
    console.error('Leaderboard Error:', error);
    results.tests.leaderboard = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  return NextResponse.json(results);
}
