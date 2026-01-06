import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { LogData } from '../../../types/log';
import { ARCHETYPES, RECORDS } from '../../../types/log';
import styles from './StaticCards.module.css';

interface StaticCardProps {
  data: Pick<
    LogData,
    | 'archetype'
    | 'archetypeStat'
    | 'archetypePercentile'
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

  // Find peak reading hour from heatmap (24-element array of floats summing to 1)
  const peakHour = useMemo(() => {
    if (!data.activityHeatmap?.length) {
      return '12PM';
    }
    let maxActivity = 0;
    let bestHour = 0;
    data.activityHeatmap.forEach((activity, hour) => {
      if (activity > maxActivity) {
        maxActivity = activity;
        bestHour = hour;
      }
    });
    const suffix = bestHour >= 12 ? 'PM' : 'AM';
    const displayHour = bestHour % 12 || 12;
    return `${displayHour}${suffix}`;
  }, [data.activityHeatmap]);

  // Get the best record (prefer one with a percentile, or first available)
  const bestRecord = useMemo(() => {
    if (!data.records?.length) {
      return null;
    }
    const withPercentile = data.records.filter((r) => r.percentile != null);
    if (withPercentile.length > 0) {
      return withPercentile.reduce((best, curr) =>
        (curr.percentile ?? 100) < (best.percentile ?? 100) ? curr : best,
      );
    }
    return data.records[0];
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
              {RECORDS[bestRecord.type].emoji} {bestRecord.label.toUpperCase()}
            </span>
            <span className={styles.shareReceiptValue}>{bestRecord.value}</span>
          </div>
        )}

        <div className={styles.shareReceiptFooter}>
          <span className={styles.shareReceiptRank}>
            TOP {data.archetypePercentile}% OF DEVS
          </span>
        </div>
      </div>
    </div>
  );
}
