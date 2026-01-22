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
    <div className="min-h-screen p-8">
      <div className="max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 nansen-bg rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Smart Money Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Powered by Nansen Intelligence • Live Data</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#00E2B3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-400">Loading market data...</div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">

              {/* Sentiment Card */}
              {sentiment && (
                <div className={`gradient-card rounded-2xl p-6 col-span-2 relative overflow-hidden ${
                  isBullish ? 'pulse-glow' : ''
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                    style={{ background: isBullish ? '#10B981' : isBearish ? '#EF4444' : '#F59E0B' }}
                  ></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Market Sentiment
                        </div>
                        <div className={`text-5xl font-black uppercase tracking-tight ${
                          isBullish ? 'text-green-400' : isBearish ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {sentiment.overall}
                        </div>
                      </div>
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black ${
                        isBullish ? 'bg-green-500/20 text-green-400' :
                        isBearish ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {isBullish ? '↑' : isBearish ? '↓' : '→'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-xl p-4">
                        <div className="text-xs text-gray-400 mb-1">Long Positions</div>
                        <div className="text-2xl font-bold text-green-400">{sentiment.long_ratio}%</div>
                        <div className="text-xs text-gray-500 mt-1">{sentiment.long_count} traders</div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4">
                        <div className="text-xs text-gray-400 mb-1">Short Positions</div>
                        <div className="text-2xl font-bold text-red-400">{sentiment.short_ratio}%</div>
                        <div className="text-xs text-gray-500 mt-1">{sentiment.short_count} traders</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Volume Card */}
              <div className="gradient-card rounded-2xl p-6">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Total Positions
                </div>
                <div className="text-4xl font-black text-white mb-2">
                  {sentiment?.total_positions || 0}
                </div>
                <div className="text-sm text-gray-400">
                  Active Hyperliquid Traders
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00E2B3] animate-pulse"></div>
                    <span className="text-xs text-gray-400">Live Data</span>
                  </div>
                </div>
              </div>

              {/* Token Count Card */}
              <div className="gradient-card rounded-2xl p-6">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Tokens Tracked
                </div>
                <div className="text-4xl font-black text-white mb-2">
                  {topBuys.length}
                </div>
                <div className="text-sm text-gray-400">
                  With Positive Inflows
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="text-xs text-gray-400">Across 5 Chains</div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">

              {/* Top Performers - Left Column */}
              <div className="lg:col-span-1">
                <div className="gradient-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Top Performers</h3>
                    <div className="px-3 py-1 bg-[#00E2B3]/10 rounded-lg">
                      <span className="text-xs font-semibold nansen-accent">Top 5</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {traders.slice(0, 5).map((trader, idx) => (
                      <div key={trader.address} className="bg-black/30 rounded-xl p-4 hover:bg-black/40 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                              idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                              idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                              idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black' :
                              'bg-white/5 text-gray-400'
                            }`}>
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="text-xs font-mono text-gray-400 mb-1">
                                {trader.address.slice(0, 10)}...
                              </div>
                              <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${
                                trader.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trader.side.toUpperCase()} {trader.leverage}x
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">P&L</div>
                            <div className={`text-lg font-black ${trader.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trader.pnl >= 0 ? '+' : ''}${(Math.abs(trader.pnl) / 1000).toFixed(1)}K
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">ROI</div>
                            <div className={`text-lg font-black ${trader.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Buys Table - Right Column */}
              <div className="lg:col-span-2">
                <div className="gradient-card rounded-2xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-r from-[#00E2B3]/10 to-transparent">
                    <h3 className="text-lg font-bold text-white">Smart Money Buys (24h)</h3>
                    <p className="text-xs text-gray-400 mt-1">Top tokens by net inflow across all chains</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5 bg-black/20">
                          <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">#</th>
                          <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">Token</th>
                          <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">Chain</th>
                          <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase">Inflow (24h)</th>
                          <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase">Trades</th>
                          <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">Contract</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topBuys.slice(0, 10).map((token, idx) => (
                          <tr key={`${token.token_symbol}-${token.chain}`}
                            className="border-b border-white/5 hover:bg-[#00E2B3]/5 transition-colors">
                            <td className="py-4 px-6">
                              <span className="text-sm font-bold text-gray-500">
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-bold text-white text-base">{token.token_symbol}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00E2B3]/10 text-[#00E2B3] border border-[#00E2B3]/20">
                                {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="font-black text-green-400 text-base">
                                +${(token.net_inflow_usd / 1000).toFixed(1)}K
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="text-sm text-gray-400">{token.trade_count}</span>
                            </td>
                            <td className="py-4 px-6">
                              {token.token_address ? (
                                <div className="flex items-center gap-2">
                                  <code className="text-xs text-gray-400 font-mono px-2 py-1 bg-black/30 rounded">
                                    {token.token_address.slice(0, 6)}...{token.token_address.slice(-4)}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(token.token_address)}
                                    className="px-3 py-1.5 rounded-lg bg-[#00E2B3]/10 hover:bg-[#00E2B3]/20 text-xs font-semibold nansen-accent transition-all border border-[#00E2B3]/20"
                                  >
                                    {copiedAddress === token.token_address ? 'Copied!' : 'Copy'}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {topBuys.length === 0 && (
                    <div className="py-20 text-center">
                      <div className="text-gray-500 mb-2">No data available</div>
                      <div className="text-xs text-gray-600">Waiting for trade data...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/20 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-[#00E2B3] animate-pulse"></div>
            <span className="text-xs text-gray-400">
              Powered by <span className="nansen-accent font-semibold">Nansen</span> & <span className="font-semibold">Hyperliquid</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
