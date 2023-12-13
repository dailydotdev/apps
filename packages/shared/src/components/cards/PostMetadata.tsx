import React, { ReactElement, ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { postDateFormat } from '../../lib/dateFormat';
import { Separator } from './common';
import { Post } from '../../graphql/posts';
import PlayIcon from '../icons/Play';
import { IconSize } from '../Icon';

interface PostMetadataProps
  extends Pick<Post, 'createdAt' | 'readTime' | 'numUpvotes'> {
  className?: string;
  description?: string;
  children?: ReactNode;
  isVideoType?: boolean;
  insaneMode?: boolean;
}

export default function PostMetadata({
  createdAt,
  readTime,
  numUpvotes,
  className,
  children,
  description,
  isVideoType,
  insaneMode,
}: PostMetadataProps): ReactElement {
  const date = useMemo(
    () => createdAt && postDateFormat(createdAt),
    [createdAt],
  );

  const timeActionContent = isVideoType ? 'watch' : 'read';

  return (
    <div
      className={classNames(
        'flex items-center text-theme-label-tertiary typo-footnote',
        className,
      )}
    >
      {isVideoType && insaneMode && (
        <PlayIcon secondary size={IconSize.XXSmall} className="mr-1" />
      )}
      {!!description && <span>{description}</span>}
      {!!createdAt && !!description && <Separator />}
      {!!createdAt && <time dateTime={createdAt}>{date}</time>}
      {!!createdAt && !!readTime && <Separator />}
      {!!readTime && (
        <span data-testid="readTime">
          {readTime}m {timeActionContent} time
        </span>
      )}
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
