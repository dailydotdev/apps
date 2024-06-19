import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { CardHeader } from './ListCard';
import {
  bookmarkProviderIcon,
  bookmarkProviderText,
  bookmarkProviderTextClassName,
} from '../BookmarkProviderHeader';

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
