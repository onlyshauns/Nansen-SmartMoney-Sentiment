'use client';

import styles from './TableStyles.module.css';
import Tooltip, { TooltipIcon } from './Tooltip';

interface Trader {
  rank: number;
  traderNameOrLabel: string;
  address: string;
  realisedPnlUsd: number;
  tradeCount?: number;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

interface SmartMoneyTradersWidgetProps {
  traders: Trader[];
}

export default function SmartMoneyTradersWidget({ traders }: SmartMoneyTradersWidgetProps) {
  const formatValue = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (abs >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const truncateAddress = (address: string) => {
    if (!address) return '-';
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const displayTraders = traders.slice(0, 25);

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className="flex items-center gap-1.5">
          <h3 className={styles.tableTitle}>Smart Money Traders (7D Realised PnL)</h3>
          <Tooltip content="Top traders on Hyperliquid ranked by 7-day realised PnL. Shows which smart money wallets are performing best.">
            <TooltipIcon />
          </Tooltip>
        </div>
      </div>
      <div className={styles.tableBody}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr className={styles.theadRow}>
              <th className={`${styles.th} ${styles.colIndex}`}>#</th>
              <th className={`${styles.th} ${styles.colAddress}`}>Trader</th>
              <th className={`${styles.th} ${styles.thRight} ${styles.colValue}`}>Realised PnL</th>
              <th className={`${styles.th} ${styles.thRight} ${styles.colOI}`}>Trades</th>
              <th className={`${styles.th} ${styles.colOI}`}>Bias</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {displayTraders.map((trader) => (
              <tr
                key={trader.address}
                className={styles.tbodyRow}
                title={trader.address}
              >
                <td className={`${styles.td} ${styles.tdMuted}`}>{trader.rank}</td>
                <td className={styles.td} title={trader.address}>
                  {trader.traderNameOrLabel}
                </td>
                <td
                  className={`${styles.td} ${styles.tdRight} ${
                    trader.realisedPnlUsd >= 0 ? styles.tdGreen : styles.tdRed
                  }`}
                >
                  {trader.realisedPnlUsd >= 0 ? '+' : ''}
                  {formatValue(trader.realisedPnlUsd)}
                </td>
                <td className={`${styles.td} ${styles.tdRight} ${styles.tdMuted}`}>
                  {trader.tradeCount !== undefined ? trader.tradeCount.toLocaleString() : '-'}
                </td>
                <td className={`${styles.td} ${
                  trader.bias === 'BULLISH' ? styles.tdGreen :
                  trader.bias === 'BEARISH' ? styles.tdRed :
                  styles.tdMuted
                }`}>
                  {trader.bias}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {displayTraders.length === 0 && (
        <div className={styles.noData}>No trader data available</div>
      )}
    </div>
  );
}
