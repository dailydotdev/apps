import { useContext, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Post } from '../graphql/posts';
import { dismissPostFeedback, UserVote } from '../graphql/posts';
import { optimisticPostUpdateInFeed } from '../lib/feed';
import { updateCachedPagePost, updatePostCache } from '../lib/query';
import { ActiveFeedContext } from '../contexts/ActiveFeedContext';
import { SharedFeedPage } from '../components/utilities';
import type { EmptyResponse } from '../graphql/emptyResponse';
import LogContext from '../contexts/LogContext';
import { LogEvent } from '../lib/log';

type UsePostFeedbackProps = {
  post?: Pick<Post, 'id' | 'userState' | 'read'>;
};

interface UsePostFeedback {
  showFeedback: boolean;
  dismissFeedback: () => Promise<EmptyResponse>;
}

export const usePostFeedback = ({
  post,
}: UsePostFeedbackProps = {}): UsePostFeedback => {
  const client = useQueryClient();
  const { queryKey: feedQueryKey, items } = useContext(ActiveFeedContext);
  const { logEvent } = useContext(LogContext);

  const isMyFeed = useMemo(() => {
    return feedQueryKey?.some((item) => item === SharedFeedPage.MyFeed);
  }, [feedQueryKey]);

  const dismissFeedbackMutation = useMutation({
    mutationFn: () => dismissPostFeedback(post.id),

    onMutate: () => {
      if (!post) {
        return;
      }

      logEvent({
        event_name: LogEvent.ClickDismissFeedback,
      });

      const mutationHandler = (postItem: Post) => {
        return {
          userState: {
            ...postItem.userState,
            flags: {
              ...postItem.userState?.flags,
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
  });

  const shouldShowFeedback =
    isMyFeed && !!post?.read && post?.userState?.vote === UserVote.None;

  const showFeedback = useMemo(() => {
    if (!shouldShowFeedback) {
      return false;
    }

    const isFeedbackDismissed =
      post?.userState?.flags?.feedbackDismiss === true;

    return !isFeedbackDismissed;
  }, [post?.userState?.flags?.feedbackDismiss, shouldShowFeedback]);

  return {
    showFeedback,
    dismissFeedback: dismissFeedbackMutation.mutateAsync,
  };
};
