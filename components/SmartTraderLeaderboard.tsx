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
    <div className="dashboard-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Top Positions</h2>
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Hyperliquid</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <div className="text-gray-400 text-center py-24">Loading...</div>
        ) : traders.length > 0 ? (
          traders.slice(0, 5).map((trader, index) => (
            <div key={trader.address} className="trade-item p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black' :
                    index === 1 ? 'bg-gradient-to-br from-[#C0C0C0] to-[#808080] text-black' :
                    index === 2 ? 'bg-gradient-to-br from-[#CD7F32] to-[#8B4513] text-black' :
                    'bg-[#252A3C] text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-300 font-mono text-[10px] truncate mb-1">{trader.address}</div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${trader.side === 'long' ? 'badge-success' : 'badge-danger'}`}>
                        {trader.side.toUpperCase()} {trader.leverage}x
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pl-11">
                <div>
                  <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">P&L</div>
                  <div className={`text-xl font-black ${trader.pnl >= 0 ? 'text-[#00E2B3]' : 'text-[#EF4444]'}`}>
                    {trader.pnl >= 0 ? '+' : ''}{(trader.pnl / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">ROI</div>
                  <div className={`text-xl font-black ${trader.roi >= 0 ? 'text-[#00E2B3]' : 'text-[#EF4444]'}`}>
                    {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center py-24">No positions available</div>
        )}
      </div>
    </div>
  );
}
