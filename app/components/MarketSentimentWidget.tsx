'use client';

import styles from './TableStyles.module.css';

interface TokenSentimentData {
  symbol: string;
  openInterestUsd: number;
  fundingRate: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

interface MarketSentimentWidgetProps {
  tokens: TokenSentimentData[];
}

export default function MarketSentimentWidget({ tokens }: MarketSentimentWidgetProps) {
  const formatOpenInterest = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatFundingRate = (rate: number) => {
    const percentage = (rate * 100).toFixed(4);
    if (rate > 0) return `+${percentage}%`;
    return `${percentage}%`;
  };

  const getFundingColor = (rate: number) => {
    if (rate > 0) return styles.tdGreen;
    if (rate < 0) return styles.tdRed;
    return styles.tdMuted;
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3 className={styles.tableTitle}>Market Data</h3>
      </div>

      <div className={styles.tableBody}>
        {tokens.length === 0 ? (
          <div className={styles.noData}>No data</div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.theadRow}>
                <th className={`${styles.th} ${styles.colIndex}`}>#</th>
                <th className={`${styles.th} ${styles.colToken}`}>Token</th>
                <th className={`${styles.th} ${styles.thRight} ${styles.colOI}`}>OI</th>
                <th className={`${styles.th} ${styles.thRight} ${styles.colFunding}`}>Funding</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {tokens.slice(0, 10).map((token, index) => (
                <tr key={token.symbol} className={styles.tbodyRow}>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{index + 1}</td>
                  <td className={styles.td}>{token.symbol}</td>
                  <td className={`${styles.td} ${styles.tdRight}`}>{formatOpenInterest(token.openInterestUsd)}</td>
                  <td className={`${styles.td} ${styles.tdRight} ${getFundingColor(token.fundingRate)}`}>
                    {formatFundingRate(token.fundingRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
