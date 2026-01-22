'use client';

import { useState, useEffect } from 'react';

interface HLSentiment {
  overall: string;
  long_ratio: number;
  short_ratio: number;
  total_long_size: number;
  total_short_size: number;
  long_count: number;
  short_count: number;
  total_positions: number;
}

interface TokenInflow {
  token_symbol: string;
  token_address: string;
  chain: string;
  net_inflow_usd: number;
  buy_volume: number;
  sell_volume: number;
  trade_count: number;
}

interface SmartTrader {
  address: string;
  position_size: number;
  pnl: number;
  leverage: number;
  side: 'long' | 'short';
  entry_price: number;
  current_price: number;
  roi: number;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState<HLSentiment | null>(null);
  const [topBuys, setTopBuys] = useState<TokenInflow[]>([]);
  const [traders, setTraders] = useState<SmartTrader[]>([]);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Error states
  const [sentimentError, setSentimentError] = useState<string | null>(null);
  const [topBuysError, setTopBuysError] = useState<string | null>(null);
  const [tradersError, setTradersError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 3600000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch sentiment
      try {
        const sentimentRes = await fetch('/api/hl-sentiment');
        const sentimentData = await sentimentRes.json();

        if (sentimentData.success) {
          setSentiment(sentimentData.data);
          setSentimentError(null);
        } else {
          setSentimentError(sentimentData.error || 'Failed to load sentiment');
        }
      } catch (err) {
        setSentimentError('API Error: Could not fetch Hyperliquid sentiment');
        console.error('Sentiment error:', err);
      }

      // Fetch top buys
      try {
        const topBuysRes = await fetch('/api/top-buys');
        const topBuysData = await topBuysRes.json();

        if (topBuysData.success) {
          setTopBuys(topBuysData.data || []);
          setTopBuysError(null);
          console.log('Top buys data:', topBuysData);
        } else {
          setTopBuysError(topBuysData.error || 'Failed to load token data');
        }
      } catch (err) {
        setTopBuysError('API Error: Could not fetch Nansen DEX trades');
        console.error('Top buys error:', err);
      }

      // Fetch traders
      try {
        const tradersRes = await fetch('/api/smart-traders');
        const tradersData = await tradersRes.json();

        if (tradersData.success) {
          setTraders(tradersData.data || []);
          setTradersError(null);
        } else {
          setTradersError(tradersData.error || 'Failed to load trader data');
        }
      } catch (err) {
        setTradersError('API Error: Could not fetch Hyperliquid traders');
        console.error('Traders error:', err);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!mounted) return null;

  const isBullish = sentiment?.overall === 'bullish';
  const isBearish = sentiment?.overall === 'bearish';

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Simple Clean Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-12 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart Money Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time market intelligence</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading market data...</p>
          </div>
        </div>
      ) : (
        <main className="max-w-[1600px] mx-auto px-12 py-12">

          {/* HERO: Market Sentiment - Largest Area */}
          <div className="mb-12 animate-fade-in">
            {sentimentError ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center">
                <div className="text-red-600 font-semibold text-lg mb-2">Error Loading Sentiment Data</div>
                <div className="text-red-500 text-sm">{sentimentError}</div>
              </div>
            ) : sentiment ? (
              <div className={`relative rounded-3xl p-16 shadow-lg border-2 transition-all ${
                isBullish ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' :
                isBearish ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' :
                'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
              }`}>
                <div className="max-w-4xl mx-auto text-center">
                  {/* Label */}
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-widest mb-6">
                    Market Sentiment
                  </div>

                  {/* Main Sentiment */}
                  <div className={`text-8xl font-black uppercase mb-8 ${
                    isBullish ? 'text-green-600' :
                    isBearish ? 'text-red-600' :
                    'text-amber-600'
                  }`}>
                    {sentiment.overall}
                  </div>

                  {/* Visual Bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between text-sm font-semibold mb-3">
                      <span className="text-green-600">{sentiment.long_ratio}% Long</span>
                      <span className="text-red-600">{sentiment.short_ratio}% Short</span>
                    </div>
                    <div className="h-6 bg-white/50 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-400"
                        style={{ width: `${sentiment.long_ratio}%` }}
                      ></div>
                      <div
                        className="bg-gradient-to-r from-red-400 to-red-500"
                        style={{ width: `${sentiment.short_ratio}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                    <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-sm text-gray-600 mb-1">Total Positions</div>
                      <div className="text-3xl font-bold text-gray-900">{sentiment.total_positions}</div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-sm text-gray-600 mb-1">Long Traders</div>
                      <div className="text-3xl font-bold text-green-600">{sentiment.long_count}</div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-sm text-gray-600 mb-1">Short Traders</div>
                      <div className="text-3xl font-bold text-red-600">{sentiment.short_count}</div>
                    </div>
                  </div>

                  {/* Source */}
                  <div className="mt-8 text-xs text-gray-500">
                    Based on Hyperliquid smart trader positions
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl p-12 text-center text-gray-500">
                No sentiment data available
              </div>
            )}
          </div>

          {/* Supporting Data - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left: What Smart Money is Buying */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-bold text-gray-900">What They're Buying</h2>
                  <p className="text-sm text-gray-600 mt-1">Top token inflows (24h)</p>
                </div>

                {topBuysError ? (
                  <div className="px-8 py-12 text-center">
                    <div className="text-red-600 font-semibold mb-2">Error Loading Token Data</div>
                    <div className="text-red-500 text-sm">{topBuysError}</div>
                  </div>
                ) : topBuys.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {topBuys.slice(0, 8).map((token, idx) => (
                      <div key={`${token.token_symbol}-${token.chain}`}
                        className="px-8 py-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-lg">{token.token_symbol}</div>
                              <div className="text-sm text-gray-500">{token.chain}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600 text-lg">
                              +${(token.net_inflow_usd / 1000).toFixed(1)}K
                            </div>
                            <div className="text-xs text-gray-500">{token.trade_count} trades</div>
                          </div>
                        </div>
                        {token.token_address && (
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded flex-1">
                              {token.token_address.slice(0, 8)}...{token.token_address.slice(-6)}
                            </code>
                            <button
                              onClick={() => copyToClipboard(token.token_address)}
                              className="px-3 py-1 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                            >
                              {copiedAddress === token.token_address ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-8 py-16 text-center text-gray-500">
                    No token data available
                  </div>
                )}
              </div>
            </div>

            {/* Right: Top Traders */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
                  <p className="text-sm text-gray-600 mt-1">Hyperliquid leaderboard</p>
                </div>

                {tradersError ? (
                  <div className="px-8 py-12 text-center">
                    <div className="text-red-600 font-semibold mb-2">Error Loading Trader Data</div>
                    <div className="text-red-500 text-sm">{tradersError}</div>
                  </div>
                ) : traders.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {traders.slice(0, 8).map((trader, idx) => (
                      <div key={trader.address} className="px-8 py-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center flex-shrink-0 ${
                            idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                            idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                            idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {idx + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-xs font-mono text-gray-600 truncate">
                                {trader.address.slice(0, 14)}...
                              </code>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                trader.side === 'long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {trader.side.toUpperCase()} {trader.leverage}x
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500">P&L</div>
                                <div className={`text-lg font-bold ${trader.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {trader.pnl >= 0 ? '+' : ''}${(Math.abs(trader.pnl) / 1000).toFixed(1)}K
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">ROI</div>
                                <div className={`text-lg font-bold ${trader.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-8 py-16 text-center text-gray-500">
                    No trader data available
                  </div>
                )}
              </div>
            </div>
          </div>

        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-8">
        <div className="max-w-[1600px] mx-auto px-12 text-center text-sm text-gray-500">
          Powered by Nansen & Hyperliquid • Data updates hourly
        </div>
      </footer>
    </div>
  );
}
