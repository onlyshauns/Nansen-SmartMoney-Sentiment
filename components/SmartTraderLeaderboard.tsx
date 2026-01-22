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
    const interval = setInterval(fetchTraders, 60000);
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
    <div className="card">
      <div className="p-10 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Perps Positions</h3>
            <p className="text-xs text-gray-500">Hyperliquid Leaderboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="info-icon">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white/90 cursor-help transition-all text-sm font-bold">
                ⓘ
              </div>
              <div className="tooltip-text">
                Top 5 performing perpetual futures positions on Hyperliquid DEX from smart traders. Shows P&L (profit/loss in dollars) and ROI (return on investment as percentage). Positions are leveraged long or short trades on crypto perpetuals.
              </div>
            </div>
            <div className="badge badge-success">Top 5</div>
          </div>
        </div>
      </div>

      <div className="p-10 space-y-8 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="text-gray-500 text-center py-20">Loading...</div>
        ) : traders.length > 0 ? (
          traders.slice(0, 5).map((trader, index) => (
            <div
              key={trader.address}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
              title={`Trader ${trader.address}: ${trader.side.toUpperCase()} ${trader.leverage}x position with ${trader.pnl >= 0 ? '+' : ''}$${(trader.pnl / 1000).toFixed(1)}K P&L (${trader.roi >= 0 ? '+' : ''}${trader.roi.toFixed(1)}% ROI)`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black' :
                  'bg-white/5 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/60 font-mono text-xs truncate mb-2">{trader.address}</div>
                  <div className={`badge ${trader.side === 'long' ? 'badge-success' : 'badge-danger'}`}>
                    {trader.side.toUpperCase()} {trader.leverage}x
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1" title="Profit & Loss - total dollar gain or loss on this position">P&L</div>
                  <div className={`text-2xl font-black ${trader.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trader.pnl >= 0 ? '+' : ''}{(trader.pnl / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1" title="Return on Investment - percentage gain or loss relative to position size">ROI</div>
                  <div className={`text-2xl font-black ${trader.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-20">No positions available</div>
        )}
      </div>
    </div>
  );
}
