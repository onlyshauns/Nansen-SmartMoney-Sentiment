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

  // Simple SVG silhouettes for bull and bear
  const BullIcon = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <path d="M30 40 L35 30 L40 40 M80 40 L85 30 L90 40 M20 50 Q25 45 35 48 L85 48 Q95 45 100 50 L95 70 Q90 90 60 95 Q30 90 25 70 Z"
            fill="#00ffa7" opacity="0.3" stroke="#00ffa7" strokeWidth="2"/>
    </svg>
  );

  const BearIcon = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="35" cy="35" r="8" fill="#ff4444" opacity="0.3" stroke="#ff4444" strokeWidth="2"/>
      <circle cx="85" cy="35" r="8" fill="#ff4444" opacity="0.3" stroke="#ff4444" strokeWidth="2"/>
      <path d="M25 50 Q30 45 40 48 L80 48 Q90 45 95 50 L90 75 Q85 95 60 98 Q35 95 30 75 Z"
            fill="#ff4444" opacity="0.3" stroke="#ff4444" strokeWidth="2"/>
    </svg>
  );

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 bg-[#0a1420] border border-[#00ffa7]/20">
      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Animal Icon */}
        <div className="mb-4">
          {isBullish ? <BullIcon /> : isBearish ? <BearIcon /> : <div className="w-[120px] h-[120px]" />}
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
