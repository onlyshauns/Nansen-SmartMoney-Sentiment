'use client';

import styles from './TableStyles.module.css';
import Tooltip, { TooltipIcon } from './Tooltip';

interface Token {
  symbol: string;
  address: string;
  chain: string;
  netOutflow: number;
  buyCount: number;
  sellCount: number;
}

interface SmartMoneyOutflowsWidgetProps {
  tokens: Token[];
}

export default function SmartMoneyOutflowsWidget({ tokens }: SmartMoneyOutflowsWidgetProps) {
  const openTokenGodMode = (address: string, chain: string) => {
    const chainMap: Record<string, string> = {
      ethereum: 'ethereum',
      base: 'base',
      polygon: 'polygon',
      arbitrum: 'arbitrum',
      optimism: 'optimism',
    };
    const nansenChain = chainMap[chain.toLowerCase()] || 'ethereum';
    window.open(`https://app.nansen.ai/token/${address}?chain=${nansenChain}`, '_blank');
  };

  const formatChain = (chain: string) => {
    const chainMap: Record<string, string> = {
      ethereum: 'ETH',
      base: 'BASE',
      polygon: 'POLY',
      arbitrum: 'ARB',
      optimism: 'OP',
    };
    return chainMap[chain.toLowerCase()] || chain.toUpperCase();
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

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className="flex items-center gap-1.5">
          <h3 className={styles.tableTitle}>Outflows (24h)</h3>
          <Tooltip content="Top tokens with the highest net outflow (USD) from smart money spot flows in the last 24 hours. Updates hourly.">
            <TooltipIcon />
          </Tooltip>
        </div>
      </div>

      <div className={styles.tableBody}>
        {tokens.length === 0 ? (
          <div className={styles.noData}>No data</div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.theadRow}>
                <th className={`${styles.th} ${styles.colIndex}`}>#</th>
                <th className={`${styles.th} ${styles.colChain}`}>Chain</th>
                <th className={`${styles.th} ${styles.colToken}`}>Token</th>
                <th className={`${styles.th} ${styles.thRight} ${styles.colValue}`}>Value</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {tokens.slice(0, 10).map((token, index) => (
                <tr
                  key={`${token.address}-${token.chain}`}
                  className={styles.tbodyRow}
                  onClick={() => openTokenGodMode(token.address, token.chain)}
                >
                  <td className={`${styles.td} ${styles.tdMuted}`}>{index + 1}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{formatChain(token.chain)}</td>
                  <td className={styles.td}>{token.symbol}</td>
                  <td className={`${styles.td} ${styles.tdRight} ${styles.tdRed}`}>
                    -{formatValue(token.netOutflow)}
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
