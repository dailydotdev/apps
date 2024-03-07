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

  const renderDate = useMemo(
    () => date && formatDate({ value: date, type }),
    [date, type],
  );

  return (
    <time
      title={convertedDate.toISOString()}
      className={className}
      dateTime={convertedDate.toISOString()}
    >
      {prefix}
      {renderDate}
    </time>
  );
};

export const DateFormatExperiment = ({
  date,
  type,
  className,
  prefix,
}: DateFormatProps): ReactElement => {
  const convertedDate = new Date(date);
  const timeFormat =
    type !== TimeFormatType.ReadHistory ? TimeFormatType.Generic : type;

  const renderDate = useMemo(
    () => date && formatDate({ value: date, type: timeFormat }),
    [date, timeFormat],
  );

  return (
    <time
      title={convertedDate.toISOString()}
      className={className}
      dateTime={convertedDate.toISOString()}
    >
      {prefix}
      {renderDate}
    </time>
  );
};
