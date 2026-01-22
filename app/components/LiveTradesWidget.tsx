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
    <div className="rounded-xl p-6 bg-white/[0.02] border border-white/[0.05] h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-white mb-0.5">Live Trade Feed</h3>
          <p className="text-xs text-gray-600">Recent activity</p>
        </div>
        <Tooltip text="Real-time smart money trades across all platforms." />
      </div>

      <div className="overflow-y-auto flex-1">
        {trades.length === 0 ? (
          <div className="text-gray-500 text-center py-12 text-sm">No trades data available</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left pb-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                <th className="text-left pb-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Token</th>
                <th className="text-left pb-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Time</th>
                <th className="text-right pb-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, index) => (
                <tr
                  key={`${trade.timestamp}-${index}`}
                  className="hover:bg-white/[0.02] cursor-pointer"
                >
                  <td className="py-4">
                    <span
                      className={`text-xs font-semibold ${
                        trade.action === 'buy' || trade.action === 'long'
                          ? 'text-[#00ffa7]'
                          : 'text-[#ff4444]'
                      }`}
                    >
                      {getActionText(trade.action, trade.type)}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-white font-medium">{trade.tokenSymbol}</td>
                  <td className="py-4 text-sm text-gray-500">{formatTimeAgo(trade.timestamp)}</td>
                  <td className="py-4 text-sm text-white font-semibold text-right tabular-nums">
                    {formatValue(trade.valueUsd)}
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
