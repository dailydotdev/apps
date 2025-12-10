import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../types';
import styles from '../Log.module.css';

interface CardProps {
  data: LogData;
  cardNumber: number;
  totalCards: number;
  cardLabel: string;
  isActive: boolean;
}

export default function CardRecords({
  data,
  cardNumber,
  cardLabel,
  isActive,
}: CardProps): ReactElement {
  return (
    <>
      {/* Card indicator */}
      <div className={styles.cardIndicator}>
        <span className={styles.cardNum}>
          {String(cardNumber).padStart(2, '0')}
        </span>
        <span className={styles.cardSep}>—</span>
        <span className={styles.cardLabel}>{cardLabel}</span>
      </div>

      {/* Main headline */}
      <div className={styles.headlineStack}>
        <div className={styles.headlineRow}>
          <span className={styles.headlineSmall}>Your 2025</span>
        </div>
        <div className={styles.headlineRow}>
          <span className={styles.headlineMedium}>PERSONAL BESTS</span>
        </div>
      </div>

      {/* Records list */}
      <div className={styles.recordsList}>
        {data.records.map((record, index) => (
          <div
            key={record.type}
            className={styles.recordItem}
            style={{
              animationDelay: isActive ? `${0.6 + index * 0.2}s` : '0s',
            }}
          >
            <div>
              <div className={styles.recordLabel}>{record.label}</div>
              <div className={styles.recordValue}>{record.value}</div>
            </div>
            {record.percentile && (
              <div className={styles.recordBadge}>TOP {record.percentile}%</div>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <div className={styles.dividerIcon}>◆</div>
        <div className={styles.dividerLine} />
      </div>
    </>
  );
}
