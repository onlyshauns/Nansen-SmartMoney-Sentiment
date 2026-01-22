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

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 3600000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sentimentRes, topBuysRes, tradersRes] = await Promise.all([
        fetch('/api/hl-sentiment'),
        fetch('/api/top-buys'),
        fetch('/api/smart-traders'),
      ]);

      const [sentimentData, topBuysData, tradersData] = await Promise.all([
        sentimentRes.json(),
        topBuysRes.json(),
        tradersRes.json(),
      ]);

      if (sentimentData.success) setSentiment(sentimentData.data);
      if (topBuysData.success) setTopBuys(topBuysData.data || []);
      if (tradersData.success) setTraders(tradersData.data || []);
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
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Smart Money Dashboard</h1>
                <p className="text-xs text-gray-500">Powered by Nansen & Hyperliquid</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto px-8 py-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* Sentiment Card */}
            {sentiment && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">Market Sentiment</span>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isBullish ? 'bg-green-100' : isBearish ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    <span className={`text-xl ${
                      isBullish ? 'text-green-600' : isBearish ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {isBullish ? '↑' : isBearish ? '↓' : '→'}
                    </span>
                  </div>
                </div>
                <div className={`text-3xl font-bold mb-1 capitalize ${
                  isBullish ? 'text-green-600' : isBearish ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {sentiment.overall}
                </div>
                <p className="text-sm text-gray-500">{sentiment.total_positions} positions</p>
              </div>
            )}

            {/* Long Ratio */}
            {sentiment && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <span className="text-sm font-medium text-gray-600 block mb-4">Long Positions</span>
                <div className="text-3xl font-bold text-gray-900 mb-1">{sentiment.long_ratio}%</div>
                <p className="text-sm text-gray-500">{sentiment.long_count} traders</p>
              </div>
            )}

            {/* Short Ratio */}
            {sentiment && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <span className="text-sm font-medium text-gray-600 block mb-4">Short Positions</span>
                <div className="text-3xl font-bold text-gray-900 mb-1">{sentiment.short_ratio}%</div>
                <p className="text-sm text-gray-500">{sentiment.short_count} traders</p>
              </div>
            )}

            {/* Tokens Tracked */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <span className="text-sm font-medium text-gray-600 block mb-4">Tokens Tracked</span>
              <div className="text-3xl font-bold text-gray-900 mb-1">{topBuys.length}</div>
              <p className="text-sm text-gray-500">With inflows</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Top Performers */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performers</h3>

                <div className="space-y-4">
                  {traders.slice(0, 5).map((trader, idx) => (
                    <div key={trader.address} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-200 text-gray-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-gray-500 truncate">
                            {trader.address.slice(0, 12)}...
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            trader.side === 'long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {trader.side.toUpperCase()} {trader.leverage}x
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-xs text-gray-500">P&L</div>
                            <div className={`text-sm font-bold ${trader.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trader.pnl >= 0 ? '+' : ''}${(Math.abs(trader.pnl) / 1000).toFixed(1)}K
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">ROI</div>
                            <div className={`text-sm font-bold ${trader.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Buys Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Smart Money Buys (24h)</h3>
                  <p className="text-sm text-gray-500 mt-1">Top tokens by net inflow</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Token</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Chain</th>
                        <th className="text-right py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Inflow</th>
                        <th className="text-right py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Trades</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contract</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBuys.slice(0, 10).map((token, idx) => (
                        <tr key={`${token.token_symbol}-${token.chain}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 text-sm text-gray-500 font-medium">{idx + 1}</td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-900">{token.token_symbol}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="font-semibold text-green-600">
                              +${(token.net_inflow_usd / 1000).toFixed(1)}K
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right text-sm text-gray-600">
                            {token.trade_count}
                          </td>
                          <td className="py-4 px-6">
                            {token.token_address ? (
                              <div className="flex items-center gap-2">
                                <code className="text-xs text-gray-500 font-mono px-2 py-1 bg-gray-100 rounded">
                                  {token.token_address.slice(0, 6)}...{token.token_address.slice(-4)}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(token.token_address)}
                                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                >
                                  {copiedAddress === token.token_address ? '✓' : 'Copy'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {topBuys.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
