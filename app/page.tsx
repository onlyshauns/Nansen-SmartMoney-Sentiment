'use client';

import { useState, useEffect } from 'react';
import SentimentMeter from '@/components/SentimentMeter';
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

  return (
    <main className="h-screen overflow-hidden">
      <div className="h-full max-w-[1900px] mx-auto p-8 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Smart Money <span className="gradient-text neon-text">Sentiment</span>
            </h1>
            <p className="text-white/50 text-sm mt-2 font-medium">Real-time Nansen Intelligence Dashboard</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full premium-card neon-glow">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-nansen-cyan to-nansen-blue animate-pulse shadow-lg"></div>
            <span className="gradient-text font-bold text-sm tracking-wider uppercase">Live</span>
          </div>
        </div>

        {/* Main Content - Single Screen */}
        <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">

          {/* Left Column - Sentiment Meter */}
          <div className="col-span-5 flex flex-col items-center justify-center">
            {loading ? (
              <div className="text-white/50">Loading...</div>
            ) : sentiment ? (
              <>
                <SentimentMeter
                  sentiment={sentiment.overall}
                  score={sentiment.score}
                  buyRatio={sentiment.buy_ratio}
                />

                {/* Stats Grid */}
                <div className="w-full mt-16 grid grid-cols-2 gap-5">
                  <div className="premium-card rounded-3xl p-6 shimmer">
                    <div className="text-white/40 text-xs uppercase tracking-widest font-bold mb-3">24h Spot Buys</div>
                    <div className="text-4xl font-black gradient-text neon-text mb-2">
                      ${(sentiment.buy_volume_24h / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-white/30 text-xs font-semibold">{sentiment.buy_count} trades</div>
                  </div>

                  <div className="premium-card rounded-3xl p-6 shimmer">
                    <div className="text-white/40 text-xs uppercase tracking-widest font-bold mb-3">Net Flow</div>
                    <div className={`text-4xl font-black mb-2 ${sentiment.net_flow >= 0 ? 'gradient-text neon-text' : 'text-red-400 neon-text'}`}>
                      {sentiment.net_flow >= 0 ? '+' : ''}{(sentiment.net_flow / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-white/30 text-xs font-semibold">{sentiment.trade_count} total trades</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-white/50">No data available</div>
            )}
          </div>

          {/* Middle Column - Recent Trades */}
          <div className="col-span-4 flex flex-col">
            <div className="premium-card rounded-3xl p-6 flex-1 flex flex-col overflow-hidden shimmer">
              <h2 className="text-xl font-black text-white mb-5 flex items-center gap-3">
                <span className="gradient-text">Recent Spot Trades</span>
                <div className="h-px flex-1 bg-gradient-to-r from-nansen-cyan/50 to-transparent"></div>
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin">
                {loading ? (
                  <div className="text-white/50 text-center py-12 text-sm">Loading...</div>
                ) : trades.length > 0 ? (
                  trades.slice(0, 15).map((trade, index) => {
                    const isBuy = trade.token_sold_symbol === 'ETH' || trade.token_sold_symbol === 'USDC' || trade.token_sold_symbol === 'USDT';
                    const mainToken = isBuy ? trade.token_bought_symbol : trade.token_sold_symbol;
                    return (
                      <div key={index} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-nansen-cyan/50 hover:bg-white/10 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full shadow-lg ${isBuy ? 'bg-gradient-to-br from-nansen-cyan to-nansen-blue neon-glow' : 'bg-gradient-to-br from-red-400 to-red-600'}`}></div>
                            <div>
                              <div className="text-white font-bold text-sm group-hover:text-nansen-cyan transition-colors">{mainToken}</div>
                              <div className={`text-xs uppercase font-semibold ${isBuy ? 'text-nansen-cyan/70' : 'text-red-400/70'}`}>{isBuy ? 'buy' : 'sell'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-black text-base">
                              ${(trade.trade_value_usd / 1000).toFixed(0)}K
                            </div>
                            <div className="text-white/30 text-xs font-medium">
                              {new Date(trade.block_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-white/50 text-center py-12 text-sm">No trades available</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Hyperliquid Positions */}
          <div className="col-span-3 flex flex-col">
            <SmartTraderLeaderboard />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="text-white/30 text-xs">Powered by Nansen API</div>
        </div>
      </div>
    </main>
  );
}
