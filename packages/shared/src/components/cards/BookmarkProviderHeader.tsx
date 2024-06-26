import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { CardHeader } from './Card';
import { BookmarkIcon } from '../icons';

export const bookmarkProviderText = 'Revisit this post you saved earlier?';
export const bookmarkProviderIcon = <BookmarkIcon secondary className="mx-1" />;
export const bookmarkProviderTextClassName =
  'text-action-bookmark-default typo-footnote';
const bookmarkProviderMouseClassName =
  'laptop:mouse:flex laptop:mouse:group-hover:hidden';
export const headerHiddenClassName =
  'laptop:mouse:hidden laptop:mouse:group-hover:flex';

interface BookmakProviderHeaderProps {
  className: string;
  isArticleCard?: boolean;
}

export const BookmakProviderHeader = ({
  className,
  isArticleCard = false,
}: BookmakProviderHeaderProps): ReactElement => {
  const Component = isArticleCard ? CardHeader : 'div';
  return (
    <Component
      className={classNames(
        className,
        bookmarkProviderMouseClassName,
        bookmarkProviderTextClassName,
      )}
    >
      {bookmarkProviderIcon}
      {bookmarkProviderText}
    </Component>
  );
};
