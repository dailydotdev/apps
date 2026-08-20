import { useEffect, useState } from 'react';

/**
 * True once `delayMs` has elapsed *since the visitor first scrolled*.
 *
 * The top leaderboard is meant to stay pinned for the first ten seconds of
 * reading. Counting from mount instead means a visitor who looks at the
 * headline for ten seconds has already spent the whole window before their
 * first scroll, so the unit never pins for them and the placement looks
 * broken. Counting from the first scroll gives every visitor the same pinned
 * window, which is the point of booking it.
 *
 * A page nobody scrolls never releases, which costs nothing: the unit is
 * sitting at its natural position, so pinned and unpinned look identical.
 */
export function useStickyRelease(delayMs: number): boolean {
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
