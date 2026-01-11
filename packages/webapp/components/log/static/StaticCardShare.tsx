import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { LogData } from '../../../types/log';
import { RecordType, ARCHETYPES, RECORDS } from '../../../types/log';
import styles from './StaticCards.module.css';
import { getPeakReadingHour } from '../../../hooks/log/useLogStats';
import { shouldShowPercentileBanner } from '../primitives/utils';

interface StaticCardProps {
  data: Pick<
    LogData,
    | 'archetype'
    | 'archetypeStat'
    | 'totalImpactPercentile'
    | 'totalPosts'
    | 'totalReadingTime'
    | 'daysActive'
    | 'records'
    | 'uniqueTopics'
    | 'uniqueSources'
    | 'upvotesGiven'
    | 'commentsWritten'
    | 'postsBookmarked'
    | 'activityHeatmap'
  >;
}

/**
 * Static Share card for share image generation.
 * Matches the CardShare.tsx design with receipt-style stats.
 */
export default function StaticCardShare({
  data,
}: StaticCardProps): ReactElement {
  const archetype = ARCHETYPES[data.archetype];

  // Calculate total interactions
  const totalInteractions =
    data.upvotesGiven + data.commentsWritten + data.postsBookmarked;

  const peakHour = data.activityHeatmap?.length
    ? getPeakReadingHour(data.activityHeatmap).formatted
    : '12PM';

  // Get the best record (prefer one with a percentile, or first available)
  // Skip YEAR_ACTIVE record as it's not meaningful for sharing
  const bestRecord = useMemo(() => {
    const eligibleRecords =
      data.records?.filter(
        (r) =>
          ![RecordType.YEAR_ACTIVE, RecordType.TOPIC_MARATHON].includes(r.type),
      ) ?? [];
    if (!eligibleRecords.length) {
      return null;
    }
    const withPercentile = eligibleRecords.filter((r) => r.percentile != null);
    if (withPercentile.length > 0) {
      return withPercentile.reduce((best, curr) =>
        (curr.percentile ?? 100) < (best.percentile ?? 100) ? curr : best,
      );
    }
    return eligibleRecords[0];
  }, [data.records]);

  return (
    <div
      className={styles.shareCardNew}
      style={{ '--archetype-color': archetype.color } as React.CSSProperties}
    >
      {/* "That's a wrap" stamp - matches shareOfficialStamp */}
      <div className={styles.shareOfficialStamp}>
        <span className={styles.shareOfficialText}>That&apos;s a wrap</span>
      </div>

      {/* Main headline - "YOU ARE" + archetype name */}
      <div className={styles.shareMainHeadline}>
        <span className={styles.shareYouAre}>YOU ARE</span>
        <span className={styles.shareArchetypeTitle}>
          {archetype.name.toUpperCase()}
        </span>
      </div>

      {/* Avatar with glow effect */}
      <div className={styles.shareAvatarWrapper}>
        <div
          className={styles.shareAvatarGlow}
          style={{ background: archetype.color }}
        />
        <img
          src={archetype.imageUrl}
          alt={archetype.name}
          className={styles.shareAvatarImage}
        />
        <div
          className={styles.shareAvatarRing}
          style={{ borderColor: archetype.color }}
        />
      </div>

      {/* Archetype description */}
      <p className={styles.shareArchetypeDescriptionText}>
        {archetype.description}
      </p>

      {/* Receipt-style stats card */}
      <div className={styles.shareReceiptCard}>
        <div className={styles.shareReceiptRow}>
          <span className={styles.shareReceiptLabel}>📚 POSTS READ</span>
          <span className={styles.shareReceiptValue}>
            {data.totalPosts.toLocaleString()}
          </span>
        </div>

        <div className={styles.shareReceiptRow}>
          <span className={styles.shareReceiptLabel}>📅 DAYS ACTIVE</span>
          <span className={styles.shareReceiptValue}>{data.daysActive}</span>
        </div>

        <div className={styles.shareReceiptRow}>
          <span className={styles.shareReceiptLabel}>🕐 PEAK HOUR</span>
          <span className={styles.shareReceiptValue}>{peakHour}</span>
        </div>

        <div className={styles.shareReceiptRow}>
          <span className={styles.shareReceiptLabel}>🏷️ TOPICS EXPLORED</span>
          <span className={styles.shareReceiptValue}>{data.uniqueTopics}</span>
        </div>

        <div className={styles.shareReceiptRow}>
          <span className={styles.shareReceiptLabel}>📰 SOURCES READ</span>
          <span className={styles.shareReceiptValue}>{data.uniqueSources}</span>
        </div>

        <div className={styles.shareReceiptRow}>
          <span className={styles.shareReceiptLabel}>💬 INTERACTIONS</span>
          <span className={styles.shareReceiptValue}>
            {totalInteractions.toLocaleString()}
          </span>
        </div>

        {bestRecord && (
          <div className={styles.shareReceiptRow}>
            <span className={styles.shareReceiptLabel}>
              {RECORDS[bestRecord.type].emoji}{' '}
              {RECORDS[bestRecord.type].defaultLabel.toUpperCase()}
            </span>
            <span className={styles.shareReceiptValue}>{bestRecord.label}</span>
          </div>
        )}

        {shouldShowPercentileBanner(data.totalImpactPercentile) && (
          <div className={styles.shareReceiptFooter}>
            <span className={styles.shareReceiptRank}>
              TOP {data.totalImpactPercentile}% OF DEVS
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
