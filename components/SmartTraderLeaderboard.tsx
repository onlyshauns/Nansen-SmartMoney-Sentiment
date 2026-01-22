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
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Hyperliquid Positions</h2>
        <span className="text-white/40 text-xs uppercase tracking-wider">Top 5</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
        {loading ? (
          <div className="text-white/50 text-center py-8 text-sm">Loading...</div>
        ) : traders.length > 0 ? (
          traders.slice(0, 5).map((trader, index) => (
            <div key={trader.address} className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-nansen-cyan/30 transition-all">
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
            </div>
          ))
        ) : (
          <div className="text-white/50 text-center py-8 text-sm">No positions available</div>
        )}
      </div>
    </div>
  );
}
