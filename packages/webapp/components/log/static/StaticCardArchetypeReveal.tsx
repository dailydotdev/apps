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
 * Matches the design of CardArchetypeReveal's reveal phase.
 */
export default function StaticCardArchetypeReveal({
  data,
}: StaticCardProps): ReactElement {
  const archetype = ARCHETYPES[data.archetype];

  return (
    <div
      className={styles.archetypeRevealContainer}
      style={{ '--archetype-color': archetype.color } as React.CSSProperties}
    >
      {/* Archetype image with glow ring */}
      <div className={styles.archetypeImageWrapper}>
        <div
          className={styles.archetypeImageGlowRing}
          style={{ borderColor: archetype.color }}
        />
        <img
          src={archetype.imageUrl}
          alt={archetype.name}
          className={styles.archetypeImage}
        />
      </div>

      {/* Archetype name badge */}
      <div className={styles.archetypeNameBadge}>
        <span
          className={styles.archetypeNameText}
          style={{ color: archetype.color }}
        >
          {archetype.name.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className={styles.archetypeRevealDescription}>
        &quot;{archetype.description}&quot;
      </p>

      {/* Stat badge - ticket stub style */}
      <div className={styles.archetypeStatBadge}>
        <span className={styles.archetypeStatBadgeText}>
          {data.archetypeStat}
        </span>
      </div>
    </div>
  );
}
