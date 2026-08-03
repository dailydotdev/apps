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

const PIECE_COUNT = 28;

interface Piece {
  id: number;
  dx: number;
  dy: number;
  rotate: number;
  delayMs: number;
  durationMs: number;
  color: string;
}

// A one-shot celebratory burst from the top of the results screen: pieces fan
// out and fall once, then fade — no loop. Purely decorative; hidden entirely
// under prefers-reduced-motion (handled in CSS).
export const WeeklyQuizConfetti = (): ReactElement => {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, index) => ({
        id: index,
        dx: (Math.random() - 0.5) * 560,
        dy: 140 + Math.random() * 340,
        rotate: (Math.random() - 0.5) * 720,
        delayMs: Math.round(Math.random() * 140),
        durationMs: 1000 + Math.round(Math.random() * 700),
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
