import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import PostToc from '../../widgets/PostToc';
import { PostTagList } from '../tags/PostTagList';

interface PostInsightPanelProps {
  post: Post;
  children?: ReactNode;
}

export const PostInsightPanel = ({
  post,
  children,
}: PostInsightPanelProps): ReactElement => {
  const hasToc = (post.toc?.length ?? 0) > 0;
  const hasSummary = !!post.summary;

  return (
    <article className="flex flex-col gap-5" data-testid="post-insight-panel">
      <div className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-4 tablet:p-6">
        <div className="mb-4 flex flex-col gap-2">
          <p className="text-text-tertiary typo-caption1">Article summary</p>
          <h2 className="font-bold text-text-primary typo-title1">
            What this story is about
          </h2>
          <p className="text-text-tertiary typo-callout">
            Start with the original article context, then continue into the
            developer discussion.
          </p>
        </div>
        {hasSummary ? (
          <p
            className="select-text break-words text-text-secondary typo-markdown"
            data-testid="tldr-container"
          >
            {post.summary}
          </p>
        ) : (
          <p className="text-text-secondary typo-callout">
            Explore the post, then use the developer context below to find
            related discussions, tools, and stories.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-text-primary typo-title3">
            Story signals
          </p>
          <p className="text-text-tertiary typo-footnote">
            {post.readTime ?? 1} min read · {post.numUpvotes ?? 0} upvotes ·{' '}
            {post.numComments ?? 0} comments
          </p>
        </div>
        <PostTagList post={post} />
      </div>

      {hasToc && (
        <PostToc
          collapsible
          className={classNames(
            'flex rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4',
            'laptop:hidden',
          )}
          post={post}
        />
      )}

      {children}
    </article>
  );
};
