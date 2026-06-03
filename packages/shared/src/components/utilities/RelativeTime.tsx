import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { getLastActivityDateFormat, oneMinute } from '../../lib/dateFormat';

interface RelativeTimeProps {
  dateTime: string;
  className?: string;
  maxHoursAgo?: number;
}

const REFRESH_INTERVAL_MS = oneMinute * 1000;

export const RelativeTime = ({
  dateTime,
  className,
  maxHoursAgo,
}: RelativeTimeProps): ReactElement => {
  const [label, setLabel] = useState(() =>
    getLastActivityDateFormat(dateTime, { maxHoursAgo }),
  );

  useEffect(() => {
    setLabel(getLastActivityDateFormat(dateTime, { maxHoursAgo }));

    const id = setInterval(() => {
      setLabel(getLastActivityDateFormat(dateTime, { maxHoursAgo }));
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(id);
  }, [dateTime, maxHoursAgo]);

  return (
    <time dateTime={dateTime} className={className}>
      {label}
    </time>
  );
};
