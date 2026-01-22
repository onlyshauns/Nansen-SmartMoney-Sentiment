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

      <div className="space-y-3 overflow-y-auto flex-1">
        {trades.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No trades data available</div>
        ) : (
          trades.map((trade, index) => (
            <div
              key={`${trade.timestamp}-${index}`}
              className="flex items-center justify-between py-4 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <span
                  className={`font-semibold text-sm ${
                    trade.action === 'buy' || trade.action === 'long'
                      ? 'text-[#00ffa7]'
                      : 'text-[#ff4444]'
                  }`}
                >
                  {getActionText(trade.action, trade.type)}
                </span>
                <div className="flex-1">
                  <div className="text-white font-medium">{trade.tokenSymbol}</div>
                  <div className="text-white/40 text-sm">{formatTimeAgo(trade.timestamp)}</div>
                </div>
                {trade.chain && (
                  <span className="text-white/40 text-sm">{formatChain(trade.chain)}</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{formatValue(trade.valueUsd)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
