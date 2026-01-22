'use client';

import { useState, useEffect } from 'react';
import AlertNotification from '@/components/AlertNotification';
import SentimentChart from '@/components/SentimentChart';
import SmartTraderLeaderboard from '@/components/SmartTraderLeaderboard';

interface SmartMoneyTrade {
  token: string;
  type: string;
  amount_usd: number;
  timestamp: string;
}

interface SmartMoneyHolding {
  token: string;
  balance_usd: number;
  change_24h: number;
}

interface NetflowData {
  token: string;
  net_flow: number;
  buy_volume: number;
  sell_volume: number;
  unique_wallets: number;
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
  const [netflows, setNetflows] = useState<NetflowData[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchSmartMoneyData();
  }, []);

  const fetchSmartMoneyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [tradesResponse, holdingsResponse, netflowsResponse, sentimentResponse] = await Promise.all([
        fetch('/api/nansen/dex-trades?limit=10'),
        fetch('/api/nansen/holdings?limit=10'),
        fetch('/api/nansen/netflows?limit=10'),
        fetch('/api/sentiment'),
      ]);

      const [tradesData, holdingsData, netflowsData, sentimentData] = await Promise.all([
        tradesResponse.json(),
        holdingsResponse.json(),
        netflowsResponse.json(),
        sentimentResponse.json(),
      ]);

      if (tradesData.success) {
        setTrades(tradesData.data || []);
      }

      if (holdingsData.success) {
        setHoldings(holdingsData.data || []);
      }

      if (netflowsData.success) {
        setNetflows(netflowsData.data || []);
      }

      if (sentimentData.success) {
        setSentiment(sentimentData.data);
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
                trades.slice(0, 8).map((trade, index) => (
                  <div key={index} className="bg-nansen-darker/70 rounded-lg p-3 border border-nansen-cyan/10 hover:border-nansen-cyan/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${trade.type === 'buy' ? 'bg-nansen-cyan' : 'bg-red-400'}`}></div>
                        <div>
                          <div className="text-white font-semibold text-sm">{trade.token}</div>
                          <div className="text-nansen-light/40 text-xs uppercase">{trade.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-sm">
                          ${(trade.amount_usd / 1000).toFixed(0)}K
                        </div>
                        <div className="text-nansen-light/40 text-xs">
                          {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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
                holdings.slice(0, 8).map((holding, index) => (
                  <div key={index} className="bg-nansen-darker/70 rounded-lg p-3 border border-nansen-cyan/10 hover:border-nansen-cyan/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold text-sm">{holding.token}</div>
                        <div className="text-nansen-light/40 text-xs">
                          ${(holding.balance_usd / 1000000).toFixed(2)}M balance
                        </div>
                      </div>
                      <div className={`text-right font-bold text-sm ${
                        holding.change_24h >= 0 ? 'text-nansen-cyan' : 'text-red-400'
                      }`}>
                        {holding.change_24h >= 0 ? '+' : ''}{holding.change_24h.toFixed(1)}%
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

        {/* Token Netflows */}
        <div className="glass-card rounded-xl p-5 mb-4">
          <h2 className="text-xl font-bold text-white mb-4">Token Netflows (24h)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading ? (
              <div className="text-nansen-light/50 text-center py-8 col-span-full text-sm">Loading...</div>
            ) : error ? (
              <div className="text-red-400 text-center py-8 col-span-full text-sm">{error}</div>
            ) : netflows.length > 0 ? (
              netflows.slice(0, 6).map((flow, index) => (
                <div key={index} className="bg-nansen-darker/70 rounded-lg p-4 border border-nansen-cyan/10 hover:border-nansen-cyan/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-white font-semibold text-sm">{flow.token}</div>
                    <div className={`text-xl font-bold ${
                      flow.net_flow >= 0 ? 'text-nansen-cyan' : 'text-red-400'
                    }`}>
                      {flow.net_flow >= 0 ? '+' : ''}{(flow.net_flow / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-nansen-light/50 mb-2">
                    <span>Buy ${(flow.buy_volume / 1000000).toFixed(1)}M</span>
                    <span>Sell ${(flow.sell_volume / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="text-xs text-nansen-light/40">
                    {flow.unique_wallets} wallets
                  </div>
                </div>
              ))
            ) : (
              <div className="text-nansen-light/50 text-center py-8 col-span-full text-sm">
                No netflow data available
              </div>
            )}
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
