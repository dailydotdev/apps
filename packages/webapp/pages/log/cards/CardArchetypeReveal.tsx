import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';
import type { LogData } from '../types';
import { ARCHETYPES } from '../types';
import styles from '../Log.module.css';

interface CardProps {
  data: LogData;
  cardNumber: number;
  totalCards: number;
  cardLabel: string;
  isActive: boolean;
}

const BUILD_UP_LINES = [
  "We've seen how you read...",
  'We know when you read...',
  'We tracked what you love...',
  'Now let\'s see WHO you are...',
];

export default function CardArchetypeReveal({
  data,
  cardNumber,
  cardLabel,
  isActive,
}: CardProps): ReactElement {
  const [revealPhase, setRevealPhase] = useState(0);
  const archetype = ARCHETYPES[data.archetype];

  // Sequence the reveal when card becomes active
  useEffect(() => {
    if (!isActive) {
      setRevealPhase(0);
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    // Build up lines
    BUILD_UP_LINES.forEach((_, index) => {
      timers.push(
        setTimeout(() => setRevealPhase(index + 1), 800 + index * 1000),
      );
    });

    // Final reveal
    timers.push(
      setTimeout(
        () => setRevealPhase(BUILD_UP_LINES.length + 1),
        800 + BUILD_UP_LINES.length * 1000 + 800,
      ),
    );

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  const showReveal = revealPhase > BUILD_UP_LINES.length;

  return (
    <>
      {/* Card indicator */}
      <div className={styles.cardIndicator}>
        <span className={styles.cardNum}>
          {String(cardNumber).padStart(2, '0')}
        </span>
        <span className={styles.cardSep}>—</span>
        <span className={styles.cardLabel}>{cardLabel}</span>
      </div>

      <div className={styles.archetypeReveal}>
        {/* Build up phase */}
        {!showReveal && (
          <div className={styles.archetypeBuildUp}>
            {BUILD_UP_LINES.map((line, index) => (
              <div
                key={line}
                className={styles.buildUpLine}
                style={{
                  animationDelay: `${index * 1}s`,
                  animationPlayState: isActive && revealPhase > index ? 'running' : 'paused',
                  opacity: revealPhase > index ? 1 : 0,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}

        {/* The reveal */}
        {showReveal && (
          <>
            <span
              className={styles.archetypeEmoji}
              style={{ animationDelay: '0s' }}
            >
              {archetype.emoji}
            </span>
            <div
              className={styles.archetypeName}
              style={{ color: archetype.color }}
            >
              {archetype.name.toUpperCase()}
            </div>
            <p className={styles.archetypeDescription}>{archetype.description}</p>

            {/* Stat banner */}
            <div className={styles.celebrationBanner} style={{ marginTop: '1.5rem' }}>
              <div className={styles.bannerBg} />
              <div className={styles.bannerContent}>
                <span className={styles.bannerPost}>{data.archetypeStat}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
