import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { plusTickerPerks } from './PlusList';

const TICK_INTERVAL_MS = 2800;

// One pass through the perks, back to the first, then it rests. Hovering or
// focusing the row pauses it (WCAG 2.2.2).
export const PlusPerkTicker = (): ReactElement => {
  const isReducedMotion = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const count = plusTickerPerks.length;
  const isDone = tick >= count;

  useEffect(() => {
    const row = rootRef.current?.closest('a, button');
    if (!row) {
      return undefined;
    }

    const pause = () => setIsPaused(true);
    const resume = () => setIsPaused(false);
    row.addEventListener('pointerenter', pause);
    row.addEventListener('pointerleave', resume);
    row.addEventListener('focusin', pause);
    row.addEventListener('focusout', resume);

    return () => {
      row.removeEventListener('pointerenter', pause);
      row.removeEventListener('pointerleave', resume);
      row.removeEventListener('focusin', pause);
      row.removeEventListener('focusout', resume);
    };
  }, []);

  useEffect(() => {
    if (isReducedMotion || isPaused || isDone) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setTick((current) => current + 1);
      }
    }, TICK_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isReducedMotion, isPaused, isDone]);

  const index = tick % count;
  const previous = (tick - 1 + count) % count;

  return (
    <span
      ref={rootRef}
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
  );
};
