/**
 * Smart Money Sentiment Scoring Engine
 * Combines position bias (80%) and stablecoin flows (20%)
 */

import { SENTIMENT_CONFIG, STABLECOINS } from '../config/sentiment';
import { getSmartMoneyPositions, getTokenFlows } from './nansenHyperliquid';

export interface SentimentScore {
  positionScore: number; // -1 to +1
  stableFlowScore: number; // -1 to +1
  finalScore: number; // -1 to +1
  label: 'BEARISH' | 'NEUTRAL' | 'BULLISH';
  longExposureUsd: number;
  shortExposureUsd: number;
  netStableUsd: number;
  timestamp: string;
  isStale?: boolean;
}

/**
 * Calculate position bias score from smart money positions
 * Returns score in range [-1, +1]
 */
export function calculatePositionScore(
  longExposureUsd: number,
  shortExposureUsd: number
): number {
  const totalExposure = longExposureUsd + shortExposureUsd;

  // If no meaningful exposure, return neutral
  if (totalExposure < SENTIMENT_CONFIG.MIN_POSITION_THRESHOLD) {
    return 0;
  }

  // Position bias: (long - short) / (long + short)
  const positionScore = (longExposureUsd - shortExposureUsd) / totalExposure;

  // Clamp to [-1, +1]
  return Math.max(-1, Math.min(1, positionScore));
}

/**
 * Calculate stablecoin flow score
 * Positive inflow (moving to stables) = bearish
 * Positive outflow (leaving stables) = bullish
 * Returns score in range [-1, +1]
 */
export function calculateStableFlowScore(netStableUsd: number): number {
  // Normalize by scale factor
  const normalized = netStableUsd / SENTIMENT_CONFIG.STABLE_FLOW_SCALE;

  // Invert: positive inflow = negative score (bearish)
  const flowScore = -1 * normalized;

  // Clamp to [-1, +1]
  return Math.max(-1, Math.min(1, flowScore));
}

/**
 * Combine position and flow scores into final sentiment
 */
export function calculateFinalScore(
  positionScore: number,
  stableFlowScore: number
): number {
  const finalScore =
    SENTIMENT_CONFIG.POSITION_WEIGHT * positionScore +
    SENTIMENT_CONFIG.STABLE_FLOW_WEIGHT * stableFlowScore;

  return Math.max(-1, Math.min(1, finalScore));
}

/**
 * Map score to sentiment label
 */
export function getSentimentLabel(
  finalScore: number
): 'BEARISH' | 'NEUTRAL' | 'BULLISH' {
  if (finalScore <= SENTIMENT_CONFIG.BEARISH_THRESHOLD) {
    return 'BEARISH';
  }
  if (finalScore >= SENTIMENT_CONFIG.BULLISH_THRESHOLD) {
    return 'BULLISH';
  }
  return 'NEUTRAL';
}

/**
 * Filter stablecoin flows from all token flows
 */
function filterStablecoinFlows(flows: any[]): number {
  const allStablecoins = new Set(Object.values(STABLECOINS).flat());

  return flows
    .filter((flow) => allStablecoins.has(flow.token))
    .reduce((sum, flow) => sum + (flow.netFlowUsd || 0), 0);
}

/**
 * Main function: Calculate complete sentiment score
 */
export async function calculateSmartMoneySentiment(): Promise<SentimentScore> {
  try {
    // Fetch data in parallel
    const [positionsData, flowsData] = await Promise.all([
      getSmartMoneyPositions(),
      getTokenFlows(),
    ]);

    // Calculate position score (80% weight)
    const longExposureUsd = positionsData.totalLongExposureUsd;
    const shortExposureUsd = positionsData.totalShortExposureUsd;
    const positionScore = calculatePositionScore(longExposureUsd, shortExposureUsd);

    // Calculate stablecoin flow score (20% weight)
    const netStableUsd = filterStablecoinFlows(flowsData.flows);
    const stableFlowScore = calculateStableFlowScore(netStableUsd);

    // Calculate final combined score
    const finalScore = calculateFinalScore(positionScore, stableFlowScore);
    const label = getSentimentLabel(finalScore);

    return {
      positionScore,
      stableFlowScore,
      finalScore,
      label,
      longExposureUsd,
      shortExposureUsd,
      netStableUsd,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error calculating sentiment:', error);

    // Return neutral fallback
    return {
      positionScore: 0,
      stableFlowScore: 0,
      finalScore: 0,
      label: 'NEUTRAL',
      longExposureUsd: 0,
      shortExposureUsd: 0,
      netStableUsd: 0,
      timestamp: new Date().toISOString(),
      isStale: true,
    };
  }
}
