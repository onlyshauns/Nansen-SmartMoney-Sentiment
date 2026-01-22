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

  const glowRgba = isBullish ? 'rgba(0, 255, 167, 0.8)' : isBearish ? 'rgba(255, 68, 68, 0.8)' : 'rgba(136, 136, 136, 0.3)';
  const bgGradient = isBullish
    ? 'from-[#00ffa7]/5 to-[#00ffa7]/0'
    : isBearish
    ? 'from-[#ff4444]/5 to-[#ff4444]/0'
    : 'from-gray-500/5 to-gray-500/0';

  return (
    <div className={`relative overflow-hidden rounded-2xl p-16 bg-gradient-to-br ${bgGradient} backdrop-blur-xl shadow-2xl`}
      style={{
        background: `linear-gradient(135deg, ${isBullish ? 'rgba(0, 255, 167, 0.08)' : 'rgba(255, 68, 68, 0.08)'} 0%, rgba(10, 20, 32, 0.4) 100%)`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Animal Icon - Large Emoji */}
        <div className="mb-6 text-[120px] leading-none" style={{ filter: `drop-shadow(0 0 60px ${glowRgba}) drop-shadow(0 0 30px ${glowRgba})` }}>
          {isBullish ? '🐂' : isBearish ? '🐻' : '😐'}
        </div>

        {/* Large Sentiment Text */}
        <h2
          className="text-6xl font-bold tracking-tight mb-2"
          style={{
            color: isBullish ? '#00ffa7' : isBearish ? '#ff4444' : '#888',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {sentiment.toUpperCase()}
        </h2>

        <p className="text-gray-400 text-sm mb-12 uppercase tracking-wide">Smart Money Sentiment</p>

        {/* Stats Row */}
        <div className="flex gap-16 mb-10">
          <div className="text-center">
            <div className="text-5xl font-bold text-[#00ffa7] mb-2">{longCount}</div>
            <div className="text-gray-500 text-xs uppercase tracking-widest">Long</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-[#ff4444] mb-2">{shortCount}</div>
            <div className="text-gray-500 text-xs uppercase tracking-widest">Short</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">{totalPositions}</div>
            <div className="text-gray-500 text-xs uppercase tracking-widest">Total</div>
          </div>
        </div>

        {/* Long/Short ratio bar */}
        <div className="w-full max-w-3xl">
          <div className="flex justify-between text-sm text-gray-500 mb-3 font-medium">
            <span>Long {longRatio}%</span>
            <span>Short {shortRatio}%</span>
          </div>
          <div className="relative h-3 bg-gray-900/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00ffa7] to-[#00ffa7]/80 transition-all duration-700"
              style={{ width: `${longRatio}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-[#ff4444] to-[#ff4444]/80 transition-all duration-700"
              style={{ width: `${shortRatio}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
