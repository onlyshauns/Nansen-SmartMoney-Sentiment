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
    <div className="bg-[#0a1420]/80 backdrop-blur-sm rounded-3xl p-10 border border-white/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-semibold text-white/90">Top Traders</h3>
        <Tooltip text="Most active Hyperliquid traders by volume." />
      </div>

      <div className="overflow-y-auto flex-1">
        {traders.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No traders data available</div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr] gap-6 py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider border-b border-white/10 mb-4">
              <div>Rank</div>
              <div>Trader</div>
              <div className="text-right">Volume</div>
              <div className="text-right">Long/Short</div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {traders.map((trader, index) => (
                <div
                  key={trader.address}
                  className="py-5 px-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openWalletProfiler(trader.address)}
                >
                  <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr] gap-6 items-center mb-2">
                    <span className="text-white/40 text-sm font-medium">{index + 1}</span>
                    <div>
                      <div className="text-white font-medium overflow-hidden text-ellipsis">
                        {truncateAddress(trader.address, trader.label)}
                      </div>
                      <div className="text-white/40 text-xs">{trader.tradeCount} trades</div>
                    </div>
                    <div className="text-white font-semibold text-right">{formatValue(trader.totalVolume)}</div>
                    <div
                      className={`text-sm text-right ${
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
                  <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
