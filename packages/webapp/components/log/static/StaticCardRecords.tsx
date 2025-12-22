import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';
import { TrackList } from '../primitives';

interface StaticCardProps {
  data: Pick<LogData, 'records'>;
}

/**
 * Static Records card for share image generation.
 * Shows user's personal records/achievements in album track listing style.
 * Uses shared TrackList primitive with animated=false for consistency.
 */
export default function StaticCardRecords({
  data,
}: StaticCardProps): ReactElement {
  return (
    <TrackList
      records={data.records}
      animated={false}
      maxItems={3}
      customStyles={{
        albumHeader: styles.albumHeader,
        albumLabel: styles.albumLabel,
        albumTitle: styles.albumTitle,
        albumYear: styles.albumYear,
        trackList: styles.trackList,
        track: styles.track,
        trackNumber: styles.trackNumber,
        trackInfo: styles.trackInfo,
        trackTitleRow: styles.trackTitleRow,
        trackEmoji: styles.trackEmoji,
        trackTitle: styles.trackTitle,
        trackArtist: styles.trackArtist,
        chartBadge: styles.chartBadge,
        chartBadgeTop: styles.chartBadgeTop,
        chartBadgeValue: styles.chartBadgeValue,
      }}
    />
  );
}
