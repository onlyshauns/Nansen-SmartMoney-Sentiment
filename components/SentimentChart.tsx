'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useEffect, useState } from 'react';

interface SentimentChartProps {
  currentScore: number;
}

export default function SentimentChart({ currentScore }: SentimentChartProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Generate historical data (mock - in production, store real historical data)
    const generateHistoricalData = () => {
      const points = [];
      let score = currentScore;

      // Generate 24 hours of data (hourly)
      for (let i = 23; i >= 0; i--) {
        const hour = new Date();
        hour.setHours(hour.getHours() - i);

        // Random walk from current score
        score += (Math.random() - 0.5) * 20;
        score = Math.max(-100, Math.min(100, score)); // Clamp between -100 and 100

        points.push({
          time: hour.getHours() + ':00',
          score: Math.round(score),
          timestamp: hour.toISOString(),
        });
      }

      // Ensure last point is current score
      points[points.length - 1].score = currentScore;

      return points;
    };

    setData(generateHistoricalData());
  }, [currentScore]);

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-white font-bold text-xl mb-4">Sentiment Trend (24h)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E2B3" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3298DA" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 226, 179, 0.1)" />
          <XAxis
            dataKey="time"
            stroke="#E8ECF4"
            opacity={0.4}
            tick={{ fill: '#E8ECF4', fontSize: 11 }}
          />
          <YAxis
            stroke="#E8ECF4"
            opacity={0.4}
            domain={[-100, 100]}
            tick={{ fill: '#E8ECF4', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#042133',
              border: '1px solid #00E2B3',
              borderRadius: '8px',
              color: '#E8ECF4',
            }}
            formatter={(value: number | undefined) => value !== undefined ? [`${value}`, 'Score'] : ['', 'Score']}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#00E2B3"
            strokeWidth={2}
            fill="url(#sentimentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
