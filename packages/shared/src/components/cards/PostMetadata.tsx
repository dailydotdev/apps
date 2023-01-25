import React, { ReactElement, ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { postDateFormat } from '../../lib/dateFormat';
import { Separator } from './common';
import { Post } from '../../graphql/posts';

type PostMetadataProps = Pick<Post, 'createdAt' | 'readTime' | 'numUpvotes'> & {
  className?: string;
  username?: string;
  children?: ReactNode;
  typoClassName?: string;
};

export default function PostMetadata({
  createdAt,
  readTime,
  numUpvotes,
  className,
  children,
  username,
  typoClassName = 'typo-footnote',
}: PostMetadataProps): ReactElement {
  const date = useMemo(
    () => createdAt && postDateFormat(createdAt),
    [createdAt],
  );

  return (
    <div
      className={classNames('flex items-center  ', typoClassName, className)}
    >
      {!!username && <span>@{username}</span>}
      {!!createdAt && !!username && <Separator />}
      {!!createdAt && <time dateTime={createdAt}>{date}</time>}
      {!!createdAt && !!readTime && <Separator />}
      {!!readTime && <span data-testid="readTime">{readTime}m read time</span>}
      {(!!createdAt || !!readTime) && !!numUpvotes && <Separator />}
      {!!numUpvotes && (
        <span data-testid="numUpvotes">
          {numUpvotes} upvote{numUpvotes > 1 ? 's' : ''}
        </span>
      )}
      {children}
    </div>
  );
}
