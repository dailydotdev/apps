import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  title: string;
  fetchedSmartTitle: boolean;
  shieldActive: boolean;
};

const hasGraphqlErrorMessage = (
  error: unknown,
): error is { response: { errors: Array<{ message?: string }> } } => {
  if (typeof error !== 'object' || !error || !('response' in error)) {
    return false;
  }

  const { response } = error;
  if (typeof response !== 'object' || !response || !('errors' in response)) {
    return false;
  }

  return Array.isArray(response.errors);
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

  const { data: smartTitle, refetch } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<PostSmartTitle> => {
      const titleRecord = {
        title: post?.title || post?.sharedPost?.title,
        translation: post.translation,
      };

      // Enusre that we don't accidentally fetch the smart title for users outside of the feature flag
      if (!isLoggedIn) {
        return titleRecord;
      }

      try {
        const data = await gqlClient.request<{
          fetchSmartTitle: PostSmartTitle;
        }>(POST_FETCH_SMART_TITLE_QUERY, {
          id: post.sharedPost ? post.sharedPost.id : post?.id,
        });

        if (!isPlus) {
          if (!user) {
            throw new Error('User is required to update smart title tries');
          }

          await updateUser({
            ...user,
            clickbaitTries: (Number(user.clickbaitTries) || 0) + 1,
          });
          completeAction(ActionType.FetchedSmartTitle);
        }

        return data.fetchSmartTitle;
      } catch (error) {
        const message = hasGraphqlErrorMessage(error)
          ? error.response.errors?.[0]?.message
          : undefined;
        displayToast(message || labels.error.generic);
      }

      return titleRecord;
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

  const { fetchTranslations } = useTranslation({
    clickbaitShieldEnabled: !clickbaitShieldEnabled,
  });

  const fetchSmartTitle = useCallback(async () => {
    if (!fetchedSmartTitle) {
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
    fetchTranslations,
    smartTitle,
  ]);

  const title = useMemo(() => {
    return fetchedSmartTitle && smartTitle
      ? smartTitle.title
      : post?.title || post?.sharedPost?.title;
  }, [fetchedSmartTitle, smartTitle, post?.title, post?.sharedPost?.title]);

  const fetchedSmartTitleValue = fetchedSmartTitle ?? false;
  const smartTitleValue = title ?? '';
  const clickbaitShieldEnabledValue = !!clickbaitShieldEnabled;

  const shieldActive = useMemo(() => {
    return (
      (clickbaitShieldEnabledValue && !fetchedSmartTitleValue) ||
      (!clickbaitShieldEnabledValue && fetchedSmartTitleValue)
    );
  }, [clickbaitShieldEnabledValue, fetchedSmartTitleValue]);

  return {
    fetchSmartTitle,
    title: smartTitleValue,
    fetchedSmartTitle: fetchedSmartTitleValue,
    shieldActive,
  };
};
