'use client';

import styles from './TableStyles.module.css';
import Tooltip, { TooltipIcon } from './Tooltip';

interface SentimentDriver {
  name: string;
  score: number;
  weight: number;
  explain: string;
}

interface SentimentMeta {
  consensusLongPct: number;
  concentrationTop5Pct: number;
  stale: boolean;
  dataQualityNote: string;
}

interface SentimentDriversProps {
  drivers?: SentimentDriver[];
  finalScore: number;
  confidence?: number;
  meta?: SentimentMeta;
}

// Tooltip definitions
const TOOLTIP_DEFINITIONS = {
  'Long/Short Position Bias':
    'Aggregate smart money long minus short exposure on Hyperliquid perps. Positive = net long.',
  'Perps net exposure':
    'Aggregate smart money long minus short exposure on Hyperliquid perps. Positive = net long.',
  'Perps exposure change':
    'Change in smart money net exposure over the lookback window. Positive = increasing long bias.',
  'Spot risk-on/off':
    'Stablecoin flow tilt. Net stable inflow suggests risk-off; net stable outflow suggests risk-on.',
  'PnL confidence modifier':
    '7-day realised PnL used as a confidence modifier, not a directional signal.',
  Confidence:
    'How consistent and reliable the signals are (agreement, concentration, data freshness).',
};

export default function SentimentDrivers({
  drivers = [],
  finalScore,
  confidence = 0,
  meta,
}: SentimentDriversProps) {
  const formatScore = (score: number) => {
    return (score > 0 ? '+' : '') + score.toFixed(2);
  };

  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getScoreColor = (score: number) => {
    if (score > 0.05) return 'text-[#30E000]';
    if (score < -0.05) return 'text-[#FF494A]';
    return 'text-[#A4ACC4]';
  };

  const getBarWidth = (score: number) => {
    // Convert -1 to +1 into 0% to 100%
    return ((score + 1) / 2) * 100;
  };

  const showConcentrationWarning =
    meta && meta.concentrationTop5Pct > 0.6;
  const showLowConfidenceWarning = confidence < 0.4;

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className="flex items-center justify-between w-full">
          <h3 className={styles.tableTitle}>Sentiment Drivers</h3>
          <Tooltip content="Key metrics driving the overall market sentiment. Weighted combination of position data, PnL, and risk indicators.">
            <TooltipIcon />
          </Tooltip>
        </div>
      </div>

      <div className={styles.tableBody} style={{ padding: '0 16px' }}>
        {/* Render each driver */}
        {drivers.map((driver, idx) => (
          <div key={idx} style={{ marginBottom: idx < drivers.length - 1 ? '4px' : 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#EAEFF9'
                  }}
                >
                  {driver.name}
                </span>
                <Tooltip
                  content={
                    TOOLTIP_DEFINITIONS[
                      driver.name as keyof typeof TOOLTIP_DEFINITIONS
                    ] || driver.explain
                  }
                >
                  <TooltipIcon />
                </Tooltip>
                <span style={{ fontSize: '9px', color: '#64748B' }}>
                  {(driver.weight * 100).toFixed(0)}%
                </span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  textAlign: 'right',
                  minWidth: '50px'
                }}
                className={getScoreColor(driver.score)}
              >
                {formatScore(driver.score)}
              </span>
            </div>
            <div
              style={{
                position: 'relative',
                height: '6px',
                background: '#0B0F1A',
                borderRadius: '3px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: '100%',
                  background: 'linear-gradient(to right, #FF494A, #64748B, #30E000)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  height: '100%',
                  width: '2px',
                  background: '#EAEFF9',
                  boxShadow: '0 0 4px rgba(234, 239, 249, 0.5)',
                  left: `${getBarWidth(driver.score)}%`
                }}
              />
            </div>
            <div style={{ marginTop: '2px', fontSize: '9px', color: '#64748B' }}>
              {driver.explain}
            </div>
          </div>
        ))}

        {/* Final Score & Confidence */}
        <div
          style={{
            paddingTop: '6px',
            borderTop: '1px solid #2D334D',
            marginTop: '6px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#EAEFF9' }}>
                Final Score
              </span>
              <Tooltip content="Combined weighted score from all sentiment signals">
                <TooltipIcon />
              </Tooltip>
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 900,
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'right',
                minWidth: '50px'
              }}
              className={getScoreColor(finalScore)}
            >
              {formatScore(finalScore)}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '9px', color: '#64748B' }}>Confidence</span>
              <Tooltip content={TOOLTIP_DEFINITIONS.Confidence}>
                <TooltipIcon />
              </Tooltip>
            </div>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 600,
                color: '#EAEFF9',
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'right',
                minWidth: '50px'
              }}
            >
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Warnings */}
        {(showConcentrationWarning || showLowConfidenceWarning) && (
          <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {showConcentrationWarning && (
              <div
                style={{
                  fontSize: '9px',
                  color: '#F59E0B',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '4px'
                }}
              >
                <span>⚠</span>
                <span>
                  High concentration: Top 5 wallets hold{' '}
                  {((meta?.concentrationTop5Pct || 0) * 100).toFixed(0)}% of
                  exposure
                </span>
              </div>
            )}
            {showLowConfidenceWarning && (
              <div
                style={{
                  fontSize: '9px',
                  color: '#F59E0B',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '4px'
                }}
              >
                <span>⚠</span>
                <span>
                  Low confidence: Signals show low agreement or stale data
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
