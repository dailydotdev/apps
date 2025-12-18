import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../../../types/log';
import { ARCHETYPES } from '../../../types/log';
import styles from './StaticCards.module.css';

interface StaticCardProps {
  data: Pick<LogData, 'archetype' | 'archetypeStat' | 'archetypePercentile'>;
}

/**
 * Static Archetype Reveal card for share image generation.
 * Shows the user's developer archetype with explanatory context.
 */
export default function StaticCardArchetypeReveal({
  data,
}: StaticCardProps): ReactElement {
  const archetype = ARCHETYPES[data.archetype];

  return (
    <div
      className={styles.archetypeReveal}
      style={{ '--archetype-color': archetype.color } as React.CSSProperties}
    >
      {/* Explanatory title for context */}
      <div className={styles.archetypeTitle}>
        <span className={styles.archetypeTitleSmall}>Your Developer Archetype</span>
        <span className={styles.archetypeTitleSub}>Based on your 2025 reading habits</span>
      </div>

      {/* Archetype image */}
      <div className={styles.archetypeImageWrapper}>
        <div className={styles.archetypeImageGlow} />
        <img
          src={archetype.imageUrl}
          alt={archetype.name}
          className={styles.archetypeImage}
        />
      </div>

      {/* Archetype name */}
      <div className={styles.archetypeName} style={{ color: archetype.color }}>
        {archetype.name.toUpperCase()}
      </div>

      {/* Description */}
      <p className={styles.archetypeDescription}>
        &quot;{archetype.description}&quot;
      </p>

      {/* Stat badge */}
      <div className={styles.archetypeStatBadge}>{data.archetypeStat}</div>
    </div>
  );
}
