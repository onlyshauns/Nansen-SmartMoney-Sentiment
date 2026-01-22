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
    <div className="bg-[#0a1420] rounded-3xl p-6 border-2 border-[#00ffa7]/20 h-full flex flex-col transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#00ffa7]/30 hover:border-[#00ffa7]/50 shadow-lg shadow-[#00ffa7]/10">
      <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-[#00ffa7]/10">
        <h3 className="text-xl font-bold text-white tracking-tight">Top Traders</h3>
        <Tooltip text="Shows the most active smart money traders on Hyperliquid ranked by total trading volume. The bar shows their long/short ratio." />
      </div>

      <div className="space-y-4 overflow-y-auto flex-1 pr-2" style={{ scrollbarGutter: 'stable' }}>
        {traders.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No traders data available</div>
        ) : (
          traders.map((trader, index) => (
            <div
              key={trader.address}
              className="p-4 rounded-xl bg-[#061019]/50 hover:bg-[#0d1a2a] transition-all duration-200 hover:scale-[1.01] hover:shadow-md hover:shadow-[#00ffa7]/20 border border-[#00ffa7]/5 hover:border-[#00ffa7]/20 cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-base">{getRankIcon(index)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-base truncate">
                      {truncateAddress(trader.address, trader.label)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {trader.tradeCount} trades · {trader.tokensTraded.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-white font-bold text-base">{formatValue(trader.totalVolume)}</div>
                  <div
                    className={`text-xs font-semibold ${
                      trader.dominantSide === 'long'
                        ? 'text-[#00ffa7]'
                        : trader.dominantSide === 'short'
                        ? 'text-[#ff4444]'
                        : 'text-gray-500'
                    }`}
                  >
                    {trader.dominantSide === 'long' && '↗ Long'}
                    {trader.dominantSide === 'short' && '↘ Short'}
                    {trader.dominantSide === 'neutral' && '↔ Mixed'}
                  </div>
                </div>
              </div>

              {/* Long/Short ratio bar */}
              <div className="relative h-2 bg-[#0a1420] rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-[#00ffa7]"
                  style={{ width: `${trader.longRatio}%` }}
                />
                <div
                  className="absolute right-0 top-0 h-full bg-[#ff4444]"
                  style={{ width: `${trader.shortRatio}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                <span>{trader.longRatio}% long</span>
                <span>{trader.shortRatio}% short</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
