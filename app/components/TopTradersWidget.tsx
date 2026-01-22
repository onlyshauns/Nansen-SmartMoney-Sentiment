'use client';

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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Top Traders</h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {traders.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No traders data available</div>
        ) : (
          traders.map((trader, index) => (
            <div
              key={trader.address}
              className="p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xl">{getRankIcon(index)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate">
                      {truncateAddress(trader.address, trader.label)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {trader.tradeCount} trades · {trader.tokensTraded.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-white font-bold">{formatValue(trader.totalVolume)}</div>
                  <div
                    className={`text-xs font-semibold ${
                      trader.dominantSide === 'long'
                        ? 'text-emerald-400'
                        : trader.dominantSide === 'short'
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {trader.dominantSide === 'long' && '↗ Long'}
                    {trader.dominantSide === 'short' && '↘ Short'}
                    {trader.dominantSide === 'neutral' && '↔ Mixed'}
                  </div>
                </div>
              </div>

              {/* Long/Short ratio bar */}
              <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-emerald-500"
                  style={{ width: `${trader.longRatio}%` }}
                />
                <div
                  className="absolute right-0 top-0 h-full bg-red-500"
                  style={{ width: `${trader.shortRatio}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{trader.longRatio}% Long</span>
                <span>{trader.shortRatio}% Short</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
