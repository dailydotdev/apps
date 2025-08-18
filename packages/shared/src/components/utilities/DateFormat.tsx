import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import type { TimeFormatType } from '../../lib/dateFormat';
import { formatDate } from '../../lib/dateFormat';

interface DateFormatProps {
  date: string | number | Date;
  type?: TimeFormatType;
  className?: string;
  prefix?: string;
}
export const DateFormat = ({
  date,
  type,
  className,
  prefix,
}: DateFormatProps): ReactElement => {
  const convertedDate = new Date(date);
  const timeFormat = type;

  const renderDate = useMemo(
    () => date && formatDate({ value: date, type: timeFormat }),
    [date, timeFormat],
  );

  return (
    <time
      title={format(convertedDate, 'EEE MMM dd yyyy HH:mm:ss OOOO')}
      className={className}
      dateTime={convertedDate.toISOString()}
    >
      {prefix}
      {renderDate}
    </time>
  );
};
