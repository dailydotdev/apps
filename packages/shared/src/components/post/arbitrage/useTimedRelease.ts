import { useEffect, useState } from 'react';

/**
 * True once `delayMs` has elapsed since the visitor's first scroll — the top
 * leaderboard is meant to stay pinned for the first ten seconds of *reading*.
 * Counting from mount instead means a visitor who studies the headline for
 * ten seconds has spent the whole window before their first scroll, so the
 * unit never pins for them and the placement looks broken. A page nobody
 * scrolls never elapses, which costs nothing: the unit sits at its natural
 * position, where pinned and unpinned look identical.
 */
export function useTimedRelease(delayMs: number): boolean {
  const [released, setReleased] = useState(false);

  useEffect(() => {
    if (delayMs <= 0) {
      setReleased(true);
      return undefined;
    }

    let timer: ReturnType<typeof globalThis.setTimeout> | undefined;
    const startCountdown = (): void => {
      timer = globalThis.setTimeout(() => setReleased(true), delayMs);
    };

    globalThis.addEventListener('scroll', startCountdown, {
      passive: true,
      once: true,
    });

    return () => {
      globalThis.removeEventListener('scroll', startCountdown);
      if (timer) {
        globalThis.clearTimeout(timer);
      }
    };
  }, [delayMs]);

  return released;
}
