import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import { postDateFormat } from '../../lib/dateFormat';
import FeaturesContext from '../../contexts/FeaturesContext';

export default function PostMetadata({
  post,
  className,
  children,
}: {
  post: Post;
  className?: string;
  children?: ReactNode;
}): ReactElement {
  const { flags } = useContext(FeaturesContext);
  const date = useMemo(() => postDateFormat(post.createdAt), [post.createdAt]);

  return (
    <div
      className={classNames(
        'flex items-center text-theme-label-tertiary typo-footnote',
        className,
      )}
    >
      {flags && !flags.feat_hide_article_date && (
        <>
          <time dateTime={post.createdAt}>{date}</time>
          <div className="mx-1 w-0.5 h-0.5 rounded-full bg-theme-label-tertiary" />
        </>
      )}
      <span data-testid="readTime">{post.readTime}m read time</span>
      {children}
    </div>
  );
}
