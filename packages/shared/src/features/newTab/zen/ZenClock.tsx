import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

const formatTime = (date: Date): string =>
  date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

interface ZenClockProps {
  className?: string;
}

// Large, calm clock. Re-renders once a minute so it stays cheap even left
// open all day. Aligns to the next minute boundary so the displayed time
// updates the moment the wall clock ticks over rather than minutes later.
export const ZenClock = ({ className }: ZenClockProps): ReactElement => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let timeoutId = 0;
    const schedule = (): void => {
      const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
      timeoutId = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, msUntilNextMinute + 50);
    };

    schedule();
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <time
      dateTime={now.toISOString()}
      aria-label={`Current time ${formatTime(now)}`}
      className={classNames(
        'block text-center text-[6rem] font-bold leading-none tracking-tight text-text-primary tablet:text-[8rem]',
        className,
      )}
    >
      {formatTime(now)}
    </time>
  );
};
