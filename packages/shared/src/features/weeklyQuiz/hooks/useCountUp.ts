import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  durationMs?: number;
  // Defer the animation until this flips true (e.g. scrolled into view).
  start?: boolean;
}

// Animates a number from 0 up to `target` once, easing out — the odometer feel
// borrowed from jakub.kr's subscriber counter. Honors prefers-reduced-motion by
// snapping straight to the target. Returns a float; round/format at the call
// site.
export const useCountUp = (
  target: number,
  { durationMs = 800, start = true }: UseCountUpOptions = {},
): number => {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!start) {
      return undefined;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || target === 0 || typeof window === 'undefined') {
      setValue(target);
      return undefined;
    }

    let startTs: number | null = null;
    const tick = (ts: number): void => {
      if (startTs === null) {
        startTs = ts;
      }
      const progress = Math.min(1, (ts - startTs) / durationMs);
      const eased = 1 - (1 - progress) ** 3; // easeOutCubic
      setValue(target * eased);
      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, durationMs, start]);

  return value;
};
