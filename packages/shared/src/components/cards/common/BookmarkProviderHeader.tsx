import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { CardHeader } from './Card';
import { BookmarkIcon } from '../../icons';

export const bookmarkProviderText = 'Revisit this post you saved earlier?';
export const bookmarkProviderIcon = <BookmarkIcon secondary className="mx-1" />;
export const bookmarkProviderTextClassName =
  'text-action-bookmark-default typo-footnote';
const bookmarkProviderMouseClassName =
  'laptop:mouse:visible laptop:mouse:group-hover:invisible absolute';
export const headerHiddenClassName =
  'laptop:mouse:invisible laptop:mouse:group-hover:visible';

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
