import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import { usePrefersReducedMotion } from '../useGivebackMotion';

// Money-forward palette: gold + green lead (cash/coins), brand accents fill in.
const CONFETTI_COLORS = [
  'var(--theme-accent-cheese-default)',
  'var(--theme-accent-avocado-default)',
  'var(--theme-accent-cabbage-default)',
  'var(--theme-accent-bacon-default)',
];

interface ConfettiPiece {
  id: string;
  dx: number;
  dy: number;
  rotate: number;
  delayMs: number;
  durationMs: number;
  color: string;
}

// Fan the pieces mostly upward and outward, then let gravity pull them down:
// a quick celebratory pop rather than a full-screen confetti dump.
const buildPieces = (count: number, spread: number): ConfettiPiece[] => {
  return Array.from({ length: count }, (_, index) => {
    const angle = Math.PI + (Math.PI * (index + 0.5)) / count; // upper half
    const distance = spread * (0.6 + Math.random() * 0.6);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance + spread * (0.35 + Math.random());

    return {
      id: `giveback-confetti-${index.toString()}`,
      dx,
      dy,
      rotate: (Math.random() - 0.5) * 540,
      delayMs: Math.round(Math.random() * 90),
      durationMs: 760 + Math.round(Math.random() * 320),
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    };
  });
};

export interface GivebackConfettiBurstProps {
  // Bump to replay the burst (each new value spawns a fresh set of pieces).
  trigger: number;
  pieceCount?: number;
  spread?: number;
  onDone?: () => void;
  className?: string;
}

export const GivebackConfettiBurst = ({
  trigger,
  pieceCount = 18,
  spread = 88,
  onDone,
  className,
}: GivebackConfettiBurstProps): ReactElement | null => {
  const reduced = usePrefersReducedMotion();

  const pieces = useMemo(
    () => (reduced ? [] : buildPieces(pieceCount, spread)),
    // trigger intentionally re-seeds the pieces on each replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trigger, pieceCount, spread, reduced],
  );

  useEffect(() => {
    if (!onDone) {
      return undefined;
    }
    const longest = pieces.reduce(
      (max, piece) => Math.max(max, piece.delayMs + piece.durationMs),
      reduced ? 200 : 0,
    );
    const timer = window.setTimeout(onDone, longest + 80);
    return () => window.clearTimeout(timer);
  }, [pieces, onDone, reduced, trigger]);

  if (!pieces.length) {
    return null;
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-visible ${
        className ?? ''
      }`}
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="giveback-confetti-piece absolute left-1/2 top-1/2"
          style={
            {
              color: piece.color,
              animationDelay: `${piece.delayMs}ms`,
              animationDuration: `${piece.durationMs}ms`,
              '--giveback-confetti-x': `${piece.dx}px`,
              '--giveback-confetti-y': `${piece.dy}px`,
              '--giveback-confetti-r': `${piece.rotate}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default GivebackConfettiBurst;
