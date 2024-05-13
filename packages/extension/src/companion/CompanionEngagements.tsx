import React, { ReactElement } from 'react';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
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
}: CompanionEngagementsProps): ReactElement {
  if (!post) {
    return null;
  }

  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const client = useQueryClient();
  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
      className="flex items-center gap-x-4 py-1 text-text-tertiary typo-callout"
      data-testid="statsBar"
    >
      {post.numUpvotes <= 0 && <span>Be the first to upvote</span>}
      {post.numUpvotes > 0 && (
        <ClickableText onClick={onUpvotesClick}>
          {largeNumberFormat(post.numUpvotes)} Upvote
          {post.numUpvotes > 1 ? 's' : ''}
        </ClickableText>
      )}
      {post.numComments > 0 && (
        <span>
          {largeNumberFormat(post.numComments)}
          {` Comment${post.numComments === 1 ? '' : 's'}`}
        </span>
      )}
    </div>
  );
}
