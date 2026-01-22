'use client';

interface SentimentMeterProps {
  sentiment: string;
  score: number;
  buyRatio: number;
}

export default function SentimentMeter({ sentiment, score, buyRatio }: SentimentMeterProps) {
  // Convert score (-100 to 100) to percentage (0 to 100)
  const percentage = ((score + 100) / 200) * 100;

  // Determine color based on sentiment
  const getColor = () => {
    if (sentiment === 'bullish') return '#00E2B3';
    if (sentiment === 'bearish') return '#EF4444';
    return '#FCD34D';
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      {/* Circular Progress */}
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 5.34} 534`}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 20px ${color}80)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-7xl font-bold mb-2"
            style={{ color }}
          >
            {buyRatio}%
          </div>
          <div className="text-white/60 text-sm uppercase tracking-wider">
            Buy Ratio
          </div>
          <div
            className="text-2xl font-bold mt-3 uppercase tracking-wide"
            style={{ color }}
          >
            {sentiment}
          </div>
        </div>
      </div>

      {/* Score indicator */}
      <div className="mt-6 flex items-center gap-3">
        <div className="text-white/40 text-xs">BEARISH</div>
        <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, #EF4444, #FCD34D, #00E2B3)`,
            }}
          />
        </div>
        <div className="text-white/40 text-xs">BULLISH</div>
      </div>
    </div>
  );
}
