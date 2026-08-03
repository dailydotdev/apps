import type { CSSProperties, ReactElement } from 'react';
import React, { useMemo } from 'react';
import styles from '../WeeklyQuiz.module.css';

// Brand-accent confetti colors.
const COLORS = [
  'var(--theme-accent-cabbage-default)',
  'var(--theme-accent-onion-default)',
  'var(--theme-accent-cheese-default)',
  'var(--theme-accent-avocado-default)',
  'var(--theme-accent-bacon-default)',
  'var(--theme-accent-bun-default)',
];

const PIECE_COUNT = 46;

interface Piece {
  id: number;
  leftPct: number;
  dx: number;
  dy: number;
  rotate: number;
  delayMs: number;
  durationMs: number;
  color: string;
}

// A one-shot celebratory rain from the top of the results screen: pieces start
// spread across the full width and fall the length of the page once, then fade
// — no loop. Purely decorative; hidden entirely under prefers-reduced-motion
// (handled in CSS).
export const WeeklyQuizConfetti = (): ReactElement => {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, index) => ({
        id: index,
        // Spread the start position across the whole width.
        leftPct: Math.random() * 100,
        // Small horizontal drift; the fall does the work.
        dx: (Math.random() - 0.5) * 180,
        // Fall far enough to cover the tall results page.
        dy: 360 + Math.random() * 680,
        rotate: (Math.random() - 0.5) * 720,
        delayMs: Math.round(Math.random() * 240),
        durationMs: 1100 + Math.round(Math.random() * 900),
        color: COLORS[index % COLORS.length],
      })),
    [],
  );

  return (
    <div className={styles.confetti} aria-hidden>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={styles.confettiPiece}
          style={
            {
              color: piece.color,
              left: `${piece.leftPct}%`,
              animationDelay: `${piece.delayMs}ms`,
              animationDuration: `${piece.durationMs}ms`,
              '--confetti-dx': `${piece.dx}px`,
              '--confetti-dy': `${piece.dy}px`,
              '--confetti-r': `${piece.rotate}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
};
