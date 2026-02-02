import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { MockPost } from '../../lib/toolsMockData';
import { UpvoteIcon, DiscussIcon } from '../icons';
import { largeNumberFormat } from '../../lib';

export interface ToolRelatedContentProps {
  posts: MockPost[];
  className?: string;
}

export const ToolRelatedContent = ({
  posts,
  className,
}: ToolRelatedContentProps): ReactElement => {
  return (
    <div className={classNames('flex flex-col', className)}>
      <h2 className="mb-4 font-bold text-text-primary typo-title3">
        Related posts
      </h2>
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4"
          >
            <h3 className="font-bold text-text-primary typo-callout">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 text-text-tertiary typo-footnote">
              <span>{post.source}</span>
              <span aria-hidden>·</span>
              <span>{post.date}</span>
              <span className="flex items-center gap-1">
                <UpvoteIcon className="size-3" />
                {largeNumberFormat(post.upvotes)}
              </span>
              <span className="flex items-center gap-1">
                <DiscussIcon className="size-3" />
                {largeNumberFormat(post.comments)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
