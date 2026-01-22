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
  const isNeutral = sentiment === 'neutral';

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl p-12
        transition-all duration-700
        ${isBullish ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : ''}
        ${isBearish ? 'bg-gradient-to-br from-red-600 to-red-800' : ''}
        ${isNeutral ? 'bg-gradient-to-br from-slate-700 to-slate-900' : ''}
      `}
    >
      {/* Subtle glow effect */}
      <div
        className={`
          absolute inset-0 opacity-30
          ${isBullish ? 'bg-gradient-to-t from-emerald-400/20 to-transparent' : ''}
          ${isBearish ? 'bg-gradient-to-t from-red-400/20 to-transparent' : ''}
          ${isNeutral ? 'bg-gradient-to-t from-slate-400/20 to-transparent' : ''}
        `}
      />

      <div className="relative z-10">
        {/* Main sentiment text */}
        <div className="text-center mb-8">
          <h2 className="text-6xl font-extrabold text-white mb-2 tracking-tight">
            {sentiment.toUpperCase()}
          </h2>
          <p className="text-white/80 text-lg">
            Smart Money Sentiment
          </p>
        </div>

        {/* Long/Short ratio bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex justify-between text-white font-semibold mb-3">
            <span>Long {longRatio}%</span>
            <span>Short {shortRatio}%</span>
          </div>

          <div className="relative h-8 bg-black/20 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-emerald-400 transition-all duration-700"
              style={{ width: `${longRatio}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-red-400 transition-all duration-700"
              style={{ width: `${shortRatio}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 text-white">
          <div className="text-center">
            <div className="text-3xl font-bold">{longCount}</div>
            <div className="text-white/70 text-sm">Long Positions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{shortCount}</div>
            <div className="text-white/70 text-sm">Short Positions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totalPositions}</div>
            <div className="text-white/70 text-sm">Total Positions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
