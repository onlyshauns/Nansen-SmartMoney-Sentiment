'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3 bg-nansen-darker/50 backdrop-blur-sm px-6 py-3 rounded-full border border-nansen-green/20">
              <div className="w-2 h-2 bg-nansen-green rounded-full animate-pulse"></div>
              <span className="text-nansen-green font-semibold text-sm tracking-wider">LIVE</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            SmartMoney Sentiment Tracker
          </h1>
          <p className="text-nansen-light/70 text-lg">
            Real-time tracking of Nansen smart money & Hyperliquid smart traders
          </p>
        </div>

        {/* Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="text-nansen-light/50 text-sm mb-2">Overall Sentiment</div>
            <div className="text-4xl font-bold text-nansen-green mb-1">Bullish</div>
            <div className="text-nansen-light/70 text-sm">+12% vs yesterday</div>
          </div>

          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="text-nansen-light/50 text-sm mb-2">Smart Money Buys (24h)</div>
            <div className="text-4xl font-bold text-white mb-1">$2.4M</div>
            <div className="text-nansen-green text-sm">↑ 24 transactions</div>
          </div>

          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="text-nansen-light/50 text-sm mb-2">HL Long Positions</div>
            <div className="text-4xl font-bold text-white mb-1">68%</div>
            <div className="text-nansen-blue text-sm">32% shorts</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nansen Smart Money Activity */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Nansen Smart Money</h2>
            <div className="space-y-4">
              <div className="text-nansen-light/50 text-center py-8">
                Connect Nansen API to see live data
              </div>
            </div>
          </div>

          {/* Hyperliquid Positions */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Hyperliquid Smart Traders</h2>
            <div className="space-y-4">
              <div className="text-nansen-light/50 text-center py-8">
                Connect Hyperliquid API to see live positions
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-nansen-light/40 text-sm">
            <span>Powered by Nansen & Hyperliquid APIs</span>
          </div>
        </div>
      </div>
    </main>
  );
}
