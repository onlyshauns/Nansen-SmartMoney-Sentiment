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
    const interval = setInterval(fetchTraders, 3600000); // 1 hour
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
    <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden">
      <div className="p-6 border-b border-white/[0.08]">
        <h3 className="text-lg font-bold">Perps Positions</h3>
        <p className="text-sm text-gray-400">Top 5 on Hyperliquid</p>
      </div>

      <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="text-gray-400 text-center py-16">Loading...</div>
        ) : traders.length > 0 ? (
          traders.slice(0, 5).map((trader, index) => (
            <div
              key={trader.address}
              className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-gray-400/20 text-gray-300' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-white/5 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 font-mono truncate">{trader.address}</div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  trader.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {trader.side.toUpperCase()} {trader.leverage}x
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">P&L</div>
                  <div className={`text-2xl font-black ${trader.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trader.pnl >= 0 ? '+' : ''}${(Math.abs(trader.pnl) / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">ROI</div>
                  <div className={`text-2xl font-black ${trader.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center py-16">No positions available</div>
        )}
      </div>
    </div>
  );
}
