import { useEffect, useRef, useState } from 'react';

interface UseCyclingPlaceholderOptions {
  /** Phrases to rotate between. Falls back to the first when paused. */
  phrases: readonly string[];
  /** Cycle interval in ms. */
  intervalMs?: number;
  /** Pause cycling. The current phrase stays put. */
  paused?: boolean;
}

/**
 * Cycles through a curated set of placeholder phrases for input/trigger
 * surfaces. Honors `prefers-reduced-motion: reduce` by freezing on the first
 * phrase. Pure timer-based; no DOM dependencies, SSR-safe.
 */
export const useCyclingPlaceholder = ({
  phrases,
  intervalMs = 3500,
  paused = false,
}: UseCyclingPlaceholderOptions): string => {
  const [index, setIndex] = useState(0);
  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;

  useEffect(() => {
    if (paused || phrases.length <= 1) {
      return undefined;
    }
    if (typeof window === 'undefined') {
      return undefined;
    }
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % phrasesRef.current.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [paused, intervalMs, phrases.length]);

  return phrases[index] ?? phrases[0] ?? '';
};
