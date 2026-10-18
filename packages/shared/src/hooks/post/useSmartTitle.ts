import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ClientError } from 'graphql-request';
import { gqlClient } from '../../graphql/common';
import type { Post, PostSmartTitle } from '../../graphql/posts';
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
import {
  updateTitleTranslation,
  useTranslation,
} from '../translation/useTranslation';

type UseSmartTitle = {
  fetchSmartTitle: () => Promise<void>;
  title?: string;
  fetchedSmartTitle: boolean;
  shieldActive: boolean;
};

export const useSmartTitle = (post: Post): UseSmartTitle => {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, updateUser, isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isPlus } = usePlusSubscription();
  const { completeAction } = useActions();
  const { flags } = useSettingsContext();

  const { clickbaitShieldEnabled } = flags || {};
  const smartTitlePostId = post?.sharedPost?.id ?? post?.id;

  const key = useMemo(
    () => [
      ...getPostByIdKey(smartTitlePostId),
      { key: 'title', lang: user?.language, clickbaitShieldEnabled },
    ],
    [smartTitlePostId, user?.language, clickbaitShieldEnabled],
  );

  const fetchSmartTitleKey = generateQueryKey(
    RequestKey.FetchedOriginalTitle,
    user,
    ...getPostByIdKey(post?.id),
  );

  // only titles that were fetched outlive the session's feed cards, a query
  // keeps the largest gcTime among its observers
  const hasSmartTitle = !!client.getQueryData(key);

  const { data: smartTitle, refetch } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<PostSmartTitle> => {
      try {
        const data = await gqlClient.request<{
          fetchSmartTitle: PostSmartTitle;
        }>(POST_FETCH_SMART_TITLE_QUERY, {
          id: smartTitlePostId,
        });

        if (!isPlus && user) {
          await updateUser({
            ...user,
            clickbaitTries: (Number(user.clickbaitTries) || 0) + 1,
          });
          completeAction(ActionType.FetchedSmartTitle);
        }

        return data.fetchSmartTitle;
      } catch (error) {
        displayToast(
          (error as ClientError).response?.errors?.[0].message ||
            labels.error.generic,
        );

        throw error;
      }
    },
    enabled: false,
    staleTime: Infinity,
    gcTime: hasSmartTitle ? Infinity : undefined,
    retry: false,
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

  const { fetchTranslations } = useTranslation({
    clickbaitShieldEnabled: !clickbaitShieldEnabled,
  });

  const fetchSmartTitle = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }

    if (!fetchedSmartTitle && !smartTitle) {
      const smartTitlePost: Post = post.sharedPost ? post.sharedPost : post;
      const [translateResult] = await fetchTranslations([smartTitlePost]);

      if (translateResult) {
        client.setQueryData(
          key,
          updateTitleTranslation({
            post: smartTitlePost,
            translation: translateResult,
          }),
        );
      } else {
        const { isSuccess } = await refetch();

        if (!isSuccess) {
          return;
        }
      }
    }

    client.setQueryData(fetchSmartTitleKey, (prevValue: boolean) => !prevValue);

    logEvent(
      postLogEvent(LogEvent.ClickbaitShieldTitle, post, {
        extra: { isPlus },
      }),
    );
  }, [
    isLoggedIn,
    fetchedSmartTitle,
    client,
    fetchSmartTitleKey,
    logEvent,
    post,
    isPlus,
    refetch,
    key,
    fetchTranslations,
    smartTitle,
  ]);

  const title = useMemo(() => {
    return fetchedSmartTitle && smartTitle
      ? smartTitle.title
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
    fetchedSmartTitle: fetchedSmartTitle ?? false,
    shieldActive: shieldActive ?? false,
  };
};
