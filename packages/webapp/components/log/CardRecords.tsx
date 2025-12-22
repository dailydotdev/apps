import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { RECORDS } from '../../types/log';
import styles from './Log.module.css';
import ShareStatButton from './ShareStatButton';
import type { BaseCardProps } from './types';

export default function CardRecords({
  data,
  isActive,
  cardType,
  imageCache,
  onImageFetched,
}: BaseCardProps): ReactElement {
  return (
    <>
      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        {/* Album-style header */}
        <motion.div
          className={styles.albumHeader}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
        >
          <span className={styles.albumLabel}>YOUR</span>
          <span className={styles.albumTitle}>GREATEST</span>
          <span className={styles.albumTitle}>HITS</span>
          <span className={styles.albumYear}>— 2025 —</span>
        </motion.div>

        {/* Track listing */}
        <div className={styles.trackList}>
          {data.records.map((record, index) => (
            <motion.div
              key={record.type}
              className={styles.track}
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
                className={styles.trackNumber}
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
                <motion.div
                  className={styles.chartBadge}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.8 + index * 0.2,
                    type: 'spring',
                    stiffness: 200,
                  }}
                >
                  <span className={styles.chartBadgeTop}>TOP</span>
                  <span className={styles.chartBadgeValue}>
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
        cardType={cardType}
        imageCache={imageCache}
        onImageFetched={onImageFetched}
        statText="my 2025 greatest records on daily.dev"
      />
    </>
  );
}
