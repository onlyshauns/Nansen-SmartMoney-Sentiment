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

  const glowColor = isBullish ? '#00ffa7' : isBearish ? '#ff4444' : '#888';
  const glowRgba = isBullish ? 'rgba(0, 255, 167, 0.6)' : isBearish ? 'rgba(255, 68, 68, 0.6)' : 'rgba(136, 136, 136, 0.3)';

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 bg-[#0a1420] border-2"
      style={{
        borderColor: `${glowColor}66`,
        boxShadow: `0 0 60px ${glowColor}66, 0 0 30px ${glowColor}4d, 0 10px 25px ${glowColor}33`
      }}
    >
      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Animal Icon - Large Emoji */}
        <div className="mb-4 text-[140px] leading-none" style={{ filter: `drop-shadow(0 0 40px ${glowRgba})` }}>
          {isBullish ? '🐂' : isBearish ? '🐻' : '😐'}
        </div>

        {/* Large Sentiment Text */}
        <h2
          className="text-7xl font-bold tracking-tight mb-3"
          style={{
            color: isBullish ? '#00ffa7' : isBearish ? '#ff4444' : '#888',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {sentiment.toUpperCase()}
        </h2>

        <p className="text-gray-400 text-base mb-6">Smart Money Sentiment</p>

        {/* Stats Row */}
        <div className="flex gap-12 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#00ffa7]">{longCount}</div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mt-1">Long</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#ff4444]">{shortCount}</div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mt-1">Short</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{totalPositions}</div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mt-1">Total</div>
          </div>
        </div>

        {/* Long/Short ratio bar */}
        <div className="w-full max-w-2xl">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Long {longRatio}%</span>
            <span>Short {shortRatio}%</span>
          </div>
          <div className="relative h-4 bg-[#061019] rounded-full overflow-hidden">
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
    </div>
  );
}
