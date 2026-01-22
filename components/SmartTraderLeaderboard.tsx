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
    <div className="card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Hyperliquid Positions</h2>
        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Top 5</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="text-gray-400 text-center py-20">Loading...</div>
        ) : traders.length > 0 ? (
          traders.slice(0, 5).map((trader, index) => (
            <div key={trader.address} className="card-accent p-4 hover:border-[#00E2B3] transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[#00E2B3] font-bold text-lg">#{index + 1}</span>
                  <div>
                    <div className="text-gray-300 font-mono text-xs">{trader.address}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        trader.side === 'long' ? 'bg-[#00E2B3]/20 text-[#00E2B3] border border-[#00E2B3]/30' : 'bg-red-400/20 text-red-400 border border-red-400/30'
                      }`}>
                        {trader.side.toUpperCase()} {trader.leverage}x
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${trader.pnl >= 0 ? 'text-[#00E2B3]' : 'text-red-400'}`}>
                    {trader.pnl >= 0 ? '+' : ''}{(trader.pnl / 1000).toFixed(1)}K
                  </div>
                  <div className={`text-xs font-semibold ${trader.roi >= 0 ? 'text-[#00E2B3]/70' : 'text-red-400/70'}`}>
                    {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}% ROI
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center py-20">No positions available</div>
        )}
      </div>
    </div>
  );
}
