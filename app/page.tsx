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
    const interval = setInterval(fetchData, 3600000); // 1 hour
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
    if (sentiment === 'bullish') return '#10B981';
    if (sentiment === 'bearish') return '#EF4444';
    return '#F59E0B';
  };

  return (
    <main className="min-h-screen bg-[#0A0E15] text-white">
      <div className="max-w-7xl mx-auto px-8 py-16">

        {/* Header */}
        <header className="mb-24">
          <h1 className="text-4xl font-bold mb-3">Smart Money Dashboard</h1>
          <p className="text-gray-400">Real-time sentiment from Nansen smart money wallets • Updates hourly</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-gray-400 text-lg">Loading...</div>
          </div>
        ) : sentiment ? (
          <>
            {/* Main Sentiment Card */}
            <section className="mb-24">
              <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] rounded-3xl p-16 text-center border border-white/10">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
                  Market Sentiment
                </div>
                <div
                  className="text-8xl font-black uppercase mb-6"
                  style={{ color: getSentimentColor(sentiment.overall) }}
                >
                  {sentiment.overall}
                </div>
                <div className="text-gray-400 text-base">
                  Based on {sentiment.trade_count.toLocaleString()} trades in 24h
                </div>
              </div>
            </section>

            {/* Key Metrics */}
            <section className="mb-24">
              <h2 className="text-2xl font-bold mb-8">Key Metrics</h2>

              <div className="space-y-6">
                {/* Buy Ratio */}
                <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Buy Ratio</div>
                      <div
                        className="text-5xl font-black"
                        style={{ color: getSentimentColor(sentiment.overall) }}
                      >
                        {sentiment.buy_ratio}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs text-right">
                      Percentage of buy volume vs total volume
                    </div>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${sentiment.buy_ratio}%`,
                        background: `linear-gradient(90deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)`,
                      }}
                    />
                  </div>
                </div>

                {/* 24h Buy Volume */}
                <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">24h Buy Volume</div>
                      <div className="text-5xl font-black text-green-500">
                        ${(sentiment.buy_volume_24h / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        {sentiment.buy_count.toLocaleString()} buy trades
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs text-right">
                      Total USD value purchased by smart money
                    </div>
                  </div>
                </div>

                {/* 24h Net Flow */}
                <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">24h Net Flow</div>
                      <div className={`text-5xl font-black ${sentiment.net_flow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {sentiment.net_flow >= 0 ? '+' : ''}${(Math.abs(sentiment.net_flow) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        {sentiment.trade_count.toLocaleString()} total trades
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs text-right">
                      Buy volume minus sell volume
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Activity */}
            <section>
              <h2 className="text-2xl font-bold mb-8">Live Activity</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Spot Trades */}
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden">
                  <div className="p-6 border-b border-white/[0.08]">
                    <h3 className="text-lg font-bold">Spot Trades</h3>
                    <p className="text-sm text-gray-400">Recent DEX activity</p>
                  </div>
                  <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                    {trades.slice(0, 10).map((trade, index) => {
                      const isBuy = ['ETH', 'USDC', 'USDT', 'DAI'].includes(trade.token_sold_symbol);
                      const token = isBuy ? trade.token_bought_symbol : trade.token_sold_symbol;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                              isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {isBuy ? '↑' : '↓'}
                            </div>
                            <div>
                              <div className="font-bold">{token}</div>
                              <div className={`text-xs font-semibold uppercase ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                                {isBuy ? 'Buy' : 'Sell'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              ${(trade.trade_value_usd / 1000).toFixed(1)}K
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(trade.block_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Perps Positions */}
                <SmartTraderLeaderboard />
              </div>
            </section>
          </>
        ) : (
          <div className="flex items-center justify-center py-32">
            <div className="text-gray-400 text-lg">No data available</div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-600">
          Powered by Nansen API
        </footer>
      </div>
    </main>
  );
}
