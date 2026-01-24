'use client';

import { useEffect, useState } from 'react';
import SentimentHero from './components/SentimentHero';
import TopTokensWidget from './components/TopTokensWidget';
import SmartMoneyOutflowsWidget from './components/SmartMoneyOutflowsWidget';
import SentimentDrivers from './components/SentimentDrivers';
import SmartMoneyTradersWidget from './components/SmartMoneyTradersWidget';

export default function Home() {
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [tokensData, setTokensData] = useState<any[]>([]);
  const [smartTradersData, setSmartTradersData] = useState<any[]>([]);
  const [marketSentimentData, setMarketSentimentData] = useState<any[]>([]);
  const [stablecoinFlowData, setStablecoinFlowData] = useState<any>(null);
  const [outflowsData, setOutflowsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setError(null);

      const [sentiment, tokens, smartTraders, marketSentiment, stablecoinFlow, outflows] = await Promise.all([
        fetch('/api/sentiment').then((r) => r.json()),
        fetch('/api/top-tokens').then((r) => r.json()),
        fetch('/api/smart-traders').then((r) => r.json()),
        fetch('/api/market-sentiment').then((r) => r.json()),
        fetch('/api/stablecoin-flows').then((r) => r.json()),
        fetch('/api/top-outflows').then((r) => r.json()),
      ]);

      setSentimentData(sentiment);
      setTokensData(tokens);
      setSmartTradersData(smartTraders.traders || []);
      setMarketSentimentData(marketSentiment);
      setStablecoinFlowData(stablecoinFlow);
      setOutflowsData(outflows);
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Retrying...');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Auto-refresh every 3 minutes (180000ms)
    const interval = setInterval(fetchAllData, 180000);

    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    return `${diffMins}m ago`;
  };

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        paddingBottom: '32px',
        background: '#080B12'
      }}
    >
      <div
        style={{
          height: '100%',
          maxWidth: '1400px',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          gap: '8px'
        }}
      >
        {/* Fixed Header - strictly bounded height */}
        <header
          style={{
            flex: '0 0 auto',
            maxHeight: '50px',
            overflow: 'hidden'
          }}
        >
          <div className="flex items-center justify-between h-full">
            <div>
              <h1 className="text-lg font-bold text-[#EAEFF9] leading-tight">
                Smart Money Dashboard
              </h1>
              <p className="text-[10px] text-[#A4ACC4]">
                Real-time insights from Hyperliquid smart money traders
              </p>
            </div>

            <div className="flex items-center gap-2">
              {lastUpdated && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1F2E] border border-[#00ffa7]/30 rounded-md">
                  <div className="w-1 h-1 bg-[#30E000] rounded-full animate-pulse-glow"></div>
                  <span className="text-[10px] font-semibold text-[#EAEFF9]">
                    LIVE • {formatLastUpdated()}
                  </span>
                </div>
              )}
              <button
                onClick={fetchAllData}
                disabled={isLoading}
                className="px-3 py-1 bg-[#00ffa7]/10 hover:bg-[#00ffa7]/20 border border-[#00ffa7]/50 text-[#00ffa7] text-[10px] font-bold rounded-md transition-all disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div
            style={{
              flex: '0 0 auto',
              padding: '8px',
              background: 'rgba(255, 73, 74, 0.1)',
              border: '1px solid rgba(255, 73, 74, 0.5)',
              borderRadius: '8px',
              color: '#FF494A',
              fontSize: '10px'
            }}
          >
            {error}
          </div>
        )}

        {/* Main Content Area - Grid Area */}
        {isLoading && !sentimentData ? (
          <div
            style={{
              flex: '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 0
            }}
          >
            <div className="text-[#EAEFF9] text-base">Loading dashboard...</div>
          </div>
        ) : (
          <div
            style={{
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              gap: '8px'
            }}
          >
            {/* Sentiment Hero - Fixed height */}
            {sentimentData && !sentimentData.error && (
              <div
                style={{
                  flex: '0 0 auto',
                  height: '120px'
                }}
              >
                <SentimentHero
                  sentiment={sentimentData.sentiment}
                  longRatio={sentimentData.longRatio}
                  shortRatio={sentimentData.shortRatio}
                  estimatedLongValue={sentimentData.estimatedLongValue}
                  estimatedShortValue={sentimentData.estimatedShortValue}
                  totalOpenInterestUsd={sentimentData.totalOpenInterestUsd}
                  finalScore={sentimentData.finalScore}
                />
              </div>
            )}

            {/* True 2×2 Grid - WITH VISIBLE GAP */}
            <div
              style={{
                flex: '1 1 auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '20px',
                minHeight: 0,
                overflow: 'hidden',
                height: '100%'
              }}
            >
              {/* Top-left: Inflows */}
              <div
                style={{
                  minHeight: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <TopTokensWidget tokens={tokensData} />
              </div>

              {/* Top-right: Outflows */}
              <div
                style={{
                  minHeight: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <SmartMoneyOutflowsWidget tokens={outflowsData} />
              </div>

              {/* Bottom-left: Sentiment Drivers */}
              <div
                style={{
                  minHeight: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {sentimentData && (
                  <SentimentDrivers
                    drivers={sentimentData.drivers || []}
                    finalScore={sentimentData.finalScore || 0}
                    confidence={sentimentData.confidence}
                    meta={sentimentData.meta}
                  />
                )}
              </div>

              {/* Bottom-right: Smart Money Traders */}
              <div
                style={{
                  minHeight: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <SmartMoneyTradersWidget traders={smartTradersData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
