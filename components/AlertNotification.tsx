'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Alert {
  id: string;
  type: 'buy' | 'sell' | 'position';
  token: string;
  amount: number;
  timestamp: Date;
}

interface AlertNotificationProps {
  enabled: boolean;
}

export default function AlertNotification({ enabled }: AlertNotificationProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [threshold, setThreshold] = useState(100000); // $100k default

  useEffect(() => {
    if (!enabled) return;

    // Simulate alerts checking (in production, use WebSocket)
    const checkAlerts = async () => {
      try {
        const response = await fetch('/api/nansen/dex-trades?limit=5');
        const data = await response.json();

        if (data.success && data.data) {
          data.data.forEach((trade: any) => {
            const amount = trade.amount_usd || trade.value_usd || 0;

            if (amount > threshold) {
              const alertId = `${trade.token}-${trade.timestamp}`;

              // Check if we haven't already shown this alert
              if (!alerts.find(a => a.id === alertId)) {
                const newAlert: Alert = {
                  id: alertId,
                  type: (trade.type === 'buy' ? 'buy' : 'sell') as 'buy' | 'sell',
                  token: trade.token,
                  amount,
                  timestamp: new Date(trade.timestamp),
                };

                setAlerts(prev => [...prev, newAlert]);

                // Show toast notification
                toast.custom((t) => (
                  <div
                    className={`${
                      t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-nansen-darker border ${
                      newAlert.type === 'buy' ? 'border-nansen-cyan' : 'border-red-400'
                    } rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 shadow-lg`}
                  >
                    <div className="flex-1 w-0 p-4">
                      <div className="flex items-start">
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-semibold text-white">
                            {newAlert.type === 'buy' ? '●' : '●'} Large {newAlert.type.toUpperCase()}
                          </p>
                          <p className="mt-1 text-sm text-nansen-light/70">
                            {newAlert.token}: ${(newAlert.amount / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex border-l border-nansen-cyan/20">
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-medium text-nansen-cyan hover:text-nansen-blue"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ), {
                  duration: 5000,
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Error checking alerts:', error);
      }
    };

    const interval = setInterval(checkAlerts, 30000); // Check every 30 seconds
    checkAlerts(); // Check immediately

    return () => clearInterval(interval);
  }, [enabled, threshold, alerts]);

  return (
    <>
      <Toaster position="top-right" />
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">Alerts</h3>
            <p className="text-nansen-light/40 text-xs">Notify on large moves</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={threshold / 1000}
              onChange={(e) => setThreshold(Number(e.target.value) * 1000)}
              className="w-20 bg-nansen-darker border border-nansen-cyan/20 rounded px-2 py-1 text-white text-sm focus:border-nansen-cyan/50 focus:outline-none"
              placeholder="100"
            />
            <span className="text-nansen-light/40 text-xs">$K</span>
            <div className={`w-2.5 h-2.5 rounded-full ${enabled ? 'bg-nansen-cyan animate-pulse' : 'bg-nansen-light/30'}`} />
          </div>
        </div>
      </div>
    </>
  );
}
