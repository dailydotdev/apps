import { format } from 'date-fns';
import React, { HTMLAttributes, ReactElement } from 'react';

export interface JoinedDateProps extends HTMLAttributes<HTMLDivElement> {
  date: Date;
}

export default function JoinedDate({
  date,
  ...props
}: JoinedDateProps): ReactElement {
  return (
    <div {...props}>
      Joined&nbsp;
      <time dateTime={date.toISOString()}>{format(date, 'MMMM y')}</time>
    </div>
  );
}
