'use client';

import { useState, useEffect } from 'react';
import AlertNotification from '@/components/AlertNotification';
import SentimentChart from '@/components/SentimentChart';
import SmartTraderLeaderboard from '@/components/SmartTraderLeaderboard';

interface SmartMoneyTrade {
  chain: string;
  block_timestamp: string;
  trader_address: string;
  trader_address_label: string;
  token_bought_symbol: string;
  token_sold_symbol: string;
  token_bought_amount: number;
  token_sold_amount: number;
  trade_value_usd: number;
}

interface SmartMoneyHolding {
  chain: string;
  token_symbol: string;
  value_usd: number;
  balance_24h_percent_change: number;
  holders_count: number;
  share_of_holdings_percent: number;
  market_cap_usd: number;
}

interface SentimentData {
  overall: string;
  score: number;
  change_24h: number;
  buy_volume_24h: number;
  sell_volume_24h: number;
  buy_ratio?: number;
  net_flow?: number;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<SmartMoneyTrade[]>([]);
  const [holdings, setHoldings] = useState<SmartMoneyHolding[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchSmartMoneyData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSmartMoneyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSmartMoneyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [tradesResponse, holdingsResponse, sentimentResponse] = await Promise.all([
        fetch('/api/nansen/dex-trades'),
        fetch('/api/nansen/holdings'),
        fetch('/api/sentiment'),
      ]);

      const [tradesData, holdingsData, sentimentData] = await Promise.all([
        tradesResponse.json(),
        holdingsResponse.json(),
        sentimentResponse.json(),
      ]);

      if (tradesData.success) {
        setTrades(tradesData.data || []);
      }

      if (holdingsData.success) {
        setHoldings(holdingsData.data || []);
      }

      if (sentimentData.success) {
        setSentiment(sentimentData.data);
      } else {
        setError(sentimentData.error);
      }
    } catch (err: any) {
      console.error('Error fetching smart money data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen py-6 px-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Smart Money <span className="gradient-text">Sentiment</span>
              </h1>
              <p className="text-nansen-light/60 text-sm">
                Real-time Nansen & Hyperliquid intelligence
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nansen-darker/80 border border-nansen-cyan/30">
              <div className="w-2 h-2 bg-nansen-cyan rounded-full animate-pulse"></div>
              <span className="text-nansen-cyan font-semibold text-xs tracking-wider">LIVE</span>
            </div>
          </div>
        </div>

        {/* Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card rounded-xl p-6">
            <div className="text-nansen-light/50 text-xs uppercase tracking-wider mb-3">Overall Sentiment</div>
            {loading ? (
              <div className="text-xl text-nansen-light/50">Loading...</div>
            ) : sentiment ? (
              <>
                <div className={`text-5xl font-bold mb-2 ${
                  sentiment.overall === 'bullish' ? 'text-nansen-cyan' :
                  sentiment.overall === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {sentiment.overall.charAt(0).toUpperCase() + sentiment.overall.slice(1)}
                </div>
                <div className={`text-sm font-medium ${sentiment.change_24h >= 0 ? 'text-nansen-cyan' : 'text-red-400'}`}>
                  {sentiment.change_24h >= 0 ? '↑' : '↓'} {Math.abs(sentiment.change_24h).toFixed(1)}% vs 24h
                </div>
              </>
            ) : (
              <div className="text-xl text-nansen-light/50">N/A</div>
            )}
          </div>

          <div className="stat-card rounded-xl p-6">
            <div className="text-nansen-light/50 text-xs uppercase tracking-wider mb-3">Buy Volume 24h</div>
            {loading ? (
              <div className="text-xl text-nansen-light/50">Loading...</div>
            ) : sentiment ? (
              <>
                <div className="text-5xl font-bold text-white mb-2">
                  ${(sentiment.buy_volume_24h / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm font-medium text-nansen-blue">
                  {sentiment.buy_ratio || 50}% buy ratio
                </div>
              </>
            ) : (
              <div className="text-xl text-nansen-light/50">N/A</div>
            )}
          </div>

          <div className="stat-card rounded-xl p-6">
            <div className="text-nansen-light/50 text-xs uppercase tracking-wider mb-3">Net Flow 24h</div>
            {loading ? (
              <div className="text-xl text-nansen-light/50">Loading...</div>
            ) : sentiment && sentiment.net_flow !== undefined ? (
              <>
                <div className={`text-5xl font-bold mb-2 ${
                  sentiment.net_flow >= 0 ? 'text-nansen-cyan' : 'text-red-400'
                }`}>
                  {sentiment.net_flow >= 0 ? '+' : ''}{(sentiment.net_flow / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm font-medium text-nansen-light/70">
                  {sentiment.net_flow >= 0 ? 'Net Accumulation' : 'Net Distribution'}
                </div>
              </>
            ) : (
              <div className="text-xl text-nansen-light/50">N/A</div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Nansen Smart Money Activity */}
          <div className="glass-card rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-4">Recent Trades</h2>
            <div className="space-y-2">
              {loading ? (
                <div className="text-nansen-light/50 text-center py-8 text-sm">Loading...</div>
              ) : error ? (
                <div className="text-red-400 text-center py-8 text-sm">{error}</div>
              ) : trades.length > 0 ? (
                trades.slice(0, 10).map((trade, index) => {
                  const isBuy = trade.token_sold_symbol === 'ETH' || trade.token_sold_symbol === 'USDC' || trade.token_sold_symbol === 'USDT';
                  const mainToken = isBuy ? trade.token_bought_symbol : trade.token_sold_symbol;
                  return (
                    <div key={index} className="bg-nansen-darker/70 rounded-lg p-3 border border-nansen-cyan/10 hover:border-nansen-cyan/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${isBuy ? 'bg-nansen-cyan' : 'bg-red-400'}`}></div>
                          <div>
                            <div className="text-white font-semibold text-sm">{mainToken}</div>
                            <div className="text-nansen-light/40 text-xs uppercase">{isBuy ? 'buy' : 'sell'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-sm">
                            ${(trade.trade_value_usd / 1000).toFixed(0)}K
                          </div>
                          <div className="text-nansen-light/40 text-xs">
                            {new Date(trade.block_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-nansen-light/50 text-center py-8 text-sm">
                  No recent trades available
                </div>
              )}
            </div>
            <button
              onClick={fetchSmartMoneyData}
              className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-nansen-cyan to-nansen-blue hover:opacity-90 text-white rounded-lg transition-all font-semibold text-sm"
            >
              Refresh Data
            </button>
          </div>

          {/* Smart Money Holdings */}
          <div className="glass-card rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-4">Top Holdings</h2>
            <div className="space-y-2">
              {loading ? (
                <div className="text-nansen-light/50 text-center py-8 text-sm">Loading...</div>
              ) : error ? (
                <div className="text-red-400 text-center py-8 text-sm">{error}</div>
              ) : holdings.length > 0 ? (
                holdings.slice(0, 10).map((holding, index) => (
                  <div key={index} className="bg-nansen-darker/70 rounded-lg p-3 border border-nansen-cyan/10 hover:border-nansen-cyan/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold text-sm">{holding.token_symbol}</div>
                        <div className="text-nansen-light/40 text-xs">
                          ${(holding.value_usd / 1000000).toFixed(1)}M • {holding.holders_count} holders
                        </div>
                      </div>
                      <div className={`text-right font-bold text-sm ${
                        holding.balance_24h_percent_change >= 0 ? 'text-nansen-cyan' : 'text-red-400'
                      }`}>
                        {holding.balance_24h_percent_change >= 0 ? '+' : ''}{holding.balance_24h_percent_change.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-nansen-light/50 text-center py-8 text-sm">
                  No holdings data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sentiment && <SentimentChart currentScore={sentiment.score} />}
          <SmartTraderLeaderboard />
        </div>

        {/* Alerts */}
        <div className="mt-4">
          <AlertNotification enabled={alertsEnabled} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-4">
          <div className="inline-flex items-center gap-3 text-nansen-light/40 text-xs">
            <span>Powered by Nansen & Hyperliquid</span>
            <span>•</span>
            <button
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              className="text-nansen-cyan hover:text-nansen-blue transition-colors font-medium"
            >
              Alerts: {alertsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
