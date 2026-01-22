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
    <div className="bg-[#0a1420]/80 backdrop-blur-sm rounded-3xl p-10 border border-white/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-semibold text-white/90">Top Tokens Bought</h3>
        <Tooltip text="Tokens with highest net inflow from smart money." />
      </div>

      <div className="overflow-y-auto flex-1">
        {tokens.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No tokens data available</div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[1fr_1.5fr_2fr_1fr] gap-4 py-3 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider border-b border-white/10 mb-3">
              <div>Chain</div>
              <div>Token</div>
              <div>Contract Address</div>
              <div className="text-right">Inflows</div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={`${token.address}-${token.chain}`}
                  className="grid grid-cols-[1fr_1.5fr_2fr_1fr] gap-4 items-center py-4 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => copyAddress(token.address)}
                >
                  <div className="text-white/60 text-sm">{formatChain(token.chain)}</div>
                  <div className="text-white font-medium">{token.symbol}</div>
                  <div className="text-white/40 text-xs font-mono truncate">
                    {token.address}
                    {copiedAddress === token.address && (
                      <span className="ml-2 text-[#00ffa7] text-xs">Copied!</span>
                    )}
                  </div>
                  <div className="text-[#00ffa7] font-semibold text-right">
                    +{formatValue(token.netInflow)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
