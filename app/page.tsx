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

  const renderBullBearIcon = (sentiment: string) => {
    if (sentiment === 'bullish') {
      return (
        <div className="bull-icon mb-12">
          <div className="bull-arrow"></div>
        </div>
      );
    }
    if (sentiment === 'bearish') {
      return (
        <div className="bear-icon mb-12">
          <div className="bear-arrow"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-[#0A0E15]">
      <div className="max-w-[1600px] mx-auto px-12 py-20">

        {/* Header */}
        <div className="mb-32">
          <h1 className="text-3xl font-bold text-white mb-2" title="Dashboard tracking trading activity from wallets identified by Nansen as 'smart money' - experienced and successful traders">Smart Money Dashboard</h1>
          <p className="text-gray-500 text-sm" title="Data updates every hour from Nansen API">Real-time sentiment from Nansen smart money wallets</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="text-gray-500">Loading data...</div>
          </div>
        ) : sentiment ? (
          <div className="space-y-64">

            {/* Hero Sentiment Indicator */}
            <div className="max-w-3xl mx-auto">
              <div
                className="hero-card p-24 text-center relative"
                style={{
                  boxShadow: `0 30px 90px ${getSentimentColor(sentiment.overall)}25`,
                }}
              >
                <div className="absolute top-8 right-8 info-icon">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white/90 cursor-help transition-all text-base font-bold">
                    ⓘ
                  </div>
                  <div className="tooltip-text">
                    Overall market sentiment determined by analyzing smart money wallet activity over the last 24 hours. Bullish = more buying than selling. Bearish = more selling than buying. Based on actual DEX trades from Nansen-verified smart money wallets.
                  </div>
                </div>
                {renderBullBearIcon(sentiment.overall)}

                <div className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
                  Smart Money Is
                </div>

                <div
                  className="text-8xl font-black uppercase mb-8 tracking-tight"
                  style={{
                    color: getSentimentColor(sentiment.overall),
                    textShadow: `0 0 80px ${getSentimentColor(sentiment.overall)}40`,
                  }}
                >
                  {sentiment.overall}
                </div>

                <div className="text-gray-400 text-sm">
                  Based on {sentiment.trade_count.toLocaleString()} trades in the last 24 hours
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-24">
              {/* Buy Ratio */}
              <div className="stat-card p-12 relative">
                <div className="absolute top-4 right-4 info-icon">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white/90 cursor-help transition-all text-sm font-bold">
                    ⓘ
                  </div>
                  <div className="tooltip-text">
                    Buy Ratio shows the percentage of buy volume compared to total trading volume (buys + sells). A higher percentage indicates more bullish sentiment. Calculated from 24h DEX trading data.
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-8">Buy Ratio</div>
                <div
                  className="text-6xl font-black mb-8"
                  style={{ color: getSentimentColor(sentiment.overall) }}
                >
                  {sentiment.buy_ratio}%
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${sentiment.buy_ratio}%`,
                      background: `linear-gradient(90deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Buy Volume */}
              <div className="stat-card p-12 relative">
                <div className="absolute top-4 right-4 info-icon">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white/90 cursor-help transition-all text-sm font-bold">
                    ⓘ
                  </div>
                  <div className="tooltip-text">
                    Total USD value of tokens purchased by smart money wallets in the last 24 hours via DEX trades. This represents the aggregate buying power and bullish conviction of smart money traders.
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-8">24h Buy Volume</div>
                <div className="text-6xl font-black text-green-500 mb-4">
                  ${(sentiment.buy_volume_24h / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-500">{sentiment.buy_count.toLocaleString()} buy trades</div>
              </div>

              {/* Net Flow */}
              <div className="stat-card p-12 relative">
                <div className="absolute top-4 right-4 info-icon">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white/90 cursor-help transition-all text-sm font-bold">
                    ⓘ
                  </div>
                  <div className="tooltip-text">
                    Net Flow = Buy volume minus Sell volume. Positive (green) means more capital flowing IN (bullish). Negative (red) means more capital flowing OUT (bearish). Shows the net directional flow of smart money capital.
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-8">24h Net Flow</div>
                <div className={`text-6xl font-black mb-4 ${sentiment.net_flow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {sentiment.net_flow >= 0 ? '+' : ''}{(sentiment.net_flow / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-500">{sentiment.trade_count.toLocaleString()} total trades</div>
              </div>
            </div>

            {/* Activity Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-20" title="Real-time trading activity from smart money wallets across spot markets (DEX) and perpetual futures (Hyperliquid)">Live Activity</h2>

              <div className="flex gap-24">
                {/* Spot Trades */}
                <div className="flex-1 card relative">
                  <div className="absolute top-6 right-6 info-icon z-10">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white/90 cursor-help transition-all text-sm font-bold">
                      ⓘ
                    </div>
                    <div className="tooltip-text">
                      Real-time decentralized exchange (DEX) spot market trades from Nansen-identified smart money wallets. Tracks buying and selling activity across Ethereum, Base, Polygon, and other EVM-compatible chains. Updates every hour.
                    </div>
                  </div>
                  <div className="p-12 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Spot Trades</h3>
                        <p className="text-xs text-gray-500">DEX Activity</p>
                      </div>
                      <div className="badge badge-success">Live</div>
                    </div>
                  </div>

                  <div className="p-12 space-y-8 max-h-[600px] overflow-y-auto">
                    {trades.slice(0, 10).map((trade, index) => {
                      const isBuy = ['ETH', 'USDC', 'USDT', 'DAI'].includes(trade.token_sold_symbol);
                      const token = isBuy ? trade.token_bought_symbol : trade.token_sold_symbol;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                          title={`Smart money ${isBuy ? 'bought' : 'sold'} ${token} for $${(trade.trade_value_usd / 1000).toFixed(1)}K on ${trade.chain} at ${new Date(trade.block_timestamp).toLocaleString()}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                              isBuy ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                              {isBuy ? '↑' : '↓'}
                            </div>
                            <div>
                              <div className="text-white font-bold">{token}</div>
                              <div className={`text-xs font-semibold uppercase ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                                {isBuy ? 'Buy' : 'Sell'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold text-lg">
                              ${(trade.trade_value_usd / 1000).toFixed(1)}K
                            </div>
                            <div className="text-xs text-gray-500">
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
            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center py-40">
            <div className="text-gray-500">No data available</div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 text-center text-xs text-gray-600">
          Powered by Nansen API • Updates every hour
        </div>
      </div>
    </main>
  );
}
