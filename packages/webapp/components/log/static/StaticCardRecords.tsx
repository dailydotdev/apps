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
 * Shows user's personal records/achievements in album track listing style.
 */
export default function StaticCardRecords({
  data,
}: StaticCardProps): ReactElement {
  return (
    <>
      {/* Album-style header */}
      <div className={styles.albumHeader}>
        <span className={styles.albumLabel}>YOUR</span>
        <span className={styles.albumTitle}>GREATEST</span>
        <span className={styles.albumTitle}>HITS</span>
        <span className={styles.albumYear}>— 2025 —</span>
      </div>

      {/* Track listing */}
      <div className={styles.trackList}>
        {data.records.slice(0, 3).map((record, index) => (
          <div key={record.type} className={styles.track}>
            {/* Track number */}
            <span className={styles.trackNumber}>
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Track info */}
            <div className={styles.trackInfo}>
              <div className={styles.trackTitleRow}>
                <span className={styles.trackEmoji}>
                  {RECORDS[record.type]?.emoji || '🎯'}
                </span>
                <span className={styles.trackTitle}>{record.value}</span>
              </div>
              <span className={styles.trackArtist}>{record.label}</span>
            </div>

            {/* Chart position badge */}
            {record.percentile && (
              <div className={styles.chartBadge}>
                <span className={styles.chartBadgeTop}>TOP</span>
                <span className={styles.chartBadgeValue}>
                  {record.percentile}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
