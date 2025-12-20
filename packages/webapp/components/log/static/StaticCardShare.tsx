import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../../../types/log';
import { ARCHETYPES, RecordType } from '../../../types/log';
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
  >;
}

/**
 * Static Share card for share image generation.
 * Shows the final wrap-up with archetype and key stats.
 */
export default function StaticCardShare({
  data,
}: StaticCardProps): ReactElement {
  const archetype = ARCHETYPES[data.archetype];
  const streakRecord = data.records.find((r) => r.type === RecordType.STREAK);

  // Calculate total community engagement
  const totalEngagement =
    data.upvotesGiven + data.commentsWritten + data.postsBookmarked;

  return (
    <div
      className={styles.shareCard}
      style={{ '--archetype-color': archetype.color } as React.CSSProperties}
    >
      {/* Header */}
      <div className={styles.shareWrapHeader}>
        <span className={styles.shareWrapLabel}>THAT&apos;S</span>
        <span className={styles.shareWrapTitle}>A WRAP</span>
        <span className={styles.shareWrapYear}>— 2025 —</span>
      </div>

      {/* Archetype badge */}
      <div className={styles.wrapArchetypeBadge}>
        <img
          src={archetype.imageUrl}
          alt={archetype.name}
          className={styles.wrapArchetypeImg}
        />
        <div className={styles.wrapArchetypeInfo}>
          <div
            className={styles.wrapArchetypeName}
            style={{ color: archetype.color }}
          >
            {archetype.name.toUpperCase()}
          </div>
          <div className={styles.wrapArchetypePercentile}>
            TOP {data.archetypePercentile}%
          </div>
        </div>
      </div>

      {/* Stats badges row */}
      <div className={styles.shareStatsRow}>
        <div className={styles.shareStat}>
          <span className={styles.shareStatValue}>
            {data.totalPosts.toLocaleString()}
          </span>
          <span className={styles.shareStatLabel}>posts</span>
        </div>
        <span className={styles.shareStatDot}>•</span>
        <div className={styles.shareStat}>
          <span className={styles.shareStatValue}>
            {data.totalReadingTime}h
          </span>
          <span className={styles.shareStatLabel}>reading</span>
        </div>
        <span className={styles.shareStatDot}>•</span>
        <div className={styles.shareStat}>
          <span className={styles.shareStatValue}>{data.daysActive}</span>
          <span className={styles.shareStatLabel}>days</span>
        </div>
      </div>

      {/* Secondary stats */}
      <div className={styles.wrapSecondaryStats}>
        {streakRecord && (
          <div className={styles.wrapSecondaryStat}>
            <span className={styles.wrapSecondaryIcon}>🔥</span>
            <span className={styles.wrapSecondaryValue}>
              {streakRecord.value}
            </span>
          </div>
        )}
        <div className={styles.wrapSecondaryStat}>
          <span className={styles.wrapSecondaryIcon}>🏷️</span>
          <span className={styles.wrapSecondaryValue}>
            {data.uniqueTopics} topics
          </span>
        </div>
        <div className={styles.wrapSecondaryStat}>
          <span className={styles.wrapSecondaryIcon}>📰</span>
          <span className={styles.wrapSecondaryValue}>
            {data.uniqueSources} sources
          </span>
        </div>
      </div>

      {/* Community stats */}
      <div className={styles.wrapCommunityRow}>
        <div className={styles.wrapCommunityItem}>
          <span>👍</span>
          <span>{data.upvotesGiven.toLocaleString()}</span>
        </div>
        <div className={styles.wrapCommunityItem}>
          <span>💬</span>
          <span>{data.commentsWritten.toLocaleString()}</span>
        </div>
        <div className={styles.wrapCommunityItem}>
          <span>🔖</span>
          <span>{data.postsBookmarked.toLocaleString()}</span>
        </div>
        <span className={styles.wrapCommunityTotal}>
          = {totalEngagement.toLocaleString()} interactions
        </span>
      </div>

      {/* Thank you message */}
      <div className={styles.shareThankYou}>
        <p>Thanks for an incredible 2025.</p>
        <p>Can&apos;t wait to see what you&apos;ll read in 2026 🚀</p>
      </div>
    </div>
  );
}
