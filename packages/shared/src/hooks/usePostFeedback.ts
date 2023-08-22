import { useContext, useEffect, useState } from 'react';
import { useFeatureIsOn } from '@growthbook/growthbook-react';
import { Post, ReadHistoryPost, dismissPostFeedback } from '../graphql/posts';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import { Features } from '../lib/featureManagement';

interface UsePostFeedback {
  hasUpvoteLoopEnabled: boolean;
  hidePostFeedback: boolean;
  hideEngagementLoop: (e: MouseEvent) => void;
}

export const usePostFeedback = (
  post?: Post | ReadHistoryPost,
): UsePostFeedback => {
  const { trackEvent } = useContext(AnalyticsContext);
  const [hidePostFeedback, setHidePostFeedback] = useState(null);

  // const hasUpvoteLoopEnabled = useFeatureIsOn(Features.EngagementLoopJuly2023Upvote);
  const hasUpvoteLoopEnabled = true;

  const hideEngagementLoop = (e: MouseEvent) => {
    e.stopPropagation();

    trackEvent(
      postAnalyticsEvent(AnalyticsEvent.HideEngagementLoop, post, {
        extra: { origin: Origin.EngagementLoopVote },
      }),
    );

    dismissPostFeedback(post.id);
  };

  useEffect(() => {
    if (!post) return;

    setHidePostFeedback(post?.userState?.flags?.feedbackDismiss);
  }, [post]);

  return {
    hasUpvoteLoopEnabled,
    hidePostFeedback,
    hideEngagementLoop,
  };
};
