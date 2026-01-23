'use client';

import styles from './TableStyles.module.css';

interface Trader {
  address: string;
  label: string;
  totalVolume: number;
  longVolume: number;
  shortVolume: number;
  tradeCount: number;
  dominantSide: 'long' | 'short' | 'neutral';
  tokensTraded: string[];
  longRatio: number;
  shortRatio: number;
}

interface TopTradersWidgetProps {
  traders: Trader[];
}

export default function TopTradersWidget({ traders }: TopTradersWidgetProps) {
  const openWalletProfiler = (address: string) => {
    window.open(`https://app.nansen.ai/wallet-profiler?address=${address}`, '_blank');
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const truncateAddress = (address: string, label?: string) => {
    if (label && label !== address) {
      return label;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3 className={styles.tableTitle}>Traders</h3>
      </div>

      <div className={styles.tableBody}>
        {traders.length === 0 ? (
          <div className={styles.noData}>No data</div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.theadRow}>
                <th className={`${styles.th} ${styles.colIndex}`}>#</th>
                <th className={`${styles.th} ${styles.colAddress}`}>Address</th>
                <th className={`${styles.th} ${styles.thRight} ${styles.colValue}`}>Volume</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {traders.slice(0, 10).map((trader, index) => (
                <tr
                  key={trader.address}
                  className={styles.tbodyRow}
                  onClick={() => openWalletProfiler(trader.address)}
                >
                  <td className={`${styles.td} ${styles.tdMuted}`}>{index + 1}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{truncateAddress(trader.address, trader.label)}</td>
                  <td className={`${styles.td} ${styles.tdRight}`}>{formatValue(trader.totalVolume)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
