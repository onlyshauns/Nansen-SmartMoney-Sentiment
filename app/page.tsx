'use client';

import { useState, useEffect } from 'react';
import SmartTraderLeaderboard from '@/components/SmartTraderLeaderboard';

interface SmartMoneyTrade {
  chain: string;
  block_timestamp: string;
  token_bought_symbol: string;
  token_sold_symbol: string;
  trade_value_usd: number;
}

interface SentimentData {
  overall: string;
  score: number;
  buy_volume_24h: number;
  sell_volume_24h: number;
  buy_ratio: number;
  net_flow: number;
  trade_count: number;
  buy_count: number;
  sell_count: number;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<SmartMoneyTrade[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
    // Refresh every 2 minutes instead of 30 seconds
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tradesResponse, sentimentResponse] = await Promise.all([
        fetch('/api/nansen/dex-trades'),
        fetch('/api/sentiment'),
      ]);

      const [tradesData, sentimentData] = await Promise.all([
        tradesResponse.json(),
        sentimentResponse.json(),
      ]);

      if (tradesData.success) setTrades(tradesData.data || []);
      if (sentimentData.success) setSentiment(sentimentData.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'bullish') return '#10B981'; // Green
    if (sentiment === 'bearish') return '#EF4444'; // Red
    return '#F59E0B'; // Amber for neutral
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'bullish') return '🐂'; // Bull
    if (sentiment === 'bearish') return '🐻'; // Bear
    return '😐'; // Neutral
  };

  const getSentimentGradient = (sentiment: string) => {
    if (sentiment === 'bullish') return 'from-green-500/20 via-green-500/10 to-transparent';
    if (sentiment === 'bearish') return 'from-red-500/20 via-red-500/10 to-transparent';
    return 'from-amber-500/20 via-amber-500/10 to-transparent';
  };

  return (
    <main className="min-h-screen p-10 bg-[#0A0E15]">
      <div className="max-w-[1900px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Smart Money Sentiment</h1>
            <p className="text-gray-400 text-sm">Real-time insights from Nansen smart money wallets</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#1A1F2E] border border-[#252A3C] shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <span className="text-green-500 font-bold text-sm uppercase tracking-wider">Live Data</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {loading ? (
            <div className="dashboard-card p-8 h-[700px] flex items-center justify-center shadow-2xl">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : sentiment ? (
            <>
              {/* Top: Centered Big Bullish/Bearish Indicator */}
              <div className="max-w-4xl mx-auto">
                <div
                  className="dashboard-card overflow-hidden relative shadow-2xl"
                  style={{ boxShadow: `0 20px 60px ${getSentimentColor(sentiment.overall)}40, 0 0 100px ${getSentimentColor(sentiment.overall)}20` }}
                  title="Overall sentiment based on smart money wallet activity in the last 24 hours"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${getSentimentGradient(sentiment.overall)}`}></div>
                  <div className="relative p-16">
                    <div className="text-center">
                      <div className="text-9xl mb-8 animate-bounce">
                        {getSentimentIcon(sentiment.overall)}
                      </div>
                      <div className="text-gray-400 text-lg font-bold uppercase tracking-widest mb-6">
                        Smart Money is
                      </div>
                      <div
                        className="text-8xl font-black uppercase mb-6"
                        style={{
                          color: getSentimentColor(sentiment.overall),
                          textShadow: `0 0 80px ${getSentimentColor(sentiment.overall)}80, 0 0 40px ${getSentimentColor(sentiment.overall)}60`
                        }}
                      >
                        {sentiment.overall}
                      </div>
                      <div className="text-gray-400 text-base font-medium">
                        Based on {sentiment.trade_count} DEX trades in the last 24 hours
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: Sentiment Meter & Stats */}
              <div className="grid grid-cols-12 gap-10">
                {/* Sentiment Meter */}
                <div className="col-span-7">
                  <div
                    className="dashboard-card p-10 shadow-2xl"
                    style={{ boxShadow: `0 10px 40px rgba(0,0,0,0.4), 0 0 60px ${getSentimentColor(sentiment.overall)}15` }}
                    title="Buy ratio shows the percentage of buy volume vs total volume (buys + sells)"
                  >
                    <div className="text-center">
                      <div className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-8">
                        Buy Ratio
                      </div>
                      <div
                        className="text-8xl font-black mb-8"
                        style={{
                          color: getSentimentColor(sentiment.overall),
                          textShadow: `0 0 50px ${getSentimentColor(sentiment.overall)}50`
                        }}
                      >
                        {sentiment.buy_ratio}%
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm font-bold text-gray-500 mb-5 uppercase tracking-widest">
                          <span className="text-red-500">🐻 Bearish</span>
                          <span className="text-green-500">🐂 Bullish</span>
                        </div>
                        <div className="h-8 bg-[#131722] rounded-full overflow-hidden border-2 border-[#252A3C] shadow-inner">
                          <div
                            className="h-full transition-all duration-1000 rounded-full relative"
                            style={{
                              width: `${sentiment.buy_ratio}%`,
                              background: `linear-gradient(90deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)`,
                              boxShadow: `0 0 30px ${getSentimentColor(sentiment.overall)}90`
                            }}
                          >
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white opacity-70 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="col-span-5 space-y-6">
                  <div
                    className="dashboard-card p-8 shadow-xl hover:shadow-2xl transition-shadow"
                    style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3), 0 0 40px rgba(16,185,129,0.1)' }}
                    title="Total USD value of tokens purchased by smart money wallets in the last 24 hours"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        24h Buy Volume
                      </div>
                      <div className="badge badge-success">
                        {sentiment.buy_count} trades
                      </div>
                    </div>
                    <div className="text-5xl font-black text-green-500 mb-3" style={{ textShadow: '0 0 30px rgba(16,185,129,0.3)' }}>
                      ${(sentiment.buy_volume_24h / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      Spot purchases by smart money
                    </div>
                  </div>

                  <div
                    className="dashboard-card p-8 shadow-xl hover:shadow-2xl transition-shadow"
                    style={{
                      boxShadow: sentiment.net_flow >= 0
                        ? '0 10px 40px rgba(0,0,0,0.3), 0 0 40px rgba(16,185,129,0.1)'
                        : '0 10px 40px rgba(0,0,0,0.3), 0 0 40px rgba(239,68,68,0.1)'
                    }}
                    title="Net flow = Buy volume - Sell volume. Positive means more buying than selling."
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        24h Net Flow
                      </div>
                      <div className={`badge ${sentiment.net_flow >= 0 ? 'badge-success' : 'badge-danger'}`}>
                        {sentiment.trade_count} total
                      </div>
                    </div>
                    <div
                      className={`text-5xl font-black mb-3 ${sentiment.net_flow >= 0 ? 'text-green-500' : 'text-red-500'}`}
                      style={{ textShadow: sentiment.net_flow >= 0 ? '0 0 30px rgba(16,185,129,0.3)' : '0 0 30px rgba(239,68,68,0.3)' }}
                    >
                      {sentiment.net_flow >= 0 ? '+' : ''}{(sentiment.net_flow / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      Buy volume - Sell volume
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Spot Trades & Perps Positions */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Activity Breakdown</h2>
                <div className="grid grid-cols-2 gap-12">
                  {/* Left: Spot Trades */}
                  <div>
                    <div
                      className="dashboard-card p-10 flex flex-col h-[700px] shadow-2xl"
                      style={{ boxShadow: '0 10px 50px rgba(0,0,0,0.4), 0 0 60px rgba(91,141,238,0.1)' }}
                      title="Real-time DEX trades from smart money wallets - these are spot market trades on decentralized exchanges"
                    >
                      <div className="flex items-center justify-between mb-10">
                        <div>
                          <h3 className="text-3xl font-bold text-white mb-2">Spot Trades</h3>
                          <p className="text-gray-500 text-sm">DEX Activity</p>
                        </div>
                        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Live Feed</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                        {trades.length > 0 ? (
                          trades.slice(0, 10).map((trade, index) => {
                            const isBuy = trade.token_sold_symbol === 'ETH' || trade.token_sold_symbol === 'USDC' || trade.token_sold_symbol === 'USDT' || trade.token_sold_symbol === 'DAI';
                            const mainToken = isBuy ? trade.token_bought_symbol : trade.token_sold_symbol;
                            return (
                              <div
                                key={index}
                                className="trade-item p-6 hover:shadow-lg transition-all"
                                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                                title={`${isBuy ? 'Buy' : 'Sell'} ${mainToken} - $${(trade.trade_value_usd / 1000).toFixed(1)}K`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl border-2 shadow-lg ${
                                      isBuy
                                        ? 'bg-green-500/10 border-green-500/30 text-green-500'
                                        : 'bg-red-500/10 border-red-500/30 text-red-500'
                                    }`}
                                      style={{
                                        boxShadow: isBuy
                                          ? '0 0 20px rgba(16,185,129,0.2)'
                                          : '0 0 20px rgba(239,68,68,0.2)'
                                      }}
                                    >
                                      {isBuy ? '↗' : '↘'}
                                    </div>
                                    <div>
                                      <div className="text-white font-bold text-xl mb-1">{mainToken}</div>
                                      <div className={`text-sm font-bold uppercase tracking-wider ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                                        {isBuy ? 'Buy' : 'Sell'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-white font-black text-2xl mb-1">
                                      ${(trade.trade_value_usd / 1000).toFixed(1)}K
                                    </div>
                                    <div className="text-gray-500 text-xs font-medium">
                                      {new Date(trade.block_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-gray-400 text-center py-24">No trades available</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Perps Positions */}
                  <div
                    title="Top performing perpetual futures positions on Hyperliquid from smart traders"
                  >
                    <SmartTraderLeaderboard />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="dashboard-card p-8 h-[700px] flex items-center justify-center shadow-2xl">
              <div className="text-gray-400">No data available</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="text-gray-600 text-xs font-medium">
            Powered by <span className="text-green-500 font-semibold">Nansen API</span> • Data refreshes every 2 minutes
          </div>
        </div>
      </div>
    </main>
  );
}
