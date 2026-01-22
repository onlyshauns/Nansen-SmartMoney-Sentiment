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
    <div className="premium-card rounded-3xl p-6 flex-1 flex flex-col overflow-hidden shimmer">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-white flex items-center gap-3">
          <span className="gradient-text">Hyperliquid Positions</span>
        </h2>
        <span className="text-white/30 text-xs uppercase tracking-wider font-bold">Top 5</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {loading ? (
          <div className="text-white/50 text-center py-12 text-sm">Loading...</div>
        ) : traders.length > 0 ? (
          traders.slice(0, 5).map((trader, index) => (
            <div key={trader.address} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-nansen-cyan/50 hover:bg-white/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="gradient-text neon-text font-black text-lg">#{index + 1}</span>
                  <div>
                    <div className="text-white/80 font-mono text-xs group-hover:text-white transition-colors">{trader.address}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg ${
                        trader.side === 'long' ? 'bg-nansen-cyan/20 text-nansen-cyan border border-nansen-cyan/30' : 'bg-red-400/20 text-red-400 border border-red-400/30'
                      }`}>
                        {trader.side.toUpperCase()} {trader.leverage}x
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black ${trader.pnl >= 0 ? 'gradient-text neon-text' : 'text-red-400 neon-text'}`}>
                    {trader.pnl >= 0 ? '+' : ''}{(trader.pnl / 1000).toFixed(1)}K
                  </div>
                  <div className={`text-xs font-semibold ${trader.roi >= 0 ? 'text-nansen-cyan/70' : 'text-red-400/70'}`}>
                    {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}% ROI
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-white/50 text-center py-12 text-sm">No positions available</div>
        )}
      </div>
    </div>
  );
}
