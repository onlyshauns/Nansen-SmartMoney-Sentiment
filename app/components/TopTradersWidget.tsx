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
  const openWalletProfiler = (address: string) => {
    window.open(`https://app.nansen.ai/wallet-profiler?address=${address}`, '_blank');
  };

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
    <div className="rounded-2xl p-6 h-full flex flex-col shadow-2xl backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 25, 40, 0.7) 0%, rgba(10, 20, 32, 0.8) 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white/90 mb-1">Top Traders</h3>
          <p className="text-xs text-gray-500">By volume</p>
        </div>
        <Tooltip text="Most active Hyperliquid traders by volume." />
      </div>

      <div className="overflow-y-auto flex-1 -mx-2">
        {traders.length === 0 ? (
          <div className="text-slate-400 text-center py-12 text-sm">No traders data available</div>
        ) : (
          <div className="space-y-2">
            {traders.map((trader, index) => (
              <div
                key={trader.address}
                className="group px-4 py-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                onClick={() => openWalletProfiler(trader.address)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-gray-600 text-xs font-medium w-4">{index + 1}</span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="text-white font-semibold text-sm truncate">
                        {truncateAddress(trader.address, trader.label)}
                      </div>
                      <div className="text-gray-500 text-xs">{trader.tradeCount} trades</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-base mb-1">
                      {formatValue(trader.totalVolume)}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        trader.dominantSide === 'long'
                          ? 'text-[#00ffa7]'
                          : trader.dominantSide === 'short'
                          ? 'text-[#ff4444]'
                          : 'text-gray-500'
                      }`}
                    >
                      {trader.longRatio}% / {trader.shortRatio}%
                    </div>
                  </div>
                </div>
                <div className="relative h-1.5 bg-gray-900/50 rounded-full overflow-hidden pl-7">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00ffa7] to-[#00ffa7]/70 transition-all"
                    style={{ width: `${trader.longRatio}%` }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-[#ff4444] to-[#ff4444]/70 transition-all"
                    style={{ width: `${trader.shortRatio}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
