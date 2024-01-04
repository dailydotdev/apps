import React, { ReactElement, ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { postDateFormat } from '../../../lib/dateFormat';
import { Separator } from '../common';
import { Post } from '../../../graphql/posts';
import { formatReadTime } from '../../utilities';

interface PostMetadataProps
  extends Pick<
    Post,
    'createdAt' | 'readTime' | 'numUpvotes' | 'author' | 'source'
  > {
  className?: string;
  description?: string;
  children?: ReactNode;
  isVideoType?: boolean;
  insaneMode?: boolean;
}

const getAuthor = (author?: Post['author'], source?: Post['source']) => {
  if (!author) {
    return source?.name;
  }
  return author.name;
};

export default function PostMetadata({
  createdAt,
  author,
  source,
  readTime,
  className,
  children,
  isVideoType,
}: PostMetadataProps): ReactElement {
  const date = useMemo(
    () => createdAt && postDateFormat(createdAt),
    [createdAt],
  );

  const timeActionContent = isVideoType ? 'watch' : 'read';
  const showReadTime = isVideoType ? Number.isInteger(readTime) : !!readTime;
  const authorLabel = getAuthor(author, source);

  return (
    <div className={classNames('grid items-center gap-1', className)}>
      {authorLabel && (
        <div className="font-bold typo-footnote">{authorLabel}</div>
      )}
      <div className="flex items-center text-theme-label-tertiary typo-footnote">
        {showReadTime && (
          <span data-testid="readTime">
            {formatReadTime(readTime)} {timeActionContent} time
          </span>
        )}
        {!!createdAt && showReadTime && <Separator />}
        {!!createdAt && <time dateTime={createdAt}>{date}</time>}
        {/* {(!!createdAt || showReadTime) && !!numUpvotes && <Separator />}
      {!!numUpvotes && (
        <span data-testid="numUpvotes">
          {numUpvotes} upvote{numUpvotes > 1 ? 's' : ''}
        </span>
      )} */}
        {children}
      </div>
    </div>
  );
}
