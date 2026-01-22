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
    const interval = setInterval(fetchData, 30000);
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
    if (sentiment === 'bullish') return '#00E2B3';
    if (sentiment === 'bearish') return '#EF4444';
    return '#FCD34D';
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
        <div className="grid grid-cols-12 gap-6">

          {/* Left: Sentiment Overview */}
          <div className="col-span-4 space-y-6">
            {loading ? (
              <div className="dashboard-card p-8 h-[600px] flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : sentiment ? (
              <>
                {/* Main Sentiment Card */}
                <div className="dashboard-card p-8">
                  <div className="text-center">
                    <div className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-6">
                      Market Sentiment
                    </div>
                    <div
                      className="text-7xl font-black mb-3"
                      style={{
                        color: getSentimentColor(sentiment.overall),
                        textShadow: `0 0 40px ${getSentimentColor(sentiment.overall)}40`
                      }}
                    >
                      {sentiment.buy_ratio}%
                    </div>
                    <div className="mb-8">
                      <span
                        className="inline-block px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider"
                        style={{
                          background: `${getSentimentColor(sentiment.overall)}20`,
                          color: getSentimentColor(sentiment.overall),
                          border: `2px solid ${getSentimentColor(sentiment.overall)}40`
                        }}
                      >
                        {sentiment.overall}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest px-1">
                        <span>🐻 Bearish</span>
                        <span>🚀 Bullish</span>
                      </div>
                      <div className="h-4 bg-[#131722] rounded-full overflow-hidden border border-[#252A3C] shadow-inner">
                        <div
                          className="h-full transition-all duration-1000 rounded-full relative"
                          style={{
                            width: `${sentiment.buy_ratio}%`,
                            background: `linear-gradient(90deg, #EF4444 0%, #FCD34D 50%, #00E2B3 100%)`,
                            boxShadow: `0 0 20px ${getSentimentColor(sentiment.overall)}60`
                          }}
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="space-y-4">
                  <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        24h Buy Volume
                      </div>
                      <div className="badge badge-success">
                        {sentiment.buy_count} trades
                      </div>
                    </div>
                    <div className="text-4xl font-black text-[#00E2B3] mb-1">
                      ${(sentiment.buy_volume_24h / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      Spot purchases by smart money
                    </div>
                  </div>

                  <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        24h Net Flow
                      </div>
                      <div className={`badge ${sentiment.net_flow >= 0 ? 'badge-success' : 'badge-danger'}`}>
                        {sentiment.trade_count} total
                      </div>
                    </div>
                    <div className={`text-4xl font-black mb-1 ${sentiment.net_flow >= 0 ? 'text-[#00E2B3]' : 'text-[#EF4444]'}`}>
                      {sentiment.net_flow >= 0 ? '+' : ''}{(sentiment.net_flow / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      Buy volume - Sell volume
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="dashboard-card p-8 h-[600px] flex items-center justify-center">
                <div className="text-gray-400">No data available</div>
              </div>
            )}
          </div>

          {/* Middle: Recent Trades */}
          <div className="col-span-5">
            <div className="dashboard-card p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Smart Money Trades</h2>
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Live Feed</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
                {loading ? (
                  <div className="text-gray-400 text-center py-24">Loading trades...</div>
                ) : trades.length > 0 ? (
                  trades.slice(0, 14).map((trade, index) => {
                    const isBuy = trade.token_sold_symbol === 'ETH' || trade.token_sold_symbol === 'USDC' || trade.token_sold_symbol === 'USDT' || trade.token_sold_symbol === 'DAI';
                    const mainToken = isBuy ? trade.token_bought_symbol : trade.token_sold_symbol;
                    return (
                      <div key={index} className="trade-item p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border-2 ${
                              isBuy
                                ? 'bg-[#00E2B3]/10 border-[#00E2B3]/30 text-[#00E2B3]'
                                : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                            }`}>
                              {isBuy ? '↗' : '↘'}
                            </div>
                            <div>
                              <div className="text-white font-bold text-base mb-1">{mainToken}</div>
                              <div className={`text-xs font-bold uppercase tracking-wider ${isBuy ? 'text-[#00E2B3]' : 'text-[#EF4444]'}`}>
                                {isBuy ? 'Buy' : 'Sell'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-black text-lg mb-1">
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
        <div className="mt-8 text-center">
          <div className="text-gray-600 text-xs font-medium">
            Powered by <span className="text-[#00E2B3] font-semibold">Nansen API</span> • Data refreshes every 30s
          </div>
        </div>
      </div>
    </main>
  );
}
