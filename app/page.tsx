'use client';

import { useState, useEffect } from 'react';

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

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<SmartMoneyTrade[]>([]);
  const [holdings, setHoldings] = useState<SmartMoneyHolding[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchSmartMoneyData();
  }, []);

  const fetchSmartMoneyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch DEX trades
      const tradesResponse = await fetch('/api/nansen/dex-trades?limit=10');
      const tradesData = await tradesResponse.json();

      if (tradesData.success) {
        setTrades(tradesData.data || []);
      }

      // Fetch holdings
      const holdingsResponse = await fetch('/api/nansen/holdings?limit=10');
      const holdingsData = await holdingsResponse.json();

      if (holdingsData.success) {
        setHoldings(holdingsData.data || []);
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
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3 bg-nansen-darker/50 backdrop-blur-sm px-6 py-3 rounded-full border border-nansen-green/20">
              <div className="w-2 h-2 bg-nansen-green rounded-full animate-pulse"></div>
              <span className="text-nansen-green font-semibold text-sm tracking-wider">LIVE</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            SmartMoney Sentiment Tracker
          </h1>
          <p className="text-nansen-light/70 text-lg">
            Real-time tracking of Nansen smart money & Hyperliquid smart traders
          </p>
        </div>

        {/* Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="text-nansen-light/50 text-sm mb-2">Overall Sentiment</div>
            <div className="text-4xl font-bold text-nansen-green mb-1">Bullish</div>
            <div className="text-nansen-light/70 text-sm">+12% vs yesterday</div>
          </div>

          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="text-nansen-light/50 text-sm mb-2">Smart Money Buys (24h)</div>
            <div className="text-4xl font-bold text-white mb-1">$2.4M</div>
            <div className="text-nansen-green text-sm">↑ 24 transactions</div>
          </div>

          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="text-nansen-light/50 text-sm mb-2">HL Long Positions</div>
            <div className="text-4xl font-bold text-white mb-1">68%</div>
            <div className="text-nansen-blue text-sm">32% shorts</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nansen Smart Money Activity */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Smart Money Trades</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="text-nansen-light/50 text-center py-8">Loading...</div>
              ) : error ? (
                <div className="text-red-400 text-center py-8">{error}</div>
              ) : trades.length > 0 ? (
                trades.map((trade, index) => (
                  <div key={index} className="bg-nansen-darker/50 rounded-lg p-4 border border-nansen-green/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">{trade.token}</div>
                        <div className="text-nansen-light/50 text-sm">{trade.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-nansen-green font-semibold">
                          ${(trade.amount_usd / 1000).toFixed(1)}K
                        </div>
                        <div className="text-nansen-light/50 text-xs">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-nansen-light/50 text-center py-8">
                  No recent trades available
                </div>
              )}
            </div>
            <button
              onClick={fetchSmartMoneyData}
              className="mt-4 w-full px-4 py-2 bg-nansen-green/10 hover:bg-nansen-green/20 text-nansen-green rounded-lg transition-all border border-nansen-green/30"
            >
              Refresh Data
            </button>
          </div>

          {/* Smart Money Holdings */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Top Smart Money Holdings</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="text-nansen-light/50 text-center py-8">Loading...</div>
              ) : error ? (
                <div className="text-red-400 text-center py-8">{error}</div>
              ) : holdings.length > 0 ? (
                holdings.map((holding, index) => (
                  <div key={index} className="bg-nansen-darker/50 rounded-lg p-4 border border-nansen-green/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">{holding.token}</div>
                        <div className="text-nansen-light/50 text-sm">
                          ${(holding.balance_usd / 1000000).toFixed(2)}M
                        </div>
                      </div>
                      <div className={`text-right font-semibold ${
                        holding.change_24h >= 0 ? 'text-nansen-green' : 'text-red-400'
                      }`}>
                        {holding.change_24h >= 0 ? '↑' : '↓'} {Math.abs(holding.change_24h).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-nansen-light/50 text-center py-8">
                  No holdings data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-nansen-light/40 text-sm">
            <span>Powered by Nansen & Hyperliquid APIs</span>
          </div>
        </div>
      </div>
    </main>
  );
}
