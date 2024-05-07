import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { ClickableText } from '../buttons/ClickableText';
import { largeNumberFormat } from '../../lib';

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
  const hasUpvotesOrCommentsOrViews =
    upvotes > 0 || comments > 0 || post.views > 0;

  return !hasUpvotesOrCommentsOrViews ? (
    <></>
  ) : (
    <div
      className="mb-5 flex items-center gap-x-4 text-text-tertiary typo-callout"
      data-testid="statsBar"
    >
      {post.views > 0 && <span>{largeNumberFormat(post.views)} Views</span>}
      {upvotes > 0 && (
        <ClickableText onClick={() => onUpvotesClick(upvotes)}>
          {largeNumberFormat(upvotes)} Upvote{upvotes > 1 ? 's' : ''}
        </ClickableText>
      )}
      {comments > 0 && (
        <span>
          {largeNumberFormat(comments)}
          {` Comment${comments === 1 ? '' : 's'}`}
        </span>
      )}
    </div>
  );
}
