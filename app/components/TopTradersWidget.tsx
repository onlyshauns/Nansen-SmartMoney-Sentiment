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
    <div className="rounded-xl p-6 bg-white/[0.02] border border-white/[0.05] h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-white mb-0.5">Top Traders</h3>
          <p className="text-xs text-gray-600">By trading volume</p>
        </div>
        <Tooltip text="Most active Hyperliquid traders by volume." />
      </div>

      <div className="overflow-y-auto flex-1">
        {traders.length === 0 ? (
          <div className="text-gray-500 text-center py-12 text-sm">No traders data available</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left pb-3 text-xs font-medium text-gray-600 uppercase tracking-wider">#</th>
                <th className="text-left pb-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Trader</th>
                <th className="text-right pb-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Volume</th>
                <th className="text-right pb-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Long/Short</th>
              </tr>
            </thead>
            <tbody>
              {traders.map((trader, index) => (
                <tr
                  key={trader.address}
                  className="hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => openWalletProfiler(trader.address)}
                >
                  <td className="py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="py-4">
                    <div className="text-sm text-white font-medium">
                      {truncateAddress(trader.address, trader.label)}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{trader.tradeCount} trades</div>
                  </td>
                  <td className="py-4 text-sm text-white font-semibold text-right tabular-nums">
                    {formatValue(trader.totalVolume)}
                  </td>
                  <td className="py-4 text-right">
                    <div
                      className={`text-sm font-medium tabular-nums ${
                        trader.dominantSide === 'long'
                          ? 'text-[#00ffa7]'
                          : trader.dominantSide === 'short'
                          ? 'text-[#ff4444]'
                          : 'text-gray-500'
                      }`}
                    >
                      {trader.longRatio}% / {trader.shortRatio}%
                    </div>
                    <div className="relative h-1 bg-white/[0.03] rounded-full overflow-hidden mt-2">
                      <div
                        className="absolute left-0 top-0 h-full bg-[#00ffa7]"
                        style={{ width: `${trader.longRatio}%` }}
                      />
                      <div
                        className="absolute right-0 top-0 h-full bg-[#ff4444]"
                        style={{ width: `${trader.shortRatio}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
