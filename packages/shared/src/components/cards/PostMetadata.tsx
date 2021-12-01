import React, { ReactElement, ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import { postDateFormat } from '../../lib/dateFormat';
import classed from '../../lib/classed';

const Separator = classed(
  'div',
  'mx-1 w-0.5 h-0.5 rounded-full bg-theme-label-tertiary',
);

export default function PostMetadata({
  post,
  className,
  children,
}: {
  post: Post;
  className?: string;
  children?: ReactNode;
}): ReactElement {
  const date = useMemo(
    () => post.createdAt && postDateFormat(post.createdAt),
    [post.createdAt],
  );

  return (
    <div
      className={classNames(
        'flex items-center text-theme-label-tertiary typo-footnote',
        className,
      )}
    >
      {!!post.createdAt && <time dateTime={post.createdAt}>{date}</time>}
      {!!post.createdAt && !!post.readTime && <Separator />}
      {!!post.readTime && (
        <span data-testid="readTime">{post.readTime}m read time</span>
      )}
      {children}
    </div>
  );
}
