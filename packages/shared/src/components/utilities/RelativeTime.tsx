import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { formatDate, oneMinute, TimeFormatType } from '../../lib/dateFormat';

interface RelativeTimeProps {
  dateTime: string;
  className?: string;
}

const REFRESH_INTERVAL_MS = oneMinute * 1000;

export const RelativeTime = ({
  dateTime,
  className,
}: RelativeTimeProps): ReactElement => {
  const [label, setLabel] = useState(() =>
    formatDate({ value: dateTime, type: TimeFormatType.LastActivity }),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setLabel(
        formatDate({ value: dateTime, type: TimeFormatType.LastActivity }),
      );
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(id);
  }, [dateTime]);

  return (
    <time dateTime={dateTime} className={className}>
      {label}
    </time>
  );
};
