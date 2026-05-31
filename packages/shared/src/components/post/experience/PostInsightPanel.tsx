import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import PostToc from '../../widgets/PostToc';
import { PostTagList } from '../tags/PostTagList';

interface StatProps {
  label: string;
  value: ReactNode;
}

const Stat = ({ label, value }: StatProps): ReactElement => (
  <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
    <p className="text-text-tertiary typo-caption1">{label}</p>
    <p className="mt-1 font-bold text-text-primary typo-title3">{value}</p>
  </div>
);

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
    <section className="flex flex-col gap-4" data-testid="post-insight-panel">
      <div className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-4 tablet:p-6">
        <div className="mb-4 flex flex-col gap-2">
          <p className="font-bold text-text-primary typo-title2">
            In 30 seconds
          </p>
          <p className="text-text-tertiary typo-callout">
            The fastest way to decide if this post is worth your time, and what
            daily.dev can help you discover next.
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

      <div className="grid gap-3 mobileXL:grid-cols-3">
        <Stat label="Reading time" value={`${post.readTime ?? 1} min`} />
        <Stat label="Developer votes" value={post.numUpvotes ?? 0} />
        <Stat label="Discussion" value={`${post.numComments ?? 0} comments`} />
      </div>

      <div className="rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4">
        <div className="mb-3 flex flex-col gap-1">
          <p className="font-bold text-text-primary typo-title3">
            Topics shaping this story
          </p>
          <p className="text-text-tertiary typo-footnote">
            Follow the tags that matter, or use them as the seed for your feed.
          </p>
        </div>
        <PostTagList post={post} />
      </div>

      {hasToc && (
        <PostToc
          collapsible
          className="flex rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4 laptop:hidden"
          post={post}
        />
      )}

      {children}
    </section>
  );
};
