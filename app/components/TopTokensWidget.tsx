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
    <div className="rounded-xl p-6 bg-white/[0.02] border border-white/[0.05] h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-white mb-0.5">Top Tokens Bought</h3>
          <p className="text-xs text-gray-600">Highest net inflows</p>
        </div>
        <Tooltip text="Tokens with highest net inflow from smart money." />
      </div>

      <div className="overflow-y-auto flex-1">
        {tokens.length === 0 ? (
          <div className="text-gray-500 text-center py-12 text-sm">No tokens data available</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-4 pt-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">#</th>
                <th className="text-left pb-4 pt-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Token</th>
                <th className="text-left pb-4 pt-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Chain</th>
                <th className="text-left pb-4 pt-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Address</th>
                <th className="text-right pb-4 pt-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Inflow</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, index) => (
                <tr
                  key={`${token.address}-${token.chain}`}
                  className="hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => openTokenGodMode(token.address, token.chain)}
                >
                  <td className="py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="py-4 text-sm text-white font-medium">{token.symbol}</td>
                  <td className="py-4 text-sm text-gray-500">{formatChain(token.chain)}</td>
                  <td
                    className="py-4 text-xs text-gray-600 font-mono hover:text-gray-400 transition-colors"
                    onClick={(e) => copyAddressAndOpenGodMode(token.address, token.chain, e)}
                  >
                    <span className="inline-block max-w-[180px] truncate align-bottom">
                      {token.address}
                    </span>
                    {copiedAddress === token.address && (
                      <span className="ml-2 text-[#00ffa7]">Copied!</span>
                    )}
                  </td>
                  <td className="py-4 text-sm text-[#00ffa7] font-semibold text-right tabular-nums">
                    +{formatValue(token.netInflow)}
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
