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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Live Trade Feed</h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No trades data available</div>
        ) : (
          trades.map((trade, index) => (
            <div
              key={`${trade.timestamp}-${index}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 transition-all animate-fade-in"
            >
              <span className="text-xl">{getActionIcon(trade.action)}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-sm ${
                      trade.action === 'buy' || trade.action === 'long'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {getActionText(trade.action, trade.type)}
                  </span>
                  <span className="font-bold text-white">{trade.tokenSymbol}</span>
                  {trade.secondaryToken && (
                    <span className="text-slate-400 text-xs">for {trade.secondaryToken}</span>
                  )}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {trade.traderLabel || 'Unknown trader'}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-white text-sm">{formatValue(trade.valueUsd)}</div>
                <div className="text-xs text-slate-400">{formatTimeAgo(trade.timestamp)}</div>
              </div>

              {trade.chain && (
                <div className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                  {formatChain(trade.chain)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
