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
  const isNeutral = sentiment === 'neutral';

  // Get emoji based on sentiment
  const getEmoji = () => {
    if (isBullish) return '🐂';
    if (isBearish) return '🐻';
    return '😐';
  };

  // Get emoji glow style based on sentiment
  const getEmojiGlowStyle = () => {
    if (isBullish) {
      return { filter: 'drop-shadow(0 0 15px rgba(48, 224, 0, 0.8)) drop-shadow(0 0 30px rgba(48, 224, 0, 0.5))' };
    }
    if (isBearish) {
      return { filter: 'drop-shadow(0 0 15px rgba(255, 73, 74, 0.8)) drop-shadow(0 0 30px rgba(255, 73, 74, 0.5))' };
    }
    // Neutral - yellow glow
    return { filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.8)) drop-shadow(0 0 30px rgba(234, 179, 8, 0.5))' };
  };

  // Calculate marker position (0-100%)
  const markerPosition = ((finalScore + 1) / 2) * 100;

  return (
    <div
      style={{
        background: 'rgba(26, 31, 46, 1)',
        borderRadius: '16px',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header section matching table style */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #2D334D', flexShrink: 0 }}>
        <div className="text-center">
          <div className="text-[32px] leading-none mb-0.5" style={getEmojiGlowStyle()}>
            {getEmoji()}
          </div>
          <div className="text-sm font-black text-[#EAEFF9] tracking-tight">
            {sentiment.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Body section */}
      <div style={{ padding: '8px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
        {/* Sentiment Spectrum Bar */}
        <div className="mb-4">
          <div
            style={{
              position: 'relative',
              height: '8px',
              background: 'linear-gradient(to right, #FF494A 0%, #64748B 50%, #30E000 100%)',
              borderRadius: '4px'
            }}
          >
            {/* Marker */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                left: `${markerPosition}%`,
                width: '12px',
                height: '12px',
                background: '#EAEFF9',
                borderRadius: '50%',
                border: '2px solid rgba(26, 31, 46, 1)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            />
          </div>
        </div>

        {/* Long/Short Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[9px] text-[#EAEFF9] uppercase tracking-wide mb-1">Short</div>
            <div className="text-[12px] font-bold text-[#FF494A]">{shortRatio}%</div>
          </div>
          <div>
            <div className="text-[9px] text-[#EAEFF9] uppercase tracking-wide mb-1">Total OI</div>
            <div className="text-[12px] font-bold text-[#EAEFF9]">{formatValue(totalOpenInterestUsd || 0)}</div>
          </div>
          <div>
            <div className="text-[9px] text-[#EAEFF9] uppercase tracking-wide mb-1">Long</div>
            <div className="text-[12px] font-bold text-[#30E000]">{longRatio}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
