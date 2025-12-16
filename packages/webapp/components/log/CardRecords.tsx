import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../../types/log';
import { RECORDS } from '../../types/log';
import styles from './Log.module.css';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';

interface CardProps {
  data: LogData;
  isActive: boolean;
  subcard?: number;
  isTouchDevice?: boolean;
}

export default function CardRecords({
  data,
  isActive,
}: CardProps): ReactElement {
  return (
    <>
      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        {/* Album-style header */}
        <motion.div
          className={cardStyles.albumHeader}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
        >
          <span className={cardStyles.albumLabel}>YOUR</span>
          <span className={cardStyles.albumTitle}>GREATEST</span>
          <span className={cardStyles.albumTitle}>HITS</span>
          <span className={cardStyles.albumYear}>— 2025 —</span>
        </motion.div>

        {/* Track listing */}
        <div className={cardStyles.trackList}>
          {data.records.map((record, index) => (
            <motion.div
              key={record.type}
              className={cardStyles.track}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5 + index * 0.2,
                type: 'spring',
                stiffness: 120,
                damping: 14,
              }}
            >
              {/* Track number */}
              <motion.span
                className={cardStyles.trackNumber}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.6 + index * 0.2,
                  type: 'spring',
                  stiffness: 300,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </motion.span>

              {/* Track info */}
              <div className={cardStyles.trackInfo}>
                <div className={cardStyles.trackTitleRow}>
                  <span className={cardStyles.trackEmoji}>
                    {RECORDS[record.type]?.emoji || '🎯'}
                  </span>
                  <span className={cardStyles.trackTitle}>{record.value}</span>
                </div>
                <span className={cardStyles.trackArtist}>{record.label}</span>
              </div>

              {/* Chart position badge */}
              {record.percentile && (
                <motion.div
                  className={cardStyles.chartBadge}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.8 + index * 0.2,
                    type: 'spring',
                    stiffness: 200,
                  }}
                >
                  <span className={cardStyles.chartBadgeTop}>TOP</span>
                  <span className={cardStyles.chartBadgeValue}>
                    {record.percentile}%
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Share button - pushed to bottom with margin-top: auto */}
      <ShareStatButton
        delay={1.4}
        isActive={isActive}
        statText={`My 2025 Greatest Hits on daily.dev 🎵\n\n${data.records
          .map(
            (r, i) =>
              `${String(i + 1).padStart(2, '0')}. ${
                RECORDS[r.type]?.emoji || '🎯'
              } ${r.label}: ${r.value}${
                r.percentile ? ` (TOP ${r.percentile}%)` : ''
              }`,
          )
          .join('\n')}`}
      />
    </>
  );
}
