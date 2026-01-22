'use client';

import { useState } from 'react';
import Tooltip from './Tooltip';

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
    <div className="bg-[#0a1420] rounded-2xl p-5 border border-[#00ffa7]/20 h-full flex flex-col transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#00ffa7]/30 hover:border-[#00ffa7]/50 shadow-md shadow-[#00ffa7]/5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#00ffa7]/20">
        <h3 className="text-lg font-bold text-white">Top Tokens Bought</h3>
        <Tooltip text="Shows tokens with the highest net inflow from smart money wallets. Net inflow = total buy volume minus total sell volume across all chains." />
      </div>

      <div className="space-y-3 overflow-y-auto flex-1">
        {tokens.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No tokens data available</div>
        ) : (
          tokens.map((token, index) => (
            <div
              key={`${token.address}-${token.chain}`}
              className="flex items-center justify-between p-3 rounded-lg bg-[#061019] hover:bg-[#0d1a2a] transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:shadow-[#00ffa7]/20 group cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="text-[#00ffa7] font-bold text-sm w-6">#{index + 1}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white text-sm">{token.symbol}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#00ffa7]/10 text-[#00ffa7]">
                      {formatChain(token.chain)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {token.buyCount}↑ · {token.sellCount}↓
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[#00ffa7] font-bold text-sm">
                    +{formatValue(token.netInflow)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
