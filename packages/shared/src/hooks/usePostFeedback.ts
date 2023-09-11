import { useContext, useMemo } from 'react';
import { useFeatureIsOn } from '@growthbook/growthbook-react';
import { useMutation, useQueryClient } from 'react-query';
import { Post, dismissPostFeedback } from '../graphql/posts';
import { optimisticPostUpdateInFeed } from '../lib/feed';
import { Features } from '../lib/featureManagement';
import { updatePostCache } from './usePostById';
import { updateCachedPagePost } from '../lib/query';
import { ActiveFeedContext } from '../contexts';
import { MainFeedPage } from '../components/utilities';
import { EmptyResponse } from '../graphql/emptyResponse';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';

type UsePostFeedbackProps = {
  post?: Pick<Post, 'id' | 'userState' | 'read'>;
};

interface UsePostFeedback {
  showFeedback: boolean;
  dismissFeedback: () => Promise<EmptyResponse>;
  isFeedbackEnabled: boolean;
}

export const usePostFeedback = ({
  post,
}: UsePostFeedbackProps): UsePostFeedback => {
  const client = useQueryClient();
  const { queryKey: feedQueryKey, items } = useContext(ActiveFeedContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const isFeatureEnabled = useFeatureIsOn(
    Features.EngagementLoopJuly2023Upvote.id,
  );
  const isMyFeed = useMemo(() => {
    return feedQueryKey?.some((item) => item === MainFeedPage.MyFeed);
  }, [feedQueryKey]);
  const isFeedbackEnabled = isFeatureEnabled && isMyFeed;

  const dismissFeedbackMutation = useMutation(
    () => dismissPostFeedback(post.id),
    {
      onMutate: () => {
        if (!post) {
          return;
        }

        trackEvent({
          event_name: AnalyticsEvent.ClickDismissFeedback,
        });

        const mutationHandler = (postItem: Post) => {
          return {
            userState: {
              ...postItem.userState,
              flags: {
                ...postItem.userState.flags,
                feedbackDismiss: true,
              },
            },
          };
        };

        if (feedQueryKey) {
          const updateFeedPost = updateCachedPagePost(feedQueryKey, client);
          const updateFeedPostCache = optimisticPostUpdateInFeed(
            items,
            updateFeedPost,
            mutationHandler,
          );
          const postIndex = items.findIndex(
            (item) => item.type === 'post' && item.post.id === post.id,
          );

          if (postIndex === -1) {
            return;
          }

          updateFeedPostCache({ index: postIndex });
        }

        updatePostCache(client, post.id, mutationHandler(post as Post));
      },
    },
  );

  const showFeedback = useMemo(() => {
    if (!isFeedbackEnabled) {
      return false;
    }

    if (!post?.read) {
      return false;
    }

    const isFeedbackDismissed =
      post?.userState?.flags?.feedbackDismiss === true;

    return !isFeedbackDismissed;
  }, [post, isFeedbackEnabled]);

  return {
    showFeedback,
    dismissFeedback: dismissFeedbackMutation.mutateAsync,
    isFeedbackEnabled,
  };
};
