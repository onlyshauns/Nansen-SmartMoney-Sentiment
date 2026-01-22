'use client';

interface SentimentHeroProps {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  longRatio: number;
  shortRatio: number;
  totalPositions: number;
  longCount: number;
  shortCount: number;
}

export default function SentimentHero({
  sentiment,
  longRatio,
  shortRatio,
  totalPositions,
  longCount,
  shortCount,
}: SentimentHeroProps) {
  const isBullish = sentiment === 'bullish';
  const isBearish = sentiment === 'bearish';

  return (
    <div className="rounded-xl p-8 bg-white/[0.02] border border-white/[0.05]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{isBullish ? '🐂' : isBearish ? '🐻' : '😐'}</div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Market Sentiment</div>
            <div
              className="text-3xl font-bold"
              style={{ color: isBullish ? '#00ffa7' : isBearish ? '#ff4444' : '#888' }}
            >
              {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
            </div>
          </div>
        </div>

        <div className="flex gap-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#00ffa7] mb-1">{longCount}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Long</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#ff4444] mb-1">{shortCount}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Short</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">{totalPositions}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Total</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Long {longRatio}%</span>
          <span>Short {shortRatio}%</span>
        </div>
        <div className="relative h-2 bg-white/[0.03] rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-[#00ffa7] transition-all duration-700"
            style={{ width: `${longRatio}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-[#ff4444] transition-all duration-700"
            style={{ width: `${shortRatio}%` }}
          />
        </div>
      </div>
    </div>
  );
}
