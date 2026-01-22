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

  const copyAddressAndOpenGodMode = (address: string, chain: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
    openTokenGodMode(address, chain);
  };

  const openTokenGodMode = (address: string, chain: string) => {
    const chainMap: Record<string, string> = {
      ethereum: 'ethereum',
      base: 'base',
      polygon: 'polygon',
      arbitrum: 'arbitrum',
      optimism: 'optimism',
    };
    const nansenChain = chainMap[chain.toLowerCase()] || 'ethereum';
    window.open(`https://app.nansen.ai/token/${address}?chain=${nansenChain}`, '_blank');
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
    <div className="rounded-2xl p-6 h-full flex flex-col shadow-2xl backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 25, 40, 0.7) 0%, rgba(10, 20, 32, 0.8) 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white/90 mb-1">Top Tokens</h3>
          <p className="text-xs text-gray-500">Highest inflows</p>
        </div>
        <Tooltip text="Tokens with highest net inflow from smart money." />
      </div>

      <div className="overflow-y-auto flex-1 -mx-2">
        {tokens.length === 0 ? (
          <div className="text-slate-400 text-center py-12 text-sm">No tokens data available</div>
        ) : (
          <div className="space-y-2">
            {tokens.map((token, index) => (
              <div
                key={`${token.address}-${token.chain}`}
                className="group px-4 py-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                onClick={() => openTokenGodMode(token.address, token.chain)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-gray-600 text-xs font-medium w-4">{index + 1}</span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="text-white font-semibold text-sm truncate">{token.symbol}</div>
                      <div className="text-gray-500 text-xs">{formatChain(token.chain)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#00ffa7] font-bold text-base">
                      +{formatValue(token.netInflow)}
                    </div>
                  </div>
                </div>
                <div
                  className="text-gray-600 hover:text-gray-400 text-xs font-mono truncate cursor-pointer transition-colors pl-7"
                  onClick={(e) => copyAddressAndOpenGodMode(token.address, token.chain, e)}
                >
                  {token.address}
                  {copiedAddress === token.address && (
                    <span className="ml-2 text-[#00ffa7]">Copied!</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
