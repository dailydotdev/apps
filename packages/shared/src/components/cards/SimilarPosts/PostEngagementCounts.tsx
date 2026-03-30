import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { separatorCharacter } from '../common/common';
import { largeNumberFormat } from '../../../lib';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureUpvoteCountThreshold } from '../../../lib/featureManagement';
import { getUpvoteCountDisplay } from '../../../lib/post';

interface PostEngagementCountsProps {
  upvotes: number;
  comments: number;
  className?: string;
  userHasUpvoted?: boolean;
  shouldEvaluateFeature?: boolean;
}

export function PostEngagementCounts({
  upvotes,
  comments,
  className,
  userHasUpvoted = false,
  shouldEvaluateFeature = false,
}: PostEngagementCountsProps): ReactElement {
  const { value: upvoteThresholdConfig } = useConditionalFeature({
    feature: featureUpvoteCountThreshold,
    shouldEvaluate: shouldEvaluateFeature,
  });
  const { showCount, belowThresholdLabel } = getUpvoteCountDisplay(
    upvotes,
    upvoteThresholdConfig.threshold,
    upvoteThresholdConfig.belowThresholdLabel,
    userHasUpvoted,
  );

  const upvoteText = showCount
    ? `${largeNumberFormat(upvotes)} Upvotes`
    : belowThresholdLabel || '';
  const hasUpvoteText = !!upvoteText;

  return (
    <p
      className={classNames('truncate typo-footnote', className)}
      data-testid="post-engagements-count"
    >
      {upvoteText}
      {hasUpvoteText && comments ? <> {separatorCharacter} </> : ''}
      {comments ? `${largeNumberFormat(comments)} Comments` : ''}
    </p>
  );
}
