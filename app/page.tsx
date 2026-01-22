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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Smart Money Dashboard</h1>
            <p className="text-slate-400 text-sm">Real-time Nansen analytics</p>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-sm text-slate-400">
                <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                Updated {formatLastUpdated()}
              </div>
            )}
            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {isLoading && !sentimentData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-lg">Loading dashboard...</div>
          </div>
        ) : (
          <div className="space-y-6">
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

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopTokensWidget tokens={tokensData} />
              <TopTradersWidget traders={tradersData} />
            </div>

            {/* Live Trades - Full Width */}
            <LiveTradesWidget trades={tradesData} />
          </div>
        )}
      </main>
    </div>
  );
}
