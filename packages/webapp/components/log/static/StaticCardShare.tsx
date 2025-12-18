import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../../../types/log';
import { ARCHETYPES } from '../../../types/log';
import styles from './StaticCards.module.css';

interface StaticCardProps {
  data: Pick<
    LogData,
    'archetype' | 'archetypeStat' | 'totalPosts' | 'daysActive' | 'records'
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
  const streakRecord = data.records.find((r) => r.type === 'streak');

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

      {/* Archetype display */}
      <div className={styles.shareArchetypeDisplay}>
        <img
          src={archetype.imageUrl}
          alt={archetype.name}
          className={styles.shareArchetypeImage}
        />
        <div
          className={styles.shareArchetypeName}
          style={{ color: archetype.color }}
        >
          {archetype.name.toUpperCase()}
        </div>
      </div>

      {/* Stats row */}
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
            {streakRecord?.value || '—'}
          </span>
          <span className={styles.shareStatLabel}>streak</span>
        </div>
        <span className={styles.shareStatDot}>•</span>
        <div className={styles.shareStat}>
          <span className={styles.shareStatValue}>{data.daysActive}</span>
          <span className={styles.shareStatLabel}>days</span>
        </div>
      </div>

      {/* Thank you message */}
      <div className={styles.shareThankYou}>
        <p>Thanks for an incredible 2025.</p>
        <p>Can&apos;t wait to see what you&apos;ll read in 2026 🚀</p>
      </div>
    </div>
  );
}
