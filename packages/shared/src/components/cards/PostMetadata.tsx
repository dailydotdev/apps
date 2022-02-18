import React, { ReactElement, ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { postDateFormat } from '../../lib/dateFormat';
import { Separator } from './common';

interface PostMetadataProps {
  createdAt?: string;
  readTime?: number;
  numUpvotes?: number;
  className?: string;
  children?: ReactNode;
  typoClassName?: string;
}

export default function PostMetadata({
  createdAt,
  readTime,
  numUpvotes,
  className,
  children,
  typoClassName = 'typo-footnote',
}: PostMetadataProps): ReactElement {
  const date = useMemo(
    () => createdAt && postDateFormat(createdAt),
    [createdAt],
  );

  return (
    <div
      className={classNames(
        'flex items-center text-theme-label-tertiary',
        typoClassName,
        className,
      )}
    >
      {!!createdAt && <time dateTime={createdAt}>{date}</time>}
      {!!createdAt && !!readTime && <Separator />}
      {readTime >= 0 && (
        <span data-testid="readTime">{readTime}m read time</span>
      )}
      {readTime >= 0 && numUpvotes >= 0 && <Separator />}
      {numUpvotes >= 0 && (
        <span data-testid="numUpvotes">
          {numUpvotes} upvote{numUpvotes > 1 ? 's' : ''}
        </span>
      )}
      {children}
    </div>
  );
}
