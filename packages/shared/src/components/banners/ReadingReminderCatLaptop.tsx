import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { cloudinaryReadingReminderCat } from '../../lib/image';

interface ReadingReminderCatLaptopProps {
  className?: string;
}

const ReadingReminderCatLaptop = ({
  className,
}: ReadingReminderCatLaptopProps): ReactElement => {
  return (
    <img
      src={cloudinaryReadingReminderCat}
      alt="Sleeping cat on laptop"
      className={classNames(
        'mx-auto mb-4 w-full max-w-[20rem] rounded-12',
        className,
      )}
    />
  );
};

export default ReadingReminderCatLaptop;
