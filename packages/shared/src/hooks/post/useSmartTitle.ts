import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiErrorResult } from '../../graphql/common';
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
  previewSmartTitle: () => Promise<void>;
  smartTitle?: string;
  smartTitleFailed: boolean;
  title: string;
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

  const key = useMemo(
    () => [...getPostByIdKey(post?.id), { key: 'title', lang: user?.language }],
    [post?.id, user?.language],
  );

  const fetchSmartTitleKey = generateQueryKey(
    RequestKey.FetchedOriginalTitle,
    user,
    ...getPostByIdKey(post?.id),
  );

  const {
    data: smartTitle,
    refetch,
    isError: smartTitleFailed,
  } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<PostSmartTitle> => {
      const titleRecord = {
        title: post?.title || post?.sharedPost?.title,
        translation: post.translation,
      };

      // Enusre that we don't accidentally fetch the smart title for users outside of the feature flag
      if (!isLoggedIn || !user) {
        return titleRecord;
      }

      try {
        const data = await gqlClient.request<{
          fetchSmartTitle: PostSmartTitle;
        }>(POST_FETCH_SMART_TITLE_QUERY, {
          id: post.sharedPost ? post.sharedPost.id : post?.id,
        });

        if (!isPlus) {
          await updateUser({
            ...user,
            clickbaitTries: (Number(user.clickbaitTries) || 0) + 1,
          });
          completeAction(ActionType.FetchedSmartTitle);
        }

        return data.fetchSmartTitle;
      } catch (error) {
        displayToast(
          (error as ApiErrorResult).response?.errors?.[0].message ||
            labels.error.generic,
        );
        throw error;
      }
    },
    enabled: false,
    retry: false,
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

  const { fetchTranslations } = useTranslation({
    clickbaitShieldEnabled: !clickbaitShieldEnabled,
  });

  const loadSmartTitle = useCallback(async () => {
    const smartTitlePost: Post = post.sharedPost ? post.sharedPost : post;
    smartTitlePost.translation = {
      ...smartTitlePost?.translation,
      ...smartTitle?.translation,
    };

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
      await refetch();
    }
  }, [client, post, refetch, key, fetchTranslations, smartTitle]);

  const logSmartTitle = useCallback(() => {
    logEvent(
      postLogEvent(LogEvent.ClickbaitShieldTitle, post, {
        extra: { isPlus },
      }),
    );
  }, [logEvent, post, isPlus]);

  const fetchSmartTitle = useCallback(async () => {
    if (!fetchedSmartTitle) {
      await loadSmartTitle();
    }

    client.setQueryData(fetchSmartTitleKey, (prevValue: boolean) => !prevValue);
    logSmartTitle();
  }, [
    fetchedSmartTitle,
    client,
    fetchSmartTitleKey,
    loadSmartTitle,
    logSmartTitle,
  ]);

  // Loads the smart title into the cache without swapping the visible title.
  const previewSmartTitle = useCallback(async () => {
    if (smartTitle || client.isFetching({ queryKey: key })) {
      return;
    }

    await loadSmartTitle();
    logSmartTitle();
  }, [smartTitle, client, key, loadSmartTitle, logSmartTitle]);

  const title = useMemo(() => {
    return fetchedSmartTitle && smartTitle
      ? smartTitle.title ?? ''
      : post?.title || post?.sharedPost?.title || '';
  }, [fetchedSmartTitle, smartTitle, post?.title, post?.sharedPost?.title]);

  const shieldActive = useMemo(() => {
    return (
      (clickbaitShieldEnabled && !fetchedSmartTitle) ||
      (!clickbaitShieldEnabled && fetchedSmartTitle)
    );
  }, [clickbaitShieldEnabled, fetchedSmartTitle]);

  return {
    fetchSmartTitle,
    previewSmartTitle,
    smartTitle: smartTitle?.title,
    smartTitleFailed,
    title,
    fetchedSmartTitle: fetchedSmartTitle ?? false,
    shieldActive: shieldActive ?? false,
  };
};
