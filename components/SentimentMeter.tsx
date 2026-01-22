'use client';

interface SentimentMeterProps {
  sentiment: string;
  score: number;
  buyRatio: number;
}

export default function SentimentMeter({ sentiment, score, buyRatio }: SentimentMeterProps) {
  const percentage = ((score + 100) / 200) * 100;

  const getColor = () => {
    if (sentiment === 'bullish') return '#00E2B3';
    if (sentiment === 'bearish') return '#EF4444';
    return '#FCD34D';
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center float">
      {/* Outer Glow Ring */}
      <div className="relative pulse-glow rounded-full" style={{ padding: '8px' }}>
        {/* Circular Progress */}
        <div className="relative w-80 h-80">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Outer decorative ring */}
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="rgba(0, 226, 179, 0.1)"
              strokeWidth="1"
            />
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="16"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 5.34} 534`}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 30px ${color}80)`,
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={sentiment === 'bullish' ? '#3298DA' : color} />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content with glass effect */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="premium-card rounded-full p-8 shimmer">
              <div
                className="text-8xl font-black mb-1 neon-text"
                style={{ color }}
              >
                {buyRatio}%
              </div>
              <div className="text-white/50 text-xs uppercase tracking-widest text-center font-medium">
                Buy Ratio
              </div>
              <div
                className="text-3xl font-bold mt-4 uppercase tracking-wider text-center neon-text"
                style={{ color }}
              >
                {sentiment}
              </div>
            </div>
          </div>

          {/* Decorative particles */}
          <div className="absolute top-0 right-0 w-2 h-2 rounded-full neon-glow" style={{ background: color }}></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 rounded-full neon-glow" style={{ background: color }}></div>
        </div>
      </div>

      {/* Score indicator */}
      <div className="mt-10 flex items-center gap-4">
        <div className="text-white/30 text-xs font-semibold uppercase tracking-wider">Bearish</div>
        <div className="relative w-72 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full rounded-full transition-all duration-1000 neon-glow"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, #EF4444 0%, #FCD34D 50%, #00E2B3 100%)`,
            }}
          />
        </div>
        <div className="text-white/30 text-xs font-semibold uppercase tracking-wider">Bullish</div>
      </div>
    </div>
  );
}
