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
    <div className="bg-[#0a1420]/80 backdrop-blur-sm rounded-3xl p-8 border border-white/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white/90">Live Trade Feed</h3>
        <Tooltip text="Real-time smart money trades across all platforms." />
      </div>

      <div className="overflow-y-auto flex-1">
        {trades.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No trades data available</div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[1fr_2fr_1fr_1.2fr] gap-6 py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider border-b border-white/10 mb-4">
              <div>Action</div>
              <div>Token</div>
              <div>Time</div>
              <div className="text-right">Value</div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {trades.map((trade, index) => (
                <div
                  key={`${trade.timestamp}-${index}`}
                  className="grid grid-cols-[1fr_2fr_1fr_1.2fr] gap-6 items-center py-5 px-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <span
                    className={`font-semibold text-sm ${
                      trade.action === 'buy' || trade.action === 'long'
                        ? 'text-[#00ffa7]'
                        : 'text-[#ff4444]'
                    }`}
                  >
                    {getActionText(trade.action, trade.type)}
                  </span>
                  <div className="text-white font-medium overflow-hidden text-ellipsis">{trade.tokenSymbol}</div>
                  <div className="text-white/40 text-sm">{formatTimeAgo(trade.timestamp)}</div>
                  <div className="text-white font-semibold text-right">{formatValue(trade.valueUsd)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
