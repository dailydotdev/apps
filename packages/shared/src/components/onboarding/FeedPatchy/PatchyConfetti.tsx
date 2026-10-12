import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import styles from './FeedPatchy.module.css';

// Fired once when the commitment lands. Deterministic so every run looks the
// same; three shapes and four tones so it reads as a shower, not a grid.
const pieces = Array.from({ length: 28 }, (_, index) => {
  const angle = -Math.PI * (0.15 + (0.7 * index) / 27) + (index % 3) * 0.08;
  return {
    id: index,
    cos: Math.cos(angle),
    sin: Math.sin(angle),
    distance: 90 + (index % 5) * 26,
    spin: 240 + (index % 7) * 90,
    delay: (index % 4) * 40,
    duration: 1200 + (index % 5) * 120,
    shape: index % 3,
    tone: index % 4,
  };
});

const tones = [
  'bg-accent-cheese-default',
  'bg-accent-bun-default',
  'bg-accent-cheese-subtle',
  classNames(styles.spark, 'bg-white'),
];

const shapes = [
  'h-3.5 w-2 rounded-2',
  'size-2.5 rounded-full',
  'h-2 w-4 rounded-2',
];

interface PatchyConfettiProps {
  /** Where the burst starts, inside the nearest positioned parent. */
  origin: { left: string; top: string };
}

export const PatchyConfetti = ({
  origin,
}: PatchyConfettiProps): ReactElement => (
  <span aria-hidden className="pointer-events-none absolute z-2" style={origin}>
    {pieces.map(
      ({ id, cos, sin, distance, spin, delay, duration, shape, tone }) => (
        <span
          key={id}
          className={classNames(
            styles.confetti,
            'absolute -left-1 -top-1 shadow-[0_0_0.375rem_color-mix(in_srgb,var(--theme-accent-cheese-default)_60%,transparent)]',
            shapes[shape],
            tones[tone],
          )}
          style={
            {
              '--fp-dx': `${Math.round(cos * distance)}px`,
              '--fp-dy': `${Math.round(sin * distance)}px`,
              '--fp-spin': `${spin}deg`,
              '--fp-delay': `${delay}ms`,
              '--fp-duration': `${duration}ms`,
            } as CSSProperties
          }
        />
      ),
    )}
  </span>
);
