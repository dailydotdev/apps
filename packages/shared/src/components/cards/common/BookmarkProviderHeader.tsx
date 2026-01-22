import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { CardHeader } from './Card';
import { BookmarkIcon } from '../../icons';
import type { WithClassNameProps } from '../../utilities';

export const bookmarkProviderText = 'Revisit this post you saved earlier?';
export const bookmarkProviderIcon = <BookmarkIcon secondary className="mx-1" />;
export const bookmarkProviderTextClassName =
  'text-action-bookmark-default typo-footnote';
const bookmarkProviderMouseClassName =
  'laptop:mouse:visible laptop:mouse:group-hover:invisible absolute';
export const headerHiddenClassName =
  'laptop:mouse:invisible laptop:mouse:group-hover:visible';

export const BookmakProviderHeader = ({
  className,
}: WithClassNameProps): ReactElement => {
  return (
    <CardHeader
      className={classNames(
        className,
        bookmarkProviderMouseClassName,
        bookmarkProviderTextClassName,
      )}
    >
      {bookmarkProviderIcon}
      {bookmarkProviderText}
    </CardHeader>
  );
};
