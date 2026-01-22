'use client';

import Tooltip from './Tooltip';

interface LiveTrade {
  type: 'dex' | 'perp';
  action: 'buy' | 'sell' | 'long' | 'short';
  tokenSymbol: string;
  valueUsd: number;
  timestamp: string;
  chain?: string;
  traderLabel?: string;
  secondaryToken?: string;
}

interface LiveTradesWidgetProps {
  trades: LiveTrade[];
}

export default function LiveTradesWidget({ trades }: LiveTradesWidgetProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const tradeTime = new Date(timestamp);
    const diffMs = now.getTime() - tradeTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getActionIcon = (action: string) => {
    if (action === 'buy' || action === 'long') return '🟢';
    if (action === 'sell' || action === 'short') return '🔴';
    return '⚪';
  };

  const getActionText = (action: string, type: string) => {
    if (type === 'perp') {
      return action.toUpperCase();
    }
    return action.toUpperCase();
  };

  const formatChain = (chain?: string) => {
    if (!chain) return '';
    const chainMap: Record<string, string> = {
      ethereum: 'ETH',
      base: 'BASE',
      polygon: 'POLY',
      arbitrum: 'ARB',
      optimism: 'OP',
      hyperliquid: 'HYPE',
    };
    return chainMap[chain.toLowerCase()] || chain.toUpperCase();
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
          <h3 className="text-base font-semibold text-white/90 mb-1">Live Trades</h3>
          <p className="text-xs text-gray-500">Recent activity</p>
        </div>
        <Tooltip text="Real-time smart money trades across all platforms." />
      </div>

      <div className="overflow-y-auto flex-1 -mx-2">
        {trades.length === 0 ? (
          <div className="text-slate-400 text-center py-12 text-sm">No trades data available</div>
        ) : (
          <div className="space-y-2">
            {trades.map((trade, index) => (
              <div
                key={`${trade.timestamp}-${index}`}
                className="group px-4 py-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        trade.action === 'buy' || trade.action === 'long'
                          ? 'bg-[#00ffa7]/20 text-[#00ffa7]'
                          : 'bg-[#ff4444]/20 text-[#ff4444]'
                      }`}
                    >
                      {getActionText(trade.action, trade.type)}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="text-white font-semibold text-sm truncate">{trade.tokenSymbol}</div>
                      <div className="text-gray-500 text-xs">{formatTimeAgo(trade.timestamp)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-base">
                      {formatValue(trade.valueUsd)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
