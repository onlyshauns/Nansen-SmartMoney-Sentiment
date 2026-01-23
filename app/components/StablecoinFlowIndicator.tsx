'use client';

import Tooltip from './Tooltip';

interface StablecoinFlowData {
  totalStablecoinFlow: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  stablecoins: Array<{
    symbol: string;
    flow: number;
  }>;
}

interface StablecoinFlowIndicatorProps {
  data: StablecoinFlowData | null;
}

export default function StablecoinFlowIndicator({ data }: StablecoinFlowIndicatorProps) {
  if (!data) return null;

  const formatValue = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (abs >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const getSentimentIcon = (sentiment: 'bullish' | 'bearish' | 'neutral') => {
    switch (sentiment) {
      case 'bullish':
        return '📈';
      case 'bearish':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getSentimentText = () => {
    if (data.totalStablecoinFlow > 0) {
      return 'Moving to Safety';
    } else if (data.totalStablecoinFlow < 0) {
      return 'Deploying Capital';
    }
    return 'Neutral Activity';
  };

  const getSentimentColor = () => {
    if (data.sentiment === 'bullish') return 'text-[#30E000]';
    if (data.sentiment === 'bearish') return 'text-[#FF494A]';
    return 'text-[#A4ACC4]';
  };

  return (
    <div className="bg-[#1A1F2E] rounded-2xl p-5">
      <div className="flex items-center justify-between">

        <div>
          <div className="text-lg font-bold text-[#EAEFF9] mb-0.5">
            Stablecoin Flows
          </div>
          <div className="text-xs text-[#64748B]">
            {getSentimentText()}
          </div>
        </div>

        <div className="text-right">
          <div className={`text-3xl font-bold tabular-nums ${getSentimentColor()}`}>
            {data.totalStablecoinFlow > 0 ? '+' : ''}{formatValue(data.totalStablecoinFlow)}
          </div>
        </div>

      </div>
    </div>
  );
}
