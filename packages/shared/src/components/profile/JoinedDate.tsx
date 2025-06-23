import type { HTMLAttributes, ReactElement } from 'react';
import React from 'react';
import { format, isValid } from 'date-fns';

export interface JoinedDateProps extends HTMLAttributes<HTMLDivElement> {
  date: Date;
  dateFormat?: string;
}

export default function JoinedDate({
  date,
  dateFormat = 'MMMM y',
  ...props
}: JoinedDateProps): ReactElement {
  if (!isValid(date)) {
    return null;
  }

  return (
    <div {...props}>
      Joined&nbsp;
      <time dateTime={date.toISOString()}>{format(date, dateFormat)}</time>
    </div>
  );
}
