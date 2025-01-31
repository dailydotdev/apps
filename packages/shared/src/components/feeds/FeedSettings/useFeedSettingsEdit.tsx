import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { ClientError } from 'graphql-request';
import { useRouter } from 'next/router';
import useFeedSettings, {
  getFeedSettingsQueryKey,
} from '../../../hooks/useFeedSettings';
import { webappUrl } from '../../../lib/constants';
import { LogEvent } from '../../../lib/log';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { gqlClient } from '../../../graphql/common';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '../../../graphql/feedSettings';
import {
  useEventListener,
  useFeeds,
  useToastNotification,
} from '../../../hooks';
import { useExitConfirmation } from '../../../hooks/useExitConfirmation';
import type { PromptOptions } from '../../../hooks/usePrompt';
import { usePrompt } from '../../../hooks/usePrompt';
import { labels } from '../../../lib';
import { generateQueryKey } from '../../../lib/query';
import { ButtonColor } from '../../buttons/Button';
import { SharedFeedPage } from '../../utilities';
import type {
  FeedSettingsEditContextValue,
  FeedSettingsFormData,
} from './types';
import type { Feed } from '../../../graphql/feed';
import { FeedType } from '../../../graphql/feed';
import useCustomDefaultFeed from '../../../hooks/feed/useCustomDefaultFeed';
import type { FeedSettingsEditProps } from './FeedSettingsEdit';

const discardEditPrompt: PromptOptions = {
  title: labels.feed.prompt.discard.title,
  description: labels.feed.prompt.discard.description,
  okButton: {
    title: labels.feed.prompt.discard.okButton,
    color: ButtonColor.Ketchup,
  },
};

const discardNewPrompt: PromptOptions = {
  title: labels.feed.prompt.newDiscard.title,
  description: labels.feed.prompt.newDiscard.description,
  okButton: {
    title: labels.feed.prompt.newDiscard.okButton,
    color: ButtonColor.Ketchup,
  },
  cancelButton: {
    title: labels.feed.prompt.newDiscard.cancelButton,
  },
};

export type UseFeedSettingsEditProps = FeedSettingsEditProps;

export type UseFeedSettingsEdit = FeedSettingsEditContextValue;

export const useFeedSettingsEdit = ({
  feedSlugOrId,
  isNewFeed,
}: UseFeedSettingsEditProps): UseFeedSettingsEdit => {
  const discardPrompt = isNewFeed ? discardNewPrompt : discardEditPrompt;
  const router = useRouter();
  const [formState, setFormState] = useState<Partial<FeedSettingsFormData>>();
  const queryClient = useQueryClient();
  const { feeds, updateFeed, deleteFeed } = useFeeds();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();

  const feed = useMemo<Feed>(() => {
    // calculate main feed from user object as fallback for now
    // in the future feedList can return main feed as well
    if (feedSlugOrId === user.id) {
      return {
        id: user.id,
        userId: user.id,
        slug: user.id,
        flags: {
          name: '',
        },
        type: FeedType.Main,
        createdAt: null,
      };
    }

    return feeds?.edges.find(
      (edge) =>
        edge.node.slug === feedSlugOrId || edge.node.id === feedSlugOrId,
    )?.node;
  }, [feeds, feedSlugOrId, user]);
  const feedId = feed?.id;

  const { feedSettings } = useFeedSettings({ feedId, enabled: !!feedId });
  const [isDirty, setDirty] = useState(false);
  const [tagsToRemove, setTagsToRemove] = useState<Record<string, true>>(
    () => ({}),
  );

  const onValidateAction = useCallback(() => {
    return !isDirty;
  }, [isDirty]);

  const { onAskConfirmation } = useExitConfirmation({
    message: discardPrompt.description as string,
    onValidateAction,
  });

  // remove new feed that was not modified by user on page unload
  useEventListener(globalThis?.window, 'beforeunload', () => {
    if (isNewFeed && !isDirty) {
      deleteFeed({ feedId });
    }
  });

  const onBackToFeed = useCallback(
    async ({ action }: { action?: 'discard' | 'save' }) => {
      if (action === 'discard' && isNewFeed) {
        await deleteFeed({ feedId });

        router.back();

        return;
      }

      if (feed?.type === FeedType.Main) {
        router.replace(`${webappUrl}${isCustomDefaultFeed ? 'my-feed' : ''}`);

        return;
      }

      if (feed?.id === defaultFeedId) {
        router.replace(webappUrl);

        return;
      }

      router.replace(`${webappUrl}feeds/${feedSlugOrId}`);
    },
    [
      feed,
      router,
      isCustomDefaultFeed,
      defaultFeedId,
      feedSlugOrId,
      isNewFeed,
      deleteFeed,
      feedId,
    ],
  );

  const feedData = useMemo<FeedSettingsFormData>(() => {
    return {
      name: feed?.flags.name,
      icon: feed?.flags.icon || '',
      ...feed?.flags,
      ...formState,
    };
  }, [feed, formState]);

  const { mutateAsync: onSubmit, isPending: isSubmitPending } = useMutation({
    mutationFn: async () => {
      const result = await updateFeed({ ...feedData, feedId });
      const tagPromises = [
        gqlClient.request(ADD_FILTERS_TO_FEED_MUTATION, {
          feedId: result.id,
          filters: {
            includeTags: feedSettings?.includeTags || [],
          },
        }),
      ];

      const removedTags = Object.keys(tagsToRemove);

      if (removedTags.length > 0) {
        tagPromises.push(
          gqlClient.request(REMOVE_FILTERS_FROM_FEED_MUTATION, {
            feedId: result.id,
            filters: {
              includeTags: removedTags,
            },
          }),
        );
      }

      await Promise.all(tagPromises);

      return result;
    },

    onSuccess: (data) => {
      logEvent({
        event_name: LogEvent.UpdateCustomFeed,
        target_id: data.id,
      });

      queryClient.removeQueries({
        queryKey: getFeedSettingsQueryKey(user, feedId),
      });
      queryClient.removeQueries({
        queryKey: generateQueryKey(SharedFeedPage.Custom, user),
      });

      onAskConfirmation(false);

      onBackToFeed({ action: 'save' });
    },

    onError: (error) => {
      const clientErrors = (error as ClientError)?.response?.errors || [];

      if (
        clientErrors.some(
          (item) => item.message === labels.feed.error.feedNameInvalid.api,
        )
      ) {
        displayToast(labels.feed.error.feedNameInvalid.api);

        return;
      }

      displayToast(labels.error.generic);
    },
  });

  const { mutateAsync: onDelete, status: deleteStatus } = useMutation({
    mutationFn: async () => {
      const shouldDelete = await showPrompt({
        title: `Delete ${feed?.flags?.name || 'feed'}?`,
        description: labels.feed.prompt.delete.description,
        okButton: {
          title: labels.feed.prompt.delete.okButton,
          color: ButtonColor.Ketchup,
        },
      });

      if (!shouldDelete) {
        throw new Error('User cancelled deletion');
      }

      const result = await deleteFeed({ feedId });

      return result;
    },

    onSuccess: (data) => {
      logEvent({
        event_name: LogEvent.DeleteCustomFeed,
        target_id: data.id,
      });

      queryClient.removeQueries({
        queryKey: getFeedSettingsQueryKey(user, feedId),
      });

      onAskConfirmation(false);
      router.replace(webappUrl);
    },
  });

  const shouldRedirectToNewFeed =
    feeds && feedSlugOrId && deleteStatus === 'idle';

  useEffect(() => {
    if (!shouldRedirectToNewFeed) {
      return;
    }

    if (!feed) {
      router.push(`${webappUrl}feeds/new`);
    }
  }, [shouldRedirectToNewFeed, feed, router]);

  const cleanupRef = useRef<() => void>();
  cleanupRef.current = () => {
    queryClient.removeQueries({
      queryKey: getFeedSettingsQueryKey(user, feedId),
    });
  };

  useEffect(() => {
    return () => {
      // cleanup on discard or navigation without save
      cleanupRef.current();
    };
  }, []);

  return {
    feed,
    data: feedData,
    setData: useCallback((data) => {
      setFormState((current) => {
        return { ...current, ...data };
      });
      setDirty(true);
    }, []),
    isSubmitPending,
    onSubmit,
    onDelete,
    deleteStatus,
    onTagClick: useCallback(({ tag, action }) => {
      setDirty(true);

      if (action === 'follow') {
        setTagsToRemove((current) => {
          const newTags = { ...current };
          delete newTags[tag.name];

          return newTags;
        });
      } else {
        setTagsToRemove((current) => {
          return { ...current, [tag.name]: true };
        });
      }
    }, []),
    onDiscard: useCallback(async () => {
      const shouldDiscard =
        onValidateAction() || (await showPrompt(discardPrompt));

      if (shouldDiscard) {
        onAskConfirmation(false);

        setDirty(false);
      }

      return shouldDiscard;
    }, [onValidateAction, showPrompt, onAskConfirmation, discardPrompt]),
    isDirty,
    onBackToFeed,
    isNewFeed,
    editFeed: (callback) => {
      setDirty(true);

      return callback();
    },
  };
};
