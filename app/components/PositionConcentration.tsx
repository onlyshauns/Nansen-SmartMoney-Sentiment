'use client';

interface Token {
  symbol: string;
  netInflow?: number;
  netOutflow?: number;
}

interface PositionConcentrationProps {
  inflowTokens: Token[];
  outflowTokens: Token[];
}

export default function PositionConcentration({
  inflowTokens,
  outflowTokens,
}: PositionConcentrationProps) {
  const formatValue = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (abs >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const topLongs = inflowTokens
    .filter(t => t.netInflow && t.netInflow > 0)
    .sort((a, b) => (b.netInflow || 0) - (a.netInflow || 0))
    .slice(0, 3);

  const topShorts = outflowTokens
    .filter(t => t.netOutflow && t.netOutflow > 0)
    .sort((a, b) => (b.netOutflow || 0) - (a.netOutflow || 0))
    .slice(0, 3);

  return (
    <div className="bg-[#1A1F2E] rounded-2xl p-5 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#EAEFF9]">Position Concentration</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Where smart money is positioned</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Long Concentration */}
        <div>
          <div className="text-xs font-semibold text-[#30E000] uppercase tracking-wide mb-2">
            Top Long Flows
          </div>
          <div className="space-y-2">
            {topLongs.length > 0 ? (
              topLongs.map((token, idx) => (
                <div key={token.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#64748B] w-3">{idx + 1}</span>
                    <span className="text-sm font-semibold text-[#EAEFF9]">{token.symbol}</span>
                  </div>
                  <span className="text-xs font-bold text-[#30E000] tabular-nums">
                    +{formatValue(token.netInflow || 0)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#64748B]">No data</div>
            )}
          </div>
        </div>

        {/* Short Concentration */}
        <div>
          <div className="text-xs font-semibold text-[#FF494A] uppercase tracking-wide mb-2">
            Top Short Flows
          </div>
          <div className="space-y-2">
            {topShorts.length > 0 ? (
              topShorts.map((token, idx) => (
                <div key={token.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#64748B] w-3">{idx + 1}</span>
                    <span className="text-sm font-semibold text-[#EAEFF9]">{token.symbol}</span>
                  </div>
                  <span className="text-xs font-bold text-[#FF494A] tabular-nums">
                    -{formatValue(token.netOutflow || 0)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#64748B]">No data</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#2D334D] text-[10px] text-[#64748B]">
        Shows top 3 tokens by net flow in each direction
      </div>
    </div>
  );
}
