'use client';

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
    <div className="bg-[#0a1420] rounded-2xl p-4 border border-[#00ffa7]/20 h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-3 pb-2 border-b border-[#00ffa7]/20">Live Trade Feed</h3>

      <div className="space-y-1.5 overflow-y-auto flex-1">
        {trades.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No trades data available</div>
        ) : (
          trades.map((trade, index) => (
            <div
              key={`${trade.timestamp}-${index}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#061019] hover:bg-[#0d1a2a] transition-all"
            >
              <span className="text-base">{getActionIcon(trade.action)}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold text-xs ${
                      trade.action === 'buy' || trade.action === 'long'
                        ? 'text-[#00ffa7]'
                        : 'text-[#ff4444]'
                    }`}
                  >
                    {getActionText(trade.action, trade.type)}
                  </span>
                  <span className="font-semibold text-white text-sm">{trade.tokenSymbol}</span>
                  {trade.chain && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#00ffa7]/10 text-[#00ffa7]">
                      {formatChain(trade.chain)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {formatTimeAgo(trade.timestamp)}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-white text-sm">{formatValue(trade.valueUsd)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
