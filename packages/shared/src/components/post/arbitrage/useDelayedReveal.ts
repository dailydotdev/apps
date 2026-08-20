import { useEffect, useState } from 'react';

/**
 * True once `delayMs` has elapsed since mount.
 *
 * Used for the two timed placements the ad partner specified: the floating
 * leaderboard only loads after ten seconds, and the top leaderboard releases
 * its sticky position after the same delay. Delaying the *mount* rather than
 * hiding with CSS matters for the floating unit — the ad request should not
 * fire until the slot is actually going to be shown.
 */
export function useDelayedReveal(delayMs: number): boolean {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (delayMs <= 0) {
      setRevealed(true);
      return undefined;
    }

    const timer = globalThis.setTimeout(() => setRevealed(true), delayMs);
    return () => globalThis.clearTimeout(timer);
  }, [delayMs]);

  return revealed;
}
