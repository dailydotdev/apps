import React, { ReactElement, ReactNode, useMemo } from 'react';
import { Post } from '../../graphql/posts';
import { postDateFormat } from '../../lib/dateFormat';
import classNames from 'classnames';

export default function PostMetadata({
  post,
  className,
  children,
}: {
  post: Post;
  className?: string;
  children?: ReactNode;
}): ReactElement {
  const date = useMemo(() => postDateFormat(post.createdAt), [post.createdAt]);

  return (
    <div
      className={classNames(
        'flex items-center text-theme-label-tertiary typo-footnote',
        className,
      )}
    >
      <time dateTime={post.createdAt}>{date}</time>
      {!!post.readTime && (
        <>
          <div className="w-0.5 h-0.5 mx-1 rounded-full bg-theme-label-tertiary" />
          <span data-testid="readTime">{post.readTime}m read time</span>
        </>
      )}
      {children}
    </div>
  );
}
