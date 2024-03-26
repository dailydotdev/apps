import React, { ReactElement, useMemo } from 'react';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';

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
      title={convertedDate.toString()}
      className={className}
      dateTime={convertedDate.toISOString()}
    >
      {prefix}
      {renderDate}
    </time>
  );
};
