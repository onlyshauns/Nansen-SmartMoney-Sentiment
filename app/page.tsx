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
    const interval = setInterval(fetchData, 3600000); // 1 hour
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

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'bullish') return { bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981', text: '#10B981' };
    if (sentiment === 'bearish') return { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', text: '#EF4444' };
    return { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', text: '#F59E0B' };
  };

  if (!mounted) return null;

  const colors = sentiment ? getSentimentColor(sentiment.overall) : { bg: 'transparent', border: '#6B7280', text: '#6B7280' };

  return (
    <div className="min-h-screen bg-[#0A0E16]">
      {/* Top Bar */}
      <div className="border-b border-white/[0.05] bg-[#0F1219]">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Smart Money Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time sentiment tracking • Updated hourly</p>
            </div>
            {sentiment && (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Market Sentiment</div>
                  <div
                    className="text-2xl font-black uppercase tracking-tight"
                    style={{ color: colors.text }}
                  >
                    {sentiment.overall}
                  </div>
                </div>
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black"
                  style={{
                    background: colors.bg,
                    border: `2px solid ${colors.border}`,
                    color: colors.text
                  }}
                >
                  {sentiment.overall === 'bullish' ? '↑' : sentiment.overall === 'bearish' ? '↓' : '→'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="text-gray-400 text-lg">Loading...</div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="grid grid-cols-12 gap-6">

            {/* Left Column - Sentiment & Positions */}
            <div className="col-span-4 space-y-6">

              {/* Sentiment Card */}
              {sentiment && (
                <div className="bg-[#0F1219] rounded-xl border border-white/[0.05] p-6">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Position Distribution
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-400">Long Positions</span>
                      </div>
                      <div className="text-lg font-bold text-white">{sentiment.long_ratio}%</div>
                    </div>

                    <div className="h-2 bg-black/30 rounded-full overflow-hidden flex">
                      <div
                        className="bg-green-500"
                        style={{ width: `${sentiment.long_ratio}%` }}
                      />
                      <div
                        className="bg-red-500"
                        style={{ width: `${sentiment.short_ratio}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-400">Short Positions</span>
                      </div>
                      <div className="text-lg font-bold text-white">{sentiment.short_ratio}%</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/[0.05]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Total Positions</div>
                        <div className="text-xl font-bold text-white">{sentiment.total_positions}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Long/Short</div>
                        <div className="text-xl font-bold text-white">{sentiment.long_count}/{sentiment.short_count}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Traders */}
              <div className="bg-[#0F1219] rounded-xl border border-white/[0.05] p-6">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Top Performers
                </div>
                <div className="space-y-3">
                  {traders.slice(0, 5).map((trader, idx) => (
                    <div key={trader.address} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-mono text-gray-400 truncate max-w-[120px]">
                            {trader.address.slice(0, 8)}...
                          </div>
                          <div className={`text-xs font-semibold ${trader.side === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                            {trader.side.toUpperCase()} {trader.leverage}x
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${trader.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.pnl >= 0 ? '+' : ''}${(Math.abs(trader.pnl) / 1000).toFixed(1)}K
                        </div>
                        <div className="text-xs text-gray-500">
                          {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Top Buys */}
            <div className="col-span-8">
              <div className="bg-[#0F1219] rounded-xl border border-white/[0.05]">
                <div className="px-6 py-4 border-b border-white/[0.05]">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Smart Money Buys (24h)
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.05]">
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Token</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chain</th>
                        <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Inflow</th>
                        <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trades</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contract</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBuys.slice(0, 12).map((token, idx) => (
                        <tr key={`${token.token_symbol}-${token.chain}`} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-white">{token.token_symbol}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="font-bold text-green-400">
                              +${(token.net_inflow_usd / 1000).toFixed(1)}K
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right text-sm text-gray-400">
                            {token.trade_count}
                          </td>
                          <td className="py-4 px-6">
                            {token.token_address ? (
                              <div className="flex items-center gap-2">
                                <code className="text-xs text-gray-500 font-mono">
                                  {token.token_address.slice(0, 6)}...{token.token_address.slice(-4)}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(token.token_address)}
                                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                  {copiedAddress === token.token_address ? '✓' : 'Copy'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-600">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {topBuys.length === 0 && (
                  <div className="py-20 text-center text-gray-500">
                    No token data available
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
