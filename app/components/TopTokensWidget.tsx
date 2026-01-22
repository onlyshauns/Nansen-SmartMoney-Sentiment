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
    <div className="bg-[#0a1420]/80 backdrop-blur-sm rounded-3xl p-8 border border-white/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white/90">Top Tokens Bought</h3>
        <Tooltip text="Shows tokens with the highest net inflow from smart money wallets. Net inflow = total buy volume minus total sell volume across all chains." />
      </div>

      <div className="space-y-3 overflow-y-auto flex-1">
        {tokens.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No tokens data available</div>
        ) : (
          tokens.map((token, index) => (
            <div
              key={`${token.address}-${token.chain}`}
              className="flex items-center justify-between py-4 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-white/40 text-sm font-medium w-6">{index + 1}</span>
                <div className="flex-1">
                  <div className="text-white font-medium">{token.symbol}</div>
                  <div className="text-white/40 text-sm">{formatChain(token.chain)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#00ffa7] font-semibold">
                  +{formatValue(token.netInflow)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
