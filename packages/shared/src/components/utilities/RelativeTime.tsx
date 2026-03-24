import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { formatDate, oneMinute, TimeFormatType } from '../../lib/dateFormat';

interface RelativeTimeProps {
  dateTime: string;
  className?: string;
  includeAgoSuffix?: boolean;
}

const REFRESH_INTERVAL_MS = oneMinute * 1000;

export const RelativeTime = ({
  dateTime,
  className,
  includeAgoSuffix = true,
}: RelativeTimeProps): ReactElement => {
  const getLabel = (): string => {
    const formattedLabel = formatDate({
      value: dateTime,
      type: TimeFormatType.LastActivity,
    });

    if (includeAgoSuffix) {
      return formattedLabel;
    }

    return formattedLabel.replace(/\s+ago$/i, '');
  };

  const [label, setLabel] = useState(getLabel);

  useEffect(() => {
    const id = setInterval(() => {
      setLabel(getLabel());
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(id);
  }, [dateTime, includeAgoSuffix]);

  return (
    <time dateTime={dateTime} className={className}>
      {label}
    </time>
  );
};
