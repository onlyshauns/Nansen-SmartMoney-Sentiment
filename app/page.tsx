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
    <div className="min-h-screen bg-[#0a0e16] py-14 px-14">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">
                Smart Money Dashboard
              </h1>
              <p className="text-gray-500 text-sm">Real-time Nansen analytics</p>
            </div>

            <div className="flex items-center gap-6">
              {lastUpdated && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-[#00ffa7] rounded-full animate-pulse" />
                  Updated {formatLastUpdated()}
                </div>
              )}
              <button
                onClick={fetchAllData}
                disabled={isLoading}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors disabled:opacity-50 text-sm border border-white/10"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-10">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

          {isLoading && !sentimentData ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-white text-lg">Loading dashboard...</div>
            </div>
          ) : (
            <>
              {/* Sentiment Hero - Full Width */}
              {sentimentData && !sentimentData.error && (
                <SentimentHero
                  sentiment={sentimentData.sentiment}
                  longRatio={sentimentData.longRatio}
                  shortRatio={sentimentData.shortRatio}
                  totalPositions={sentimentData.totalPositions}
                  longCount={sentimentData.longCount}
                  shortCount={sentimentData.shortCount}
                />
              )}

              {/* Three Cards Grid */}
              <div className="grid grid-cols-3 gap-8">
                <TopTokensWidget tokens={tokensData} />
                <TopTradersWidget traders={tradersData} />
                <LiveTradesWidget trades={tradesData} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
