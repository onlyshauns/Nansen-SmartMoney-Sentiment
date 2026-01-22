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
    <main className="min-h-screen p-6 bg-[#0B0E13]">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Smart Money Sentiment</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time Nansen Intelligence</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#151922] border border-[#1F2937]">
            <div className="w-2 h-2 rounded-full bg-[#00E2B3] animate-pulse"></div>
            <span className="text-[#00E2B3] font-semibold text-sm uppercase tracking-wide">Live</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left: Big Sentiment Display */}
          <div className="col-span-4">
            <div className="card p-8">
              {loading ? (
                <div className="text-gray-400 text-center py-20">Loading...</div>
              ) : sentiment ? (
                <>
                  {/* Main Sentiment */}
                  <div className="text-center mb-8">
                    <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
                      Current Sentiment
                    </div>
                    <div
                      className="text-8xl font-bold mb-4"
                      style={{ color: getSentimentColor(sentiment.overall) }}
                    >
                      {sentiment.buy_ratio}%
                    </div>
                    <div
                      className="text-3xl font-bold uppercase tracking-wide"
                      style={{ color: getSentimentColor(sentiment.overall) }}
                    >
                      {sentiment.overall}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                      <span>Bearish</span>
                      <span>Bullish</span>
                    </div>
                    <div className="h-3 bg-[#1F2937] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000 rounded-full"
                        style={{
                          width: `${sentiment.buy_ratio}%`,
                          background: `linear-gradient(90deg, #EF4444 0%, #FCD34D 50%, #00E2B3 100%)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    <div className="card-accent p-4">
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        24h Spot Buys
                      </div>
                      <div className="text-3xl font-bold text-[#00E2B3] mb-1">
                        ${(sentiment.buy_volume_24h / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-gray-500 text-sm">
                        {sentiment.buy_count} trades
                      </div>
                    </div>

                    <div className="card-accent p-4">
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        Net Flow 24h
                      </div>
                      <div className={`text-3xl font-bold mb-1 ${sentiment.net_flow >= 0 ? 'text-[#00E2B3]' : 'text-red-400'}`}>
                        {sentiment.net_flow >= 0 ? '+' : ''}{(sentiment.net_flow / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-gray-500 text-sm">
                        {sentiment.trade_count} total trades
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-center py-20">No data available</div>
              )}
            </div>
          </div>

          {/* Middle: Recent Trades */}
          <div className="col-span-5">
            <div className="card p-6 h-full flex flex-col">
              <h2 className="text-xl font-bold text-white mb-4">Recent Spot Trades</h2>
              <div className="flex-1 overflow-y-auto space-y-3">
                {loading ? (
                  <div className="text-gray-400 text-center py-20">Loading...</div>
                ) : trades.length > 0 ? (
                  trades.slice(0, 12).map((trade, index) => {
                    const isBuy = trade.token_sold_symbol === 'ETH' || trade.token_sold_symbol === 'USDC' || trade.token_sold_symbol === 'USDT' || trade.token_sold_symbol === 'DAI';
                    const mainToken = isBuy ? trade.token_bought_symbol : trade.token_sold_symbol;
                    return (
                      <div key={index} className="card-accent p-4 hover:border-[#00E2B3] transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${isBuy ? 'bg-[#00E2B3]' : 'bg-red-400'}`}></div>
                            <div>
                              <div className="text-white font-semibold text-base">{mainToken}</div>
                              <div className={`text-xs font-medium uppercase ${isBuy ? 'text-[#00E2B3]' : 'text-red-400'}`}>
                                {isBuy ? 'buy' : 'sell'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold text-lg">
                              ${(trade.trade_value_usd / 1000).toFixed(0)}K
                            </div>
                            <div className="text-gray-500 text-xs">
                              {new Date(trade.block_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-400 text-center py-20">No trades available</div>
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
        <div className="mt-6 text-center">
          <div className="text-gray-600 text-xs">Powered by Nansen API</div>
        </div>
      </div>
    </main>
  );
}
