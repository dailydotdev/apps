import classNames from 'classnames';
import React, { ReactElement } from 'react';

import {
  bookmarkProviderIcon,
  bookmarkProviderText,
  bookmarkProviderTextClassName,
} from '../BookmarkProviderHeader';
import { CardHeader } from './ListCard';

interface BookmakProviderHeaderProps {
  className: string;
}

export const BookmakProviderHeader = ({
  className,
}: BookmakProviderHeaderProps): ReactElement => {
  return (
    <CardHeader
      className={classNames(className, bookmarkProviderTextClassName)}
    >
      {bookmarkProviderIcon}
      {bookmarkProviderText}
    </CardHeader>
  );
};
