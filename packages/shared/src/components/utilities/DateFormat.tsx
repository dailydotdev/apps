import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import type { TimeFormatType } from '../../lib/dateFormat';
import { formatDate, isValidDate } from '../../lib/dateFormat';

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
}: DateFormatProps): ReactElement | null => {
  const convertedDate = new Date(date);
  const hasValidDate = isValidDate(convertedDate);

  const renderDate = useMemo(
    () => (hasValidDate ? formatDate({ value: date, type }) : ''),
    [date, hasValidDate, type],
  );

  if (!hasValidDate) {
    return null;
  }

  return (
    <time
      title={format(convertedDate, 'EEE MMM dd yyyy HH:mm:ss OOOO')}
      className={classNames(
        'inline-block h-4 align-middle leading-4',
        className,
      )}
      dateTime={convertedDate.toISOString()}
    >
      {prefix}
      {renderDate}
    </time>
  );
};
