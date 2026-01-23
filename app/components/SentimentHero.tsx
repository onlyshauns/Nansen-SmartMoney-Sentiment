'use client';

interface SentimentHeroProps {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  longRatio: number;
  shortRatio: number;
  estimatedLongValue?: number;
  estimatedShortValue?: number;
  totalOpenInterestUsd?: number;
  finalScore?: number; // -1 to +1
}

export default function SentimentHero({
  sentiment,
  longRatio,
  shortRatio,
  estimatedLongValue,
  estimatedShortValue,
  totalOpenInterestUsd,
  finalScore = 0,
}: SentimentHeroProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const isBullish = sentiment === 'bullish';
  const isBearish = sentiment === 'bearish';

  // Get emoji based on sentiment
  const getEmoji = () => {
    if (isBullish) return '🐂';
    if (isBearish) return '🐻';
    return '😐';
  };

  // Calculate marker position (0-100%)
  const markerPosition = ((finalScore + 1) / 2) * 100;

  return (
    <div className="bg-[#1C2130] rounded-2xl p-3 h-full flex flex-col">
      {/* Centered emoji and title */}
      <div className="text-center mb-2">
        <div className="text-[40px] leading-none mb-0.5">
          {getEmoji()}
        </div>
        <div className="text-lg font-black text-[#EAEFF9] tracking-tight">
          {sentiment.toUpperCase()}
        </div>
        <div className="text-[10px] text-[#64748B]">
          Smart Money Sentiment
        </div>
      </div>

      {/* Sentiment Spectrum Bar */}
      <div className="mb-2">
        <div className="relative h-2 bg-gradient-to-r from-[#FF494A] via-[#64748B] to-[#30E000] rounded-full">
          {/* Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-[#EAEFF9] rounded-full border-2 border-[#1C2130] shadow-lg"
            style={{ left: `${markerPosition}%` }}
          />
        </div>
        {/* Labels */}
        <div className="flex justify-between mt-2 text-xs text-[#64748B]">
          <span>Bearish</span>
          <span className="text-[#EAEFF9] font-semibold">
            {finalScore > 0 ? '+' : ''}{(finalScore * 100).toFixed(0)}
          </span>
          <span>Bullish</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] text-[#64748B] uppercase tracking-wide">Long</div>
          <div className="text-sm font-bold text-[#30E000] tabular-nums">{longRatio}%</div>
        </div>
        <div>
          <div className="text-[10px] text-[#64748B] uppercase tracking-wide">Total OI</div>
          <div className="text-sm font-bold text-[#EAEFF9] tabular-nums">
            {totalOpenInterestUsd ? formatValue(totalOpenInterestUsd) : '-'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[#64748B] uppercase tracking-wide">Short</div>
          <div className="text-sm font-bold text-[#FF494A] tabular-nums">{shortRatio}%</div>
        </div>
      </div>
    </div>
  );
}
