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
    <main className="min-h-screen p-8 bg-[#0A0E15]">
      <div className="max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Smart Money Sentiment</h1>
            <p className="text-gray-400 text-sm">Real-time insights from Nansen smart money wallets</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#1A1F2E] border border-[#252A3C] shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00E2B3] animate-pulse shadow-[0_0_10px_rgba(0,226,179,0.5)]"></div>
            <span className="text-[#00E2B3] font-bold text-sm uppercase tracking-wider">Live Data</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-8">

          {/* Left: Sentiment Overview */}
          <div className="col-span-4 space-y-6">
            {loading ? (
              <div className="dashboard-card p-8 h-[700px] flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : sentiment ? (
              <>
                {/* Big Bullish/Bearish Indicator */}
                <div className={`dashboard-card overflow-hidden relative`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${getSentimentGradient(sentiment.overall)}`}></div>
                  <div className="relative p-10">
                    <div className="text-center">
                      <div className="text-8xl mb-6 animate-bounce">
                        {getSentimentIcon(sentiment.overall)}
                      </div>
                      <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">
                        Smart Money is
                      </div>
                      <div
                        className="text-6xl font-black uppercase mb-4"
                        style={{
                          color: getSentimentColor(sentiment.overall),
                          textShadow: `0 0 60px ${getSentimentColor(sentiment.overall)}60`
                        }}
                      >
                        {sentiment.overall}
                      </div>
                      <div className="text-gray-500 text-sm font-medium">
                        Based on {sentiment.trade_count} trades in 24h
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sentiment Meter */}
                <div className="dashboard-card p-8">
                  <div className="text-center">
                    <div className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-6">
                      Buy Ratio
                    </div>
                    <div
                      className="text-7xl font-black mb-6"
                      style={{
                        color: getSentimentColor(sentiment.overall),
                        textShadow: `0 0 40px ${getSentimentColor(sentiment.overall)}40`
                      }}
                    >
                      {sentiment.buy_ratio}%
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">
                        <span className="text-red-500">🐻 Bearish</span>
                        <span className="text-green-500">🐂 Bullish</span>
                      </div>
                      <div className="h-6 bg-[#131722] rounded-full overflow-hidden border-2 border-[#252A3C] shadow-inner">
                        <div
                          className="h-full transition-all duration-1000 rounded-full relative"
                          style={{
                            width: `${sentiment.buy_ratio}%`,
                            background: `linear-gradient(90deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)`,
                            boxShadow: `0 0 20px ${getSentimentColor(sentiment.overall)}80`
                          }}
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white opacity-70 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="space-y-5">
                  <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        24h Buy Volume
                      </div>
                      <div className="badge badge-success">
                        {sentiment.buy_count} trades
                      </div>
                    </div>
                    <div className="text-4xl font-black text-green-500 mb-2">
                      ${(sentiment.buy_volume_24h / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      Spot purchases by smart money
                    </div>
                  </div>

                  <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        24h Net Flow
                      </div>
                      <div className={`badge ${sentiment.net_flow >= 0 ? 'badge-success' : 'badge-danger'}`}>
                        {sentiment.trade_count} total
                      </div>
                    </div>
                    <div className={`text-4xl font-black mb-2 ${sentiment.net_flow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {sentiment.net_flow >= 0 ? '+' : ''}{(sentiment.net_flow / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      Buy volume - Sell volume
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="dashboard-card p-8 h-[700px] flex items-center justify-center">
                <div className="text-gray-400">No data available</div>
              </div>
            )}
          </div>

          {/* Middle: Recent Trades */}
          <div className="col-span-5">
            <div className="dashboard-card p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Recent Smart Money Trades</h2>
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Live Feed</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {loading ? (
                  <div className="text-gray-400 text-center py-24">Loading trades...</div>
                ) : trades.length > 0 ? (
                  trades.slice(0, 12).map((trade, index) => {
                    const isBuy = trade.token_sold_symbol === 'ETH' || trade.token_sold_symbol === 'USDC' || trade.token_sold_symbol === 'USDT' || trade.token_sold_symbol === 'DAI';
                    const mainToken = isBuy ? trade.token_bought_symbol : trade.token_sold_symbol;
                    return (
                      <div key={index} className="trade-item p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${
                              isBuy
                                ? 'bg-green-500/10 border-green-500/30 text-green-500'
                                : 'bg-red-500/10 border-red-500/30 text-red-500'
                            }`}>
                              {isBuy ? '↗' : '↘'}
                            </div>
                            <div>
                              <div className="text-white font-bold text-lg mb-1">{mainToken}</div>
                              <div className={`text-xs font-bold uppercase tracking-wider ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                                {isBuy ? 'Buy' : 'Sell'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-black text-xl mb-1">
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

          {/* Right: Hyperliquid Positions */}
          <div className="col-span-3">
            <SmartTraderLeaderboard />
          </div>
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
