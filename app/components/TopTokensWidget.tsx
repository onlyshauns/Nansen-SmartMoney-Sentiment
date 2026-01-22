'use client';

import { useState } from 'react';

interface Token {
  symbol: string;
  address: string;
  chain: string;
  netInflow: number;
  buyCount: number;
  sellCount: number;
}

interface TopTokensWidgetProps {
  tokens: Token[];
}

export default function TopTokensWidget({ tokens }: TopTokensWidgetProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatChain = (chain: string) => {
    const chainMap: Record<string, string> = {
      ethereum: 'ETH',
      base: 'BASE',
      polygon: 'POLY',
      arbitrum: 'ARB',
      optimism: 'OP',
    };
    return chainMap[chain.toLowerCase()] || chain.toUpperCase();
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

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Top Tokens Bought</h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tokens.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No tokens data available</div>
        ) : (
          tokens.map((token, index) => (
            <div
              key={`${token.address}-${token.chain}`}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-emerald-400 font-bold text-lg w-8">#{index + 1}</div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{token.symbol}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {formatChain(token.chain)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {token.buyCount} buys · {token.sellCount} sells
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-emerald-400 font-bold">
                    +{formatValue(token.netInflow)}
                  </div>
                  <div className="text-xs text-slate-400">net inflow</div>
                </div>

                <button
                  onClick={() => copyAddress(token.address)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-2 hover:bg-slate-800 rounded"
                  title="Copy address"
                >
                  {copiedAddress === token.address ? (
                    <span className="text-xs text-emerald-400">✓</span>
                  ) : (
                    <span className="text-xs text-slate-400">📋</span>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
