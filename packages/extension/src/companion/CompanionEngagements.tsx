import type { ReactElement } from 'react';
import React from 'react';
import type { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { useQueryClient } from '@tanstack/react-query';
import { useRawBackgroundRequest } from '@dailydotdev/shared/src/hooks/companion';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib';

interface CompanionEngagementsProps {
  post: PostBootData;
  onUpvotesClick?: () => unknown;
}

export function CompanionEngagements({
  post,
  onUpvotesClick,
}: CompanionEngagementsProps): ReactElement | null {
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

  if (!post) {
    return null;
  }

  const upvotes = post.numUpvotes ?? 0;
  const comments = post.numComments ?? 0;

  return (
    <div
      className="flex items-center gap-x-4 py-1 text-text-tertiary typo-callout"
      data-testid="statsBar"
    >
      {upvotes <= 0 && <span>Be the first to upvote</span>}
      {upvotes > 0 && (
        <ClickableText onClick={onUpvotesClick}>
          {largeNumberFormat(upvotes)} Upvote
          {upvotes > 1 ? 's' : ''}
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
