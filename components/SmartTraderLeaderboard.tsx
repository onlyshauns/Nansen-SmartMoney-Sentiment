'use client';

import { useEffect, useState } from 'react';

interface SmartTrader {
  address: string;
  position_size: number;
  pnl: number;
  leverage: number;
  side: 'long' | 'short';
  entry_price: number;
  current_price: number;
  roi: number;
}

export default function SmartTraderLeaderboard() {
  const [traders, setTraders] = useState<SmartTrader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraders();
    const interval = setInterval(fetchTraders, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchTraders = async () => {
    try {
      const response = await fetch('/api/smart-traders');
      const data = await response.json();

      if (data.success) {
        setTraders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching traders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Smart Traders</h2>
        <span className="text-nansen-light/40 text-xs uppercase tracking-wider">Hyperliquid</span>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-nansen-light/50 text-center py-8 text-sm">Loading traders...</div>
        ) : traders.length > 0 ? (
          traders.slice(0, 5).map((trader, index) => (
            <div key={trader.address} className="bg-nansen-darker/70 rounded-lg p-3 border border-nansen-cyan/10 hover:border-nansen-cyan/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="gradient-text font-bold text-sm">#{index + 1}</span>
                  <div>
                    <div className="text-white font-mono text-xs">{trader.address}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        trader.side === 'long' ? 'bg-nansen-cyan/20 text-nansen-cyan' : 'bg-red-400/20 text-red-400'
                      }`}>
                        {trader.side.toUpperCase()} {trader.leverage}x
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${trader.pnl >= 0 ? 'text-nansen-cyan' : 'text-red-400'}`}>
                    {trader.pnl >= 0 ? '+' : ''}{(trader.pnl / 1000).toFixed(1)}K
                  </div>
                  <div className={`text-xs ${trader.roi >= 0 ? 'text-nansen-cyan' : 'text-red-400'}`}>
                    {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}% ROI
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-nansen-light/40 mt-2 pt-2 border-t border-nansen-cyan/10">
                <span>${(trader.position_size / 1000).toFixed(0)}K</span>
                <span>${trader.entry_price.toFixed(0)}</span>
                <span>${trader.current_price.toFixed(0)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-nansen-light/50 text-center py-8 text-sm">No traders data available</div>
        )}
      </div>
    </div>
  );
}
