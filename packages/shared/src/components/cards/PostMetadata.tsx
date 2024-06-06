import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { TimeFormatType } from '../../lib/dateFormat';
import { Separator } from './common';
import { Post } from '../../graphql/posts';
import { formatReadTime, TruncateText, DateFormat } from '../utilities';
import { largeNumberFormat } from '../../lib';

interface PostMetadataProps
  extends Pick<Post, 'createdAt' | 'readTime' | 'numUpvotes'> {
  className?: string;
  description?: string;
  children?: ReactNode;
  isVideoType?: boolean;
}

export default function PostMetadata({
  createdAt,
  readTime,
  numUpvotes,
  className,
  children,
  description,
  isVideoType,
}: PostMetadataProps): ReactElement {
  const timeActionContent = isVideoType ? 'watch' : 'read';
  const showReadTime = isVideoType ? Number.isInteger(readTime) : !!readTime;

  return (
    <div
      className={classNames(
        'flex items-center text-text-tertiary typo-footnote',
        className,
      )}
    >
      {!!description && (
        <TruncateText title={description}>{description}</TruncateText>
      )}
      {!!createdAt && !!description && <Separator />}
      {!!createdAt && (
        <DateFormat date={createdAt} type={TimeFormatType.Post} />
      )}
      {!!createdAt && showReadTime && <Separator />}
      {showReadTime && (
        <span data-testid="readTime">
          {formatReadTime(readTime)} {timeActionContent} time
        </span>
      )}
      {(!!createdAt || showReadTime) && !!numUpvotes && <Separator />}
      {!!numUpvotes && (
        <span data-testid="numUpvotes">
          {largeNumberFormat(numUpvotes)} upvote{numUpvotes > 1 ? 's' : ''}
        </span>
      )}
      {children}
    </div>
  );
}
