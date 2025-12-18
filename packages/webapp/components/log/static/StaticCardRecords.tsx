import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../../../types/log';
import { RECORDS } from '../../../types/log';
import styles from './StaticCards.module.css';

interface StaticCardProps {
  data: Pick<LogData, 'records'>;
}

/**
 * Static Records card for share image generation.
 * Shows user's personal records/achievements.
 */
export default function StaticCardRecords({
  data,
}: StaticCardProps): ReactElement {
  return (
    <>
      {/* Album-style header */}
      <div className={styles.headlineStack}>
        <span className={styles.headlineSmall}>Your</span>
        <span className={styles.headlineBigSmall}>GREATEST</span>
        <span className={styles.headlineMedium}>HITS</span>
        <span className={styles.headlineAccent}>— 2025 —</span>
      </div>

      {/* Records list */}
      <div className={styles.recordsList}>
        {data.records.slice(0, 3).map((record) => (
          <div key={record.type} className={styles.recordItem}>
            <div className={styles.recordInfo}>
              <span className={styles.recordLabel}>
                {RECORDS[record.type]?.emoji || '🎯'} {record.label}
              </span>
              <span className={styles.recordValue}>{record.value}</span>
            </div>
            {record.percentile && (
              <span className={styles.recordBadge}>
                TOP {record.percentile}%
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
