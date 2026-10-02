import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { usePrefersReducedMotion } from '../../features/giveback/useGivebackMotion';

export const plusTickerPerks = [
  'Removes every ad',
  'Rewrites clickbait titles',
  'Hides topics you mute',
  'Sorts your bookmarks',
  'Translates your feed',
  'Unlocks every briefing',
  'Builds smarter feeds',
];

const TICK_INTERVAL_MS = 2800;

export const PlusPerkTicker = (): ReactElement => {
  const isReducedMotion = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (isReducedMotion) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setTick((current) => current + 1);
      }
    }, TICK_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isReducedMotion]);

  const count = plusTickerPerks.length;
  const index = tick % count;
  const previous = (tick - 1 + count) % count;

  return (
    <>
      <span className="sr-only">{plusTickerPerks.join(', ')}</span>
      <span
        aria-hidden
        className="grid grid-cols-[minmax(0,1fr)] overflow-hidden"
      >
        {tick > 0 && (
          <span
            key={`out-${tick}`}
            className="plus-perk-out truncate [grid-area:1/1]"
          >
            {plusTickerPerks[previous]}
          </span>
        )}
        <span
          key={`in-${tick}`}
          className={classNames(
            'truncate [grid-area:1/1]',
            tick > 0 && 'plus-perk-in',
          )}
        >
          {plusTickerPerks[index]}
        </span>
      </span>
    </>
  );
};
