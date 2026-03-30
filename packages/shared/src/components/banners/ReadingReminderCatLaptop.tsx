import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface ReadingReminderCatLaptopProps {
  className?: string;
}

const ReadingReminderCatLaptop = ({
  className,
}: ReadingReminderCatLaptopProps): ReactElement => {
  return (
    <img
      src="/assets/reading-reminder-cat.png"
      alt="Sleeping cat on laptop"
      className={classNames(
        'mx-auto mb-4 w-full max-w-[20rem] rounded-12',
        className,
      )}
    />
  );
};

export default ReadingReminderCatLaptop;
