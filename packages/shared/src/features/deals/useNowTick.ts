import { useEffect, useState } from 'react';

export const NOW_TICK_MINUTE = 60000;

// A frozen `now` keeps mock surfaces deterministic; without one the value
// refreshes on an interval so countdowns actually count down.
export const useNowTick = (
  now?: number,
  intervalMs = NOW_TICK_MINUTE,
): number => {
  const [current, setCurrent] = useState(() => now ?? Date.now());

  useEffect(() => {
    if (now !== undefined) {
      setCurrent(now);

      return undefined;
    }

    setCurrent(Date.now());
    const interval = setInterval(() => setCurrent(Date.now()), intervalMs);

    return () => clearInterval(interval);
  }, [now, intervalMs]);

  return current;
};
