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
    <div className="bg-[#0a1420] rounded-3xl p-6 border-2 border-[#00ffa7]/20 h-full flex flex-col transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#00ffa7]/30 hover:border-[#00ffa7]/50 shadow-lg shadow-[#00ffa7]/10">
      <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-[#00ffa7]/10">
        <h3 className="text-xl font-bold text-white tracking-tight">Live Trade Feed</h3>
        <Tooltip text="Real-time feed of smart money trades across DEX platforms and Hyperliquid perpetuals. Shows most recent trades first." />
      </div>

      <div className="space-y-4 overflow-y-auto flex-1 pr-2" style={{ scrollbarGutter: 'stable' }}>
        {trades.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No trades data available</div>
        ) : (
          trades.map((trade, index) => (
            <div
              key={`${trade.timestamp}-${index}`}
              className="flex items-center gap-3 p-4 rounded-xl bg-[#061019]/50 hover:bg-[#0d1a2a] transition-all duration-200 hover:scale-[1.01] hover:shadow-md hover:shadow-[#00ffa7]/20 border border-[#00ffa7]/5 hover:border-[#00ffa7]/20 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span className="text-xl">{getActionIcon(trade.action)}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`font-bold text-sm ${
                      trade.action === 'buy' || trade.action === 'long'
                        ? 'text-[#00ffa7]'
                        : 'text-[#ff4444]'
                    }`}
                  >
                    {getActionText(trade.action, trade.type)}
                  </span>
                  <span className="font-bold text-white text-base">{trade.tokenSymbol}</span>
                  {trade.chain && (
                    <span className="text-xs px-2 py-1 rounded-md bg-[#00ffa7]/15 text-[#00ffa7] font-semibold">
                      {formatChain(trade.chain)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {formatTimeAgo(trade.timestamp)}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-white text-base">{formatValue(trade.valueUsd)}</div>
                <div className="text-xs text-gray-500">value</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
