import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../../../types/log';
import { RECORDS } from '../../../types/log';
import styles from '../Log.module.css';

interface TrackListProps {
  /** Array of record items to display */
  records: LogData['records'];
  /** Whether to animate the track list (set false for static image generation) */
  animated?: boolean;
  /** Maximum number of tracks to show */
  maxItems?: number;
  /** Additional CSS class name */
  className?: string;
  /** Custom styles object for static cards using different CSS modules */
  customStyles?: {
    albumHeader?: string;
    albumLabel?: string;
    albumTitle?: string;
    albumYear?: string;
    trackList?: string;
    track?: string;
    trackNumber?: string;
    trackInfo?: string;
    trackTitleRow?: string;
    trackEmoji?: string;
    trackTitle?: string;
    trackArtist?: string;
    chartBadge?: string;
    chartBadgeTop?: string;
    chartBadgeValue?: string;
  };
}

/**
 * AlbumHeader - Album cover style header for the records card
 */
function AlbumHeader({
  animated,
  customStyles,
}: {
  animated: boolean;
  customStyles?: TrackListProps['customStyles'];
}): ReactElement {
  const s = {
    albumHeader: customStyles?.albumHeader ?? styles.albumHeader,
    albumLabel: customStyles?.albumLabel ?? styles.albumLabel,
    albumTitle: customStyles?.albumTitle ?? styles.albumTitle,
    albumYear: customStyles?.albumYear ?? styles.albumYear,
  };

  if (!animated) {
    return (
      <div className={s.albumHeader}>
        <span className={s.albumLabel}>YOUR</span>
        <span className={s.albumTitle}>GREATEST</span>
        <span className={s.albumTitle}>HITS</span>
        <span className={s.albumYear}>— 2025 —</span>
      </div>
    );
  }

  return (
    <motion.div
      className={s.albumHeader}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
    >
      <span className={s.albumLabel}>YOUR</span>
      <span className={s.albumTitle}>GREATEST</span>
      <span className={s.albumTitle}>HITS</span>
      <span className={s.albumYear}>— 2025 —</span>
    </motion.div>
  );
}

/**
 * TrackItem - Single track in the list
 */
function TrackItem({
  record,
  index,
  animated,
  customStyles,
}: {
  record: LogData['records'][number];
  index: number;
  animated: boolean;
  customStyles?: TrackListProps['customStyles'];
}): ReactElement {
  const s = {
    track: customStyles?.track ?? styles.track,
    trackNumber: customStyles?.trackNumber ?? styles.trackNumber,
    trackInfo: customStyles?.trackInfo ?? styles.trackInfo,
    trackTitleRow: customStyles?.trackTitleRow ?? styles.trackTitleRow,
    trackEmoji: customStyles?.trackEmoji ?? styles.trackEmoji,
    trackTitle: customStyles?.trackTitle ?? styles.trackTitle,
    trackArtist: customStyles?.trackArtist ?? styles.trackArtist,
    chartBadge: customStyles?.chartBadge ?? styles.chartBadge,
    chartBadgeTop: customStyles?.chartBadgeTop ?? styles.chartBadgeTop,
    chartBadgeValue: customStyles?.chartBadgeValue ?? styles.chartBadgeValue,
  };

  const trackNumber = String(index + 1).padStart(2, '0');
  const emoji = RECORDS[record.type]?.emoji || '🎯';

  if (!animated) {
    return (
      <div className={s.track}>
        <span className={s.trackNumber}>{trackNumber}</span>
        <div className={s.trackInfo}>
          <div className={s.trackTitleRow}>
            <span className={s.trackEmoji}>{emoji}</span>
            <span className={s.trackTitle}>{record.value}</span>
          </div>
          <span className={s.trackArtist}>{record.label}</span>
        </div>
        {record.percentile && (
          <div className={s.chartBadge}>
            <span className={s.chartBadgeTop}>TOP</span>
            <span className={s.chartBadgeValue}>{record.percentile}%</span>
          </div>
        )}
      </div>
    );
  }

  const baseDelay = 0.5 + index * 0.2;

  return (
    <motion.div
      className={s.track}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: baseDelay,
        type: 'spring',
        stiffness: 120,
        damping: 14,
      }}
    >
      <motion.span
        className={s.trackNumber}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: baseDelay + 0.1,
          type: 'spring',
          stiffness: 300,
        }}
      >
        {trackNumber}
      </motion.span>
      <div className={s.trackInfo}>
        <div className={s.trackTitleRow}>
          <span className={s.trackEmoji}>{emoji}</span>
          <span className={s.trackTitle}>{record.value}</span>
        </div>
        <span className={s.trackArtist}>{record.label}</span>
      </div>
      {record.percentile && (
        <motion.div
          className={s.chartBadge}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: baseDelay + 0.3,
            type: 'spring',
            stiffness: 200,
          }}
        >
          <span className={s.chartBadgeTop}>TOP</span>
          <span className={s.chartBadgeValue}>{record.percentile}%</span>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * TrackList - Album-style track listing for user records
 *
 * Displays personal records in a music album track listing format.
 * Supports both animated (interactive cards) and static (image generation) modes.
 *
 * @example
 * ```tsx
 * // Interactive card (animated)
 * <TrackList records={data.records} animated />
 *
 * // Static card (no animation, limited items)
 * <TrackList records={data.records} animated={false} maxItems={3} />
 * ```
 */
export default function TrackList({
  records,
  animated = true,
  maxItems,
  className,
  customStyles,
}: TrackListProps): ReactElement {
  const s = {
    trackList: customStyles?.trackList ?? styles.trackList,
  };

  const displayRecords = maxItems ? records.slice(0, maxItems) : records;
  const containerClass = className
    ? `${s.trackList} ${className}`
    : s.trackList;

  return (
    <>
      <AlbumHeader animated={animated} customStyles={customStyles} />
      <div className={containerClass}>
        {displayRecords.map((record, index) => (
          <TrackItem
            key={record.type}
            record={record}
            index={index}
            animated={animated}
            customStyles={customStyles}
          />
        ))}
      </div>
    </>
  );
}
