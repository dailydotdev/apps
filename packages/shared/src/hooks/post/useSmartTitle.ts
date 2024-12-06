import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import { POST_FETCH_SMART_TITLE_QUERY, type Post } from '../../graphql/posts';
import { getPostByIdKey } from '../usePostById';
import { usePlusSubscription } from '../usePlusSubscription';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { disabledRefetch } from '../../lib/func';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import { postLogEvent } from '../../lib/feed';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';

type UseSmartTitle = {
  fetchSmartTitle: () => Promise<void>;
  title: string;
  fetchedSmartTitle: boolean;
};

export const useSmartTitle = (post: Post): UseSmartTitle => {
  const client = useQueryClient();
  const { user, isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isPlus, showPlusSubscription } = usePlusSubscription();
  const { completeAction } = useActions();

  const key = useMemo(
    () => [
      ...getPostByIdKey(post?.id),
      'title',
      showPlusSubscription.toString(),
    ],
    [post?.id, showPlusSubscription],
  );
  const fetchSmartTitleKey = generateQueryKey(
    RequestKey.FetchedOriginalTitle,
    user,
    ...getPostByIdKey(post?.id),
  );

  const { data: smartTitle, refetch } = useQuery({
    queryKey: key,
    queryFn: async () => {
      // Enusre that we don't accidentally fetch the smart title for users outside of the feature flag
      if (!showPlusSubscription || !isLoggedIn) {
        return post?.title || post?.sharedPost?.title;
      }

      const data = await gqlClient.request<{
        fetchSmartTitle: { title: string };
      }>(POST_FETCH_SMART_TITLE_QUERY, {
        id: post.sharedPost ? post.sharedPost.id : post?.id,
      });

      if (!isPlus) {
        completeAction(ActionType.FetchedSmartTitle);
      }

      return data.fetchSmartTitle.title;
    },
    enabled: false,
    staleTime: Infinity,
    ...disabledRefetch,
  });

  const { data: fetchedSmartTitle } = useQuery({
    queryKey: fetchSmartTitleKey,
    queryFn: async () => {
      return false;
    },
    staleTime: Infinity,
    ...disabledRefetch,
  });

  const fetchSmartTitle = useCallback(async () => {
    if (!fetchedSmartTitle) {
      await refetch();
    } else {
      client.setQueryData(key, post?.title);
    }
    client.setQueryData(fetchSmartTitleKey, (prevValue: boolean) => !prevValue);
    logEvent(
      postLogEvent(LogEvent.ClickbaitShieldTitle, post, {
        extra: { isPlus },
      }),
    );
  }, [
    fetchedSmartTitle,
    client,
    fetchSmartTitleKey,
    logEvent,
    post,
    isPlus,
    refetch,
    key,
  ]);

  const title = useMemo(() => {
    return fetchedSmartTitle ? smartTitle : post?.title;
  }, [fetchedSmartTitle, smartTitle, post]);

  return {
    fetchSmartTitle,
    title,
    fetchedSmartTitle,
  };
};
