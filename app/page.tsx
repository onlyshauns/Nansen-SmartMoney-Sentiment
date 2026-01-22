'use client';

import { useEffect, useState } from 'react';
import SentimentHero from './components/SentimentHero';
import TopTokensWidget from './components/TopTokensWidget';
import TopTradersWidget from './components/TopTradersWidget';
import LiveTradesWidget from './components/LiveTradesWidget';

export default function Home() {
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [tokensData, setTokensData] = useState<any[]>([]);
  const [tradersData, setTradersData] = useState<any[]>([]);
  const [tradesData, setTradesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setError(null);

      const [sentiment, tokens, traders, trades] = await Promise.all([
        fetch('/api/sentiment').then((r) => r.json()),
        fetch('/api/top-tokens').then((r) => r.json()),
        fetch('/api/top-traders').then((r) => r.json()),
        fetch('/api/live-trades').then((r) => r.json()),
      ]);

      setSentimentData(sentiment);
      setTokensData(tokens);
      setTradersData(traders);
      setTradesData(trades);
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
    <div className="h-screen bg-[#061019] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-[#00ffa7]/20 bg-[#0a1420] flex-shrink-0">
        <div className="px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
              Smart Money Dashboard
            </h1>
            <p className="text-gray-500 text-xs">Real-time Nansen analytics</p>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-sm text-gray-400">
                <span className="inline-block w-2 h-2 bg-[#00ffa7] rounded-full mr-2 animate-pulse" />
                Updated {formatLastUpdated()}
              </div>
            )}
            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="px-4 py-1.5 bg-[#00ffa7]/10 hover:bg-[#00ffa7]/20 text-[#00ffa7] rounded-lg transition-colors disabled:opacity-50 text-sm border border-[#00ffa7]/30"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-4 overflow-hidden">
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {isLoading && !sentimentData ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">Loading dashboard...</div>
          </div>
        ) : (
          <div className="h-full flex flex-col gap-4">
            {/* Sentiment Hero - Full Width */}
            {sentimentData && !sentimentData.error && (
              <div className="flex-shrink-0">
                <SentimentHero
                  sentiment={sentimentData.sentiment}
                  longRatio={sentimentData.longRatio}
                  shortRatio={sentimentData.shortRatio}
                  totalPositions={sentimentData.totalPositions}
                  longCount={sentimentData.longCount}
                  shortCount={sentimentData.shortCount}
                />
              </div>
            )}

            {/* Three Separate Cards Layout */}
            <div className="flex items-stretch flex-1 min-h-0" style={{ gap: '40px' }}>
              <div className="flex-1 min-w-0">
                <TopTokensWidget tokens={tokensData} />
              </div>
              <div className="flex-1 min-w-0">
                <TopTradersWidget traders={tradersData} />
              </div>
              <div className="flex-1 min-w-0">
                <LiveTradesWidget trades={tradesData} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
