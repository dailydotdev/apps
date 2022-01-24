import React, { ReactElement, ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { ReadHistoryPost } from '../../graphql/posts';
import classed from '../../lib/classed';

const Separator = classed(
  'div',
  'mx-1 w-0.5 h-0.5 rounded-full bg-theme-label-tertiary',
);

interface PostMetadataReadingHistoryProps {
  post: ReadHistoryPost;
  className?: string;
  children?: ReactNode;
  typoClassName?: string;
}

export default function PostMetadata({
  post,
  className,
  children,
  typoClassName = 'typo-footnote',
}: PostMetadataReadingHistoryProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex items-center text-theme-label-tertiary',
        typoClassName,
        className,
      )}
    >
      {post.readTime >=0 && (
        <span data-testid="readTime">{post.readTime}m read time</span>
      )}
      {post.readTime >=0 && post.numUpvotes >=0 && <Separator />}
      {post.numUpvotes >= 0 && (
        <span data-testid="numUpvotes">
          {post.numUpvotes} upvote{post.numUpvotes > 1 ? 's' : ''}
        </span>
      )}

      {children}
    </div>
  );
}
