/**
 * Sentiment Scoring Engine
 *
 * 4-signal ensemble model for smart money sentiment analysis
 */

// Configuration
export const SENTIMENT_CONFIG = {
  // Weights (must sum to 1.0)
  WEIGHT_PERPS_NET_EXPOSURE: 0.45,
  WEIGHT_PERPS_DELTA: 0.25,
  WEIGHT_SPOT_RISK: 0.20,
  WEIGHT_PNL_MODIFIER: 0.10,

  // Thresholds
  EXTREMELY_BULLISH_THRESHOLD: 0.5,
  BULLISH_THRESHOLD: 0.25,
  SLIGHTLY_BULLISH_THRESHOLD: 0.05,
  NEUTRAL_THRESHOLD: 0.05,
  SLIGHTLY_BEARISH_THRESHOLD: -0.05,
  BEARISH_THRESHOLD: -0.25,
  EXTREMELY_BEARISH_THRESHOLD: -0.5,

  // Normalization scales
  DELTA_SCALE_USD: 5000000, // $5M
  STABLE_SCALE_USD: 10000000, // $10M
  PNL_SCALE_USD: 2000000, // $2M

  // Safety
  MIN_WALLETS_THRESHOLD: 5,
  MIN_TOTAL_EXPOSURE_USD: 1000000, // $1M
  EPSILON: 1000, // Avoid division by zero

  // Confidence adjustments
  CONFIDENCE_BASE: 0.5,
  CONFIDENCE_AGREEMENT_BONUS: 0.10,
  CONFIDENCE_CONCENTRATION_PENALTY: 0.15,
  CONFIDENCE_STALE_PENALTY: 0.10,
  CONCENTRATION_WARNING_THRESHOLD: 0.60,

  // Time windows
  PERPS_DELTA_WINDOW_HOURS: 4,
  SPOT_FLOWS_WINDOW_HOURS: 24,
  PNL_WINDOW_DAYS: 7,
};

export interface SentimentComponent {
  score: number; // -1 to +1
  longUsd?: number;
  shortUsd?: number;
  deltaUsd?: number;
  netStableUsd?: number;
  realisedPnl7dUsd?: number;
}

export interface SentimentDriver {
  name: string;
  score: number;
  weight: number;
  explain: string;
}

export interface SentimentMeta {
  consensusLongPct: number;
  concentrationTop5Pct: number;
  stale: boolean;
  dataQualityNote: string;
}

export interface SentimentResult {
  label: 'EXTREMELY_BULLISH' | 'BULLISH' | 'SLIGHTLY_BULLISH' | 'NEUTRAL' | 'SLIGHTLY_BEARISH' | 'BEARISH' | 'EXTREMELY_BEARISH';
  finalScore: number;
  confidence: number;
  windows: {
    perpsSnapshot: string;
    perpsDelta: string;
    spotFlows: string;
    pnl: string;
  };
  components: {
    perpsNetExposure: SentimentComponent;
    perpsDelta: SentimentComponent;
    spotRisk: SentimentComponent;
    pnlModifier: SentimentComponent;
  };
  meta: SentimentMeta;
  drivers: SentimentDriver[];
}

// Utility: Clamp value to [-1, 1]
function clamp(value: number, min: number = -1, max: number = 1): number {
  return Math.max(min, Math.min(max, value));
}

// Utility: Hyperbolic tangent for saturation
function tanh(x: number): number {
  const e2x = Math.exp(2 * x);
  return (e2x - 1) / (e2x + 1);
}

/**
 * Signal A: Perps Net Exposure
 * score = (long - short) / (long + short + epsilon)
 */
export function computePerpsNetExposure(
  longUsd: number,
  shortUsd: number
): SentimentComponent {
  const totalExposure = longUsd + shortUsd + SENTIMENT_CONFIG.EPSILON;
  const score = clamp((longUsd - shortUsd) / totalExposure);

  return {
    score,
    longUsd,
    shortUsd,
  };
}

/**
 * Signal B: Perps Exposure Change (Δ)
 * Compare net exposure now vs lookback window
 * score = tanh(delta / DELTA_SCALE_USD)
 */
export function computePerpsDelta(
  netExposureNow: number,
  netExposureLookback: number
): SentimentComponent {
  const deltaUsd = netExposureNow - netExposureLookback;
  const score = clamp(tanh(deltaUsd / SENTIMENT_CONFIG.DELTA_SCALE_USD));

  return {
    score,
    deltaUsd,
  };
}

/**
 * Signal C: Spot Risk-On/Off
 * Net stablecoin flows as risk-off proxy
 * stable inflow => bearish, stable outflow => bullish
 * score = -tanh(netStable / STABLE_SCALE_USD)
 */
export function computeSpotRisk(netStableUsd: number): SentimentComponent {
  const score = clamp(-tanh(netStableUsd / SENTIMENT_CONFIG.STABLE_SCALE_USD));

  return {
    score,
    netStableUsd,
  };
}

/**
 * Signal D: 7D Realised PnL Confidence Modifier
 * Adjusts conviction based on recent performance
 * score = tanh(realisedPnl7d / PNL_SCALE_USD)
 */
export function computePnLModifier(realisedPnl7dUsd: number): SentimentComponent {
  const score = clamp(tanh(realisedPnl7dUsd / SENTIMENT_CONFIG.PNL_SCALE_USD));

  return {
    score,
    realisedPnl7dUsd,
  };
}

/**
 * Compute consensus: % of wallets net long
 */
export function computeConsensus(
  wallets: Array<{ netExposureUsd: number }>
): number {
  if (wallets.length === 0) return 0.5;

  const longWallets = wallets.filter((w) => w.netExposureUsd > 0).length;
  return longWallets / wallets.length;
}

/**
 * Compute concentration: % of net exposure from top 5 wallets
 */
export function computeConcentration(
  wallets: Array<{ netExposureUsd: number }>
): number {
  if (wallets.length === 0) return 0;

  const totalNetExposure = Math.abs(
    wallets.reduce((sum, w) => sum + w.netExposureUsd, 0)
  );

  if (totalNetExposure < SENTIMENT_CONFIG.EPSILON) return 0;

  // Sort by absolute exposure
  const sorted = [...wallets].sort(
    (a, b) => Math.abs(b.netExposureUsd) - Math.abs(a.netExposureUsd)
  );

  const top5Exposure = Math.abs(
    sorted.slice(0, 5).reduce((sum, w) => sum + w.netExposureUsd, 0)
  );

  return top5Exposure / totalNetExposure;
}

/**
 * Compute confidence score (0..1)
 */
export function computeConfidence(
  components: {
    perpsNetExposure: SentimentComponent;
    perpsDelta: SentimentComponent;
    spotRisk: SentimentComponent;
  },
  meta: { concentrationTop5Pct: number; stale: boolean }
): number {
  let confidence = SENTIMENT_CONFIG.CONFIDENCE_BASE;

  // +0.10 if A and B agree in sign
  if (
    Math.sign(components.perpsNetExposure.score) ===
    Math.sign(components.perpsDelta.score)
  ) {
    confidence += SENTIMENT_CONFIG.CONFIDENCE_AGREEMENT_BONUS;
  }

  // +0.10 if C agrees with A
  if (
    Math.sign(components.spotRisk.score) ===
    Math.sign(components.perpsNetExposure.score)
  ) {
    confidence += SENTIMENT_CONFIG.CONFIDENCE_AGREEMENT_BONUS;
  }

  // -0.15 if concentration > 60%
  if (meta.concentrationTop5Pct > SENTIMENT_CONFIG.CONCENTRATION_WARNING_THRESHOLD) {
    confidence -= SENTIMENT_CONFIG.CONFIDENCE_CONCENTRATION_PENALTY;
  }

  // -0.10 if stale
  if (meta.stale) {
    confidence -= SENTIMENT_CONFIG.CONFIDENCE_STALE_PENALTY;
  }

  return clamp(confidence, 0, 1);
}

/**
 * Combine signals into final score
 */
export function computeFinalScore(components: {
  perpsNetExposure: SentimentComponent;
  perpsDelta: SentimentComponent;
  spotRisk: SentimentComponent;
  pnlModifier: SentimentComponent;
}): number {
  const finalScore =
    SENTIMENT_CONFIG.WEIGHT_PERPS_NET_EXPOSURE * components.perpsNetExposure.score +
    SENTIMENT_CONFIG.WEIGHT_PERPS_DELTA * components.perpsDelta.score +
    SENTIMENT_CONFIG.WEIGHT_SPOT_RISK * components.spotRisk.score +
    SENTIMENT_CONFIG.WEIGHT_PNL_MODIFIER * components.pnlModifier.score;

  return clamp(finalScore);
}

/**
 * Get sentiment label from final score
 */
export function getSentimentLabel(
  finalScore: number
): 'EXTREMELY_BULLISH' | 'BULLISH' | 'SLIGHTLY_BULLISH' | 'NEUTRAL' | 'SLIGHTLY_BEARISH' | 'BEARISH' | 'EXTREMELY_BEARISH' {
  if (finalScore >= SENTIMENT_CONFIG.EXTREMELY_BULLISH_THRESHOLD) return 'EXTREMELY_BULLISH';
  if (finalScore >= SENTIMENT_CONFIG.BULLISH_THRESHOLD) return 'BULLISH';
  if (finalScore >= SENTIMENT_CONFIG.SLIGHTLY_BULLISH_THRESHOLD) return 'SLIGHTLY_BULLISH';
  if (finalScore >= -SENTIMENT_CONFIG.NEUTRAL_THRESHOLD) return 'NEUTRAL';
  if (finalScore >= SENTIMENT_CONFIG.SLIGHTLY_BEARISH_THRESHOLD) return 'SLIGHTLY_BEARISH';
  if (finalScore >= SENTIMENT_CONFIG.BEARISH_THRESHOLD) return 'BEARISH';
  return 'EXTREMELY_BEARISH';
}

/**
 * Generate driver explanations
 */
export function generateDrivers(components: {
  perpsNetExposure: SentimentComponent;
  perpsDelta: SentimentComponent;
  spotRisk: SentimentComponent;
  pnlModifier: SentimentComponent;
}): SentimentDriver[] {
  const formatUsd = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const drivers: SentimentDriver[] = [];

  // A: Long/Short Position Bias
  const { longUsd = 0, shortUsd = 0 } = components.perpsNetExposure;
  drivers.push({
    name: 'Long/Short Position Bias',
    score: components.perpsNetExposure.score,
    weight: SENTIMENT_CONFIG.WEIGHT_PERPS_NET_EXPOSURE,
    explain: `Net long ${formatUsd(longUsd)} vs short ${formatUsd(shortUsd)}`,
  });

  // B: Perps exposure change
  const { deltaUsd = 0 } = components.perpsDelta;
  const deltaDirection = deltaUsd >= 0 ? 'increased' : 'decreased';
  drivers.push({
    name: 'Perps exposure change',
    score: components.perpsDelta.score,
    weight: SENTIMENT_CONFIG.WEIGHT_PERPS_DELTA,
    explain: `Net long ${deltaDirection} ${formatUsd(Math.abs(deltaUsd))} over ${SENTIMENT_CONFIG.PERPS_DELTA_WINDOW_HOURS}h`,
  });

  // C: Spot risk-on/off
  const { netStableUsd = 0 } = components.spotRisk;
  const riskTilt = netStableUsd < 0 ? 'risk-on' : 'risk-off';
  drivers.push({
    name: 'Spot risk-on/off',
    score: components.spotRisk.score,
    weight: SENTIMENT_CONFIG.WEIGHT_SPOT_RISK,
    explain: `Net stables ${formatUsd(netStableUsd)} (${riskTilt})`,
  });

  // D: PnL modifier
  const { realisedPnl7dUsd = 0 } = components.pnlModifier;
  const pnlImpact =
    realisedPnl7dUsd > 0 ? 'increases confidence' : 'reduces conviction';
  drivers.push({
    name: 'PnL confidence modifier',
    score: components.pnlModifier.score,
    weight: SENTIMENT_CONFIG.WEIGHT_PNL_MODIFIER,
    explain: `7D realised PnL ${formatUsd(realisedPnl7dUsd)} ${pnlImpact}`,
  });

  return drivers;
}

/**
 * Main function: Calculate complete sentiment result
 */
export function calculateSentiment(input: {
  perps: {
    longUsd: number;
    shortUsd: number;
    netExposureNow: number;
    netExposureLookback: number;
  };
  spot: {
    netStableUsd: number;
  };
  pnl: {
    realisedPnl7dUsd: number;
  };
  wallets?: Array<{ netExposureUsd: number }>;
  stale?: boolean;
}): SentimentResult {
  // Compute components
  const perpsNetExposure = computePerpsNetExposure(
    input.perps.longUsd,
    input.perps.shortUsd
  );

  const perpsDelta = computePerpsDelta(
    input.perps.netExposureNow,
    input.perps.netExposureLookback
  );

  const spotRisk = computeSpotRisk(input.spot.netStableUsd);

  const pnlModifier = computePnLModifier(input.pnl.realisedPnl7dUsd);

  const components = {
    perpsNetExposure,
    perpsDelta,
    spotRisk,
    pnlModifier,
  };

  // Compute meta
  const wallets = input.wallets || [];
  const consensusLongPct = computeConsensus(wallets);
  const concentrationTop5Pct = computeConcentration(wallets);
  const stale = input.stale || false;

  // Check data quality
  let dataQualityNote = '';
  if (wallets.length > 0 && wallets.length < SENTIMENT_CONFIG.MIN_WALLETS_THRESHOLD) {
    dataQualityNote = `Low sample size (${wallets.length} wallets)`;
  }
  if (
    input.perps.longUsd + input.perps.shortUsd <
    SENTIMENT_CONFIG.MIN_TOTAL_EXPOSURE_USD
  ) {
    dataQualityNote += dataQualityNote
      ? '; Insufficient total exposure'
      : 'Insufficient total exposure';
  }

  const meta: SentimentMeta = {
    consensusLongPct,
    concentrationTop5Pct,
    stale,
    dataQualityNote: dataQualityNote || 'Good',
  };

  // Compute confidence
  const confidence = computeConfidence(
    { perpsNetExposure, perpsDelta, spotRisk },
    meta
  );

  // Compute final score
  const finalScore = computeFinalScore(components);

  // Get label
  const label = getSentimentLabel(finalScore);

  // Generate drivers
  const drivers = generateDrivers(components);

  return {
    label,
    finalScore,
    confidence,
    windows: {
      perpsSnapshot: 'now',
      perpsDelta: `${SENTIMENT_CONFIG.PERPS_DELTA_WINDOW_HOURS}h`,
      spotFlows: `${SENTIMENT_CONFIG.SPOT_FLOWS_WINDOW_HOURS}h`,
      pnl: `${SENTIMENT_CONFIG.PNL_WINDOW_DAYS}d`,
    },
    components,
    meta,
    drivers,
  };
}
