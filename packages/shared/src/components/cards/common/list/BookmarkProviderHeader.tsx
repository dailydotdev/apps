import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
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
