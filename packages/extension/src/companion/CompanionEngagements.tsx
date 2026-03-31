import type { ReactElement } from 'react';
import React from 'react';
import type { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useRawBackgroundRequest } from '@dailydotdev/shared/src/hooks/companion';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib';
import { featureUpvoteCountThreshold } from '@dailydotdev/shared/src/lib/featureManagement';
import { getUpvoteCountDisplay } from '@dailydotdev/shared/src/lib/post';

interface CompanionEngagementsProps {
  post: PostBootData;
  onUpvotesClick?: () => unknown;
}

export function CompanionEngagements({
  post,
  onUpvotesClick,
}: CompanionEngagementsProps): ReactElement | null {
  const { user } = useAuthContext();
  const isLoggedIn = !!user;
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

  const { value: upvoteThresholdConfig } = useConditionalFeature({
    feature: featureUpvoteCountThreshold,
    shouldEvaluate: isLoggedIn,
  });

  if (!post) {
    return null;
  }

  const upvotes = post.numUpvotes ?? 0;
  const comments = post.numComments ?? 0;
  const userHasUpvoted = post.userState?.vote === UserVote.Up;
  const { showCount, belowThresholdLabel } = getUpvoteCountDisplay(
    upvotes,
    upvoteThresholdConfig.threshold,
    upvoteThresholdConfig.belowThresholdLabel,
    userHasUpvoted,
    post.createdAt,
    upvoteThresholdConfig.newWindowHours,
  );

  return (
    <div
      className="flex items-center gap-x-4 py-1 text-text-tertiary typo-callout"
      data-testid="statsBar"
    >
      {upvotes <= 0 && <span>Be the first to upvote</span>}
      {showCount && (
        <ClickableText onClick={onUpvotesClick}>
          {largeNumberFormat(upvotes)} Upvote
          {upvotes > 1 ? 's' : ''}
        </ClickableText>
      )}
      {!showCount && !!belowThresholdLabel && (
        <span>{belowThresholdLabel}</span>
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
