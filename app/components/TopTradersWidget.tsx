'use client';

import Tooltip from './Tooltip';

interface Trader {
  address: string;
  label: string;
  totalVolume: number;
  longVolume: number;
  shortVolume: number;
  tradeCount: number;
  dominantSide: 'long' | 'short' | 'neutral';
  tokensTraded: string[];
  longRatio: number;
  shortRatio: number;
}

interface TopTradersWidgetProps {
  traders: Trader[];
}

export default function TopTradersWidget({ traders }: TopTradersWidgetProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const truncateAddress = (address: string, label?: string) => {
    if (label && label !== address) {
      return label;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-[#0a1420]/80 backdrop-blur-sm rounded-3xl p-8 border border-white/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white/90">Top Traders</h3>
        <Tooltip text="Shows the most active smart money traders on Hyperliquid ranked by total trading volume. The bar shows their long/short ratio." />
      </div>

      <div className="space-y-0 overflow-y-auto flex-1">
        {traders.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No traders data available</div>
        ) : (
          traders.map((trader, index) => (
            <div
              key={trader.address}
              className="py-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-white/40 text-sm font-medium w-6">{index + 1}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium truncate">
                      {truncateAddress(trader.address, trader.label)}
                    </div>
                    <div className="text-white/40 text-sm">{trader.tradeCount} trades</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{formatValue(trader.totalVolume)}</div>
                  <div
                    className={`text-sm ${
                      trader.dominantSide === 'long'
                        ? 'text-[#00ffa7]'
                        : trader.dominantSide === 'short'
                        ? 'text-[#ff4444]'
                        : 'text-white/40'
                    }`}
                  >
                    {trader.longRatio}% / {trader.shortRatio}%
                  </div>
                </div>
              </div>
              <div className="relative h-1 bg-white/5 rounded-full overflow-hidden ml-10">
                <div
                  className="absolute left-0 top-0 h-full bg-[#00ffa7]"
                  style={{ width: `${trader.longRatio}%` }}
                />
                <div
                  className="absolute right-0 top-0 h-full bg-[#ff4444]"
                  style={{ width: `${trader.shortRatio}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
