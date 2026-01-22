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
    <main className="h-screen overflow-hidden bg-gradient-to-br from-[#08283B] via-[#042133] to-[#08283B]">
      <div className="h-full max-w-[1800px] mx-auto p-6 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Smart Money Sentiment
            </h1>
            <p className="text-white/40 text-sm mt-1">Real-time Nansen Intelligence</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-nansen-cyan/20">
            <div className="w-2 h-2 bg-nansen-cyan rounded-full animate-pulse"></div>
            <span className="text-nansen-cyan font-semibold text-xs tracking-wider">LIVE</span>
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
                <div className="w-full mt-12 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                    <div className="text-white/50 text-xs uppercase tracking-wider mb-2">24h Spot Buys</div>
                    <div className="text-3xl font-bold text-nansen-cyan">
                      ${(sentiment.buy_volume_24h / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-white/40 text-xs mt-1">{sentiment.buy_count} trades</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                    <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Net Flow</div>
                    <div className={`text-3xl font-bold ${sentiment.net_flow >= 0 ? 'text-nansen-cyan' : 'text-red-400'}`}>
                      {sentiment.net_flow >= 0 ? '+' : ''}{(sentiment.net_flow / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-white/40 text-xs mt-1">{sentiment.trade_count} total trades</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-white/50">No data available</div>
            )}
          </div>

          {/* Middle Column - Recent Trades */}
          <div className="col-span-4 flex flex-col">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex-1 flex flex-col overflow-hidden">
              <h2 className="text-lg font-bold text-white mb-4">Recent Spot Trades</h2>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                {loading ? (
                  <div className="text-white/50 text-center py-8 text-sm">Loading...</div>
                ) : trades.length > 0 ? (
                  trades.slice(0, 15).map((trade, index) => {
                    const isBuy = trade.token_sold_symbol === 'ETH' || trade.token_sold_symbol === 'USDC' || trade.token_sold_symbol === 'USDT';
                    const mainToken = isBuy ? trade.token_bought_symbol : trade.token_sold_symbol;
                    return (
                      <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-nansen-cyan/30 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isBuy ? 'bg-nansen-cyan' : 'bg-red-400'}`}></div>
                            <div>
                              <div className="text-white font-semibold text-sm">{mainToken}</div>
                              <div className="text-white/40 text-xs uppercase">{isBuy ? 'buy' : 'sell'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold text-sm">
                              ${(trade.trade_value_usd / 1000).toFixed(0)}K
                            </div>
                            <div className="text-white/40 text-xs">
                              {new Date(trade.block_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-white/50 text-center py-8 text-sm">No trades available</div>
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
