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
    <div className="relative overflow-hidden rounded-2xl p-6 bg-[#0a1420] border border-[#00ffa7]/20">
      <div className="flex items-center justify-between">
        {/* Left: Animal Icon + Sentiment */}
        <div className="flex items-center gap-6">
          <div className="text-8xl">
            {isBullish ? '🐂' : isBearish ? '🐻' : '😐'}
          </div>
          <div>
            <h2
              className="text-5xl font-bold tracking-tight"
              style={{
                color: isBullish ? '#00ffa7' : isBearish ? '#ff4444' : '#888',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {sentiment.toUpperCase()}
            </h2>
            <p className="text-gray-400 text-sm mt-1">Smart Money Sentiment</p>
          </div>
        </div>

        {/* Right: Stats Grid */}
        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00ffa7]">{longCount}</div>
            <div className="text-gray-400 text-xs">LONG</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#ff4444]">{shortCount}</div>
            <div className="text-gray-400 text-xs">SHORT</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{totalPositions}</div>
            <div className="text-gray-400 text-xs">TOTAL</div>
          </div>
        </div>
      </div>

      {/* Long/Short ratio bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Long {longRatio}%</span>
          <span>Short {shortRatio}%</span>
        </div>
        <div className="relative h-3 bg-[#061019] rounded-full overflow-hidden">
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
