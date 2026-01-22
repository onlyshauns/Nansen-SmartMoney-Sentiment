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
    if (sentiment === 'bullish') return '#10B981';
    if (sentiment === 'bearish') return '#EF4444';
    return '#F59E0B';
  };

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      ethereum: '#627EEA',
      base: '#0052FF',
      polygon: '#8247E5',
      arbitrum: '#28A0F0',
      optimism: '#FF0420',
    };
    return colors[chain.toLowerCase()] || '#6B7280';
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0B0E15]">
      <div className="max-w-[1400px] mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-3xl font-bold text-white mb-2">Smart Money Dashboard</h1>
          <p className="text-gray-400 text-sm">Tracking Hyperliquid positions and DEX spot flows • Updates hourly</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="text-gray-400">Loading data...</div>
          </div>
        ) : (
          <div className="space-y-12">

            {/* Sentiment Section */}
            {sentiment && (
              <section>
                <div className="bg-gradient-to-br from-[#151922] to-[#0F1219] rounded-2xl p-12 border border-white/5">
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                      Smart Money Sentiment
                    </div>
                    <div
                      className="text-7xl font-black uppercase mb-6 tracking-tight"
                      style={{ color: getSentimentColor(sentiment.overall) }}
                    >
                      {sentiment.overall}
                    </div>
                    <div className="text-gray-400 text-sm mb-8">
                      Based on {sentiment.total_positions} Hyperliquid positions
                    </div>

                    {/* Long/Short Ratio Bar */}
                    <div className="max-w-2xl mx-auto">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-green-400">
                          {sentiment.long_ratio}% Long
                        </div>
                        <div className="text-sm font-semibold text-red-400">
                          {sentiment.short_ratio}% Short
                        </div>
                      </div>
                      <div className="h-4 bg-black/30 rounded-full overflow-hidden flex">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${sentiment.long_ratio}%` }}
                        />
                        <div
                          className="bg-gradient-to-r from-red-400 to-red-500"
                          style={{ width: `${sentiment.short_ratio}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <div>{sentiment.long_count} positions</div>
                        <div>{sentiment.short_count} positions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Top Smart Money Buys */}
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Top Smart Money Buys</h2>
                <p className="text-sm text-gray-400">Tokens with highest net inflows over 24h</p>
              </div>

              <div className="bg-[#151922] rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Token
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Chain
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Net Inflow (24h)
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Trades
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Contract Address
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBuys.slice(0, 15).map((token, index) => (
                        <tr
                          key={`${token.token_symbol}-${token.chain}`}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-4 px-6 text-gray-400 text-sm">
                            {index + 1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-white">{token.token_symbol}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: `${getChainColor(token.chain)}20`,
                                color: getChainColor(token.chain),
                              }}
                            >
                              {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="font-bold text-green-400">
                              +${(token.net_inflow_usd / 1000).toFixed(1)}K
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right text-gray-400 text-sm">
                            {token.trade_count}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-gray-400 font-mono">
                                {token.token_address ? `${token.token_address.slice(0, 6)}...${token.token_address.slice(-4)}` : 'N/A'}
                              </code>
                              {token.token_address && (
                                <button
                                  onClick={() => copyToClipboard(token.token_address)}
                                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                  {copiedAddress === token.token_address ? 'Copied!' : 'Copy'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {topBuys.length === 0 && (
                  <div className="py-16 text-center text-gray-400">
                    No token data available
                  </div>
                )}
              </div>
            </section>

            {/* Hyperliquid Leaderboard */}
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Top Hyperliquid Positions</h2>
                <p className="text-sm text-gray-400">Highest performing perpetual futures traders</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {traders.slice(0, 6).map((trader, index) => (
                  <div
                    key={trader.address}
                    className="bg-[#151922] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-400/20 text-gray-300' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-white/5 text-gray-400'
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          trader.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {trader.side.toUpperCase()} {trader.leverage}x
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500 font-mono truncate">
                        {trader.address}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">P&L</div>
                        <div className={`text-2xl font-black ${trader.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.pnl >= 0 ? '+' : ''}${(Math.abs(trader.pnl) / 1000).toFixed(1)}K
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">ROI</div>
                        <div className={`text-2xl font-black ${trader.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {traders.length === 0 && (
                <div className="bg-[#151922] rounded-2xl border border-white/5 py-16 text-center text-gray-400">
                  No position data available
                </div>
              )}
            </section>

          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-gray-600">
          Powered by Nansen API & Hyperliquid
        </div>
      </div>
    </main>
  );
}
