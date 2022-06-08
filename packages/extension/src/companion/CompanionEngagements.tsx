import React, { ReactElement } from 'react';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { useQueryClient } from 'react-query';
import { useRawBackgroundRequest } from './useRawBackgroundRequest';

interface CompanionEngagementsProps {
  post: PostBootData;
  onUpvotesClick?: () => unknown;
}

export function CompanionEngagements({
  post,
  onUpvotesClick,
}: CompanionEngagementsProps): ReactElement {
  if (!post) {
    return null;
  }

  const client = useQueryClient();
  useRawBackgroundRequest(({ res, key }) => {
    if (!Array.isArray(key)) {
      return;
    }

    if (key[0] !== 'readingRank') {
      return;
    }

    client.setQueryData(key, res);
  });

  return (
    <div
      className="flex gap-x-4 items-center py-1 text-theme-label-tertiary typo-callout"
      data-testid="statsBar"
    >
      {post.numUpvotes <= 0 && <span>Be the first to upvote</span>}
      {post.numUpvotes > 0 && (
        <ClickableText onClick={onUpvotesClick}>
          {post.numUpvotes} Upvote{post.numUpvotes > 1 ? 's' : ''}
        </ClickableText>
      )}
      {post.numComments > 0 && (
        <span>
          {post.numComments.toLocaleString()}
          {` Comment${post.numComments === 1 ? '' : 's'}`}
        </span>
      )}
    </div>
  );
}
