import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { ClickableText } from '../buttons/ClickableText';

interface PostUpvotesCommentsCountProps {
  post: Post;
  onUpvotesClick?: (upvotes: number) => unknown;
}

export function PostUpvotesCommentsCount({
  post,
  onUpvotesClick,
}: PostUpvotesCommentsCountProps): ReactElement {
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;

  return (
    <div
      className="flex gap-x-4 items-center my-4 text-theme-label-tertiary typo-callout"
      data-testid="statsBar"
    >
      {post.views > 0 && <span>{post.views.toLocaleString()} Views</span>}
      {upvotes > 0 && (
        <ClickableText onClick={() => onUpvotesClick(upvotes)}>
          {upvotes} Upvote{upvotes > 1 ? 's' : ''}
        </ClickableText>
      )}
      {comments > 0 && (
        <span>
          {comments.toLocaleString()}
          {` Comment${comments === 1 ? '' : 's'}`}
        </span>
      )}
    </div>
  );
}
