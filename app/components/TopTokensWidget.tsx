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
    <div className="bg-[#0a1420] rounded-3xl p-6 border-2 border-[#00ffa7]/20 h-full flex flex-col transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#00ffa7]/30 hover:border-[#00ffa7]/50 shadow-lg shadow-[#00ffa7]/10">
      <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-[#00ffa7]/10">
        <h3 className="text-xl font-bold text-white tracking-tight">Top Tokens Bought</h3>
        <Tooltip text="Shows tokens with the highest net inflow from smart money wallets. Net inflow = total buy volume minus total sell volume across all chains." />
      </div>

      <div className="space-y-4 overflow-y-auto flex-1 pr-2" style={{ scrollbarGutter: 'stable' }}>
        {tokens.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No tokens data available</div>
        ) : (
          tokens.map((token, index) => (
            <div
              key={`${token.address}-${token.chain}`}
              className="flex items-center justify-between p-4 rounded-xl bg-[#061019]/50 hover:bg-[#0d1a2a] transition-all duration-200 hover:scale-[1.01] hover:shadow-md hover:shadow-[#00ffa7]/20 border border-[#00ffa7]/5 hover:border-[#00ffa7]/20 group cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-[#00ffa7] font-bold text-base w-8">#{index + 1}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-base">{token.symbol}</span>
                    <span className="text-xs px-2 py-1 rounded-md bg-[#00ffa7]/15 text-[#00ffa7] font-semibold">
                      {formatChain(token.chain)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {token.buyCount} buys · {token.sellCount} sells
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[#00ffa7] font-bold text-base">
                    +{formatValue(token.netInflow)}
                  </div>
                  <div className="text-xs text-gray-500">net flow</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
