import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import type { Post } from '../../graphql/posts';
import { POST_FETCH_SMART_TITLE_QUERY } from '../../graphql/posts';
import { usePlusSubscription } from '../usePlusSubscription';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, getPostByIdKey, RequestKey } from '../../lib/query';
import { disabledRefetch } from '../../lib/func';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import { postLogEvent } from '../../lib/feed';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useToastNotification } from '../useToastNotification';
import { labels } from '../../lib';

type UseSmartTitle = {
  fetchSmartTitle: () => Promise<void>;
  title: string;
  fetchedSmartTitle: boolean;
  shieldActive: boolean;
};

export const useSmartTitle = (post: Post): UseSmartTitle => {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isPlus } = usePlusSubscription();
  const { completeAction } = useActions();
  const { flags } = useSettingsContext();

  const { clickbaitShieldEnabled } = flags || {};

  const key = useMemo(
    () => [...getPostByIdKey(post?.id), { key: 'title' }],
    [post?.id],
  );
  const fetchSmartTitleKey = generateQueryKey(
    RequestKey.FetchedOriginalTitle,
    user,
    ...getPostByIdKey(post?.id),
  );

  const { data: smartTitle, refetch } = useQuery({
    queryKey: key,
    queryFn: async () => {
      let title = post?.title || post?.sharedPost?.title;
      // Enusre that we don't accidentally fetch the smart title for users outside of the feature flag
      if (!isLoggedIn) {
        return title;
      }

      try {
        const data = await gqlClient.request<{
          fetchSmartTitle: { title: string };
        }>(POST_FETCH_SMART_TITLE_QUERY, {
          id: post.sharedPost ? post.sharedPost.id : post?.id,
        });

        title = data.fetchSmartTitle.title;
      } catch (error) {
        displayToast(
          error.response?.errors?.[0].message || labels.error.generic,
        );
      }

      if (!isPlus) {
        completeAction(ActionType.FetchedSmartTitle);
      }

      return title;
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
    return fetchedSmartTitle
      ? smartTitle
      : post?.title || post?.sharedPost?.title;
  }, [fetchedSmartTitle, smartTitle, post?.title, post?.sharedPost?.title]);

  const shieldActive = useMemo(() => {
    return (
      (clickbaitShieldEnabled && !fetchedSmartTitle) ||
      (!clickbaitShieldEnabled && fetchedSmartTitle)
    );
  }, [clickbaitShieldEnabled, fetchedSmartTitle]);

  return {
    fetchSmartTitle,
    title,
    fetchedSmartTitle,
    shieldActive,
  };
};
