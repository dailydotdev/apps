import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { ClientError } from 'graphql-request';
import { useRouter } from 'next/router';
import useFeedSettings, {
  getFeedSettingsQueryKey,
} from '../../../hooks/useFeedSettings';
import { plusUrl, webappUrl } from '../../../lib/constants';
import { LogEvent } from '../../../lib/log';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { gqlClient } from '../../../graphql/common';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '../../../graphql/feedSettings';
import {
  useConditionalFeature,
  useEventListener,
  useFeeds,
  usePlusSubscription,
  useToastNotification,
  useViewSizeClient,
  ViewSize,
} from '../../../hooks';
import { featureFeedTagChips } from '../../../lib/featureManagement';
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

export type UseFeedSettingsEditProps = FeedSettingsEditProps;

export type UseFeedSettingsEdit = FeedSettingsEditContextValue;

export const useFeedSettingsEdit = ({
  feedSlugOrId,
  isNewFeed,
}: UseFeedSettingsEditProps): UseFeedSettingsEdit => {
  const { isPlus } = usePlusSubscription();
  const { value: isFeedTagChipsEnabled } = useConditionalFeature({
    feature: featureFeedTagChips,
    shouldEvaluate: !isPlus,
  });

  const isMobile = useViewSizeClient(ViewSize.MobileL);
  const discardNewPrompt: PromptOptions = {
    title: labels.feed.prompt.newDiscard.title,
    description: isPlus
      ? labels.feed.prompt.newDiscard.descriptionPlus
      : labels.feed.prompt.newDiscard.description,
    okButton: {
      title: labels.feed.prompt.newDiscard.okButton,
      color: ButtonColor.Ketchup,
    },
    cancelButton: {
      title: labels.feed.prompt.newDiscard.cancelButton,
    },
  };

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

  const feed = useMemo<Feed | undefined>(() => {
    // calculate main feed from user object as fallback for now
    // in the future feedList can return main feed as well
    if (user && feedSlugOrId === user.id) {
      return {
        id: user.id,
        userId: user.id,
        slug: user.id,
        flags: {
          name: '',
        },
        type: FeedType.Main,
        createdAt: new Date(),
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
    if (isNewFeed && !isDirty && feedId) {
      deleteFeed({ feedId });
    }
  });

  const onBackToFeed = useCallback(
    async ({ action }: { action?: 'discard' | 'save' }) => {
      if (action === 'save' && isNewFeed && !isPlus && !isFeedTagChipsEnabled) {
        // Pre-chips behavior: non-Plus saving a new feed gets redirected to
        // the Plus upgrade page. Once the chips feature is on, free users
        // own their feeds and land on the new feed instead.
        router.replace(plusUrl);

        return;
      }

      if (action === 'discard' && isNewFeed) {
        if (feedId) {
          // Fire-and-forget — onMutate updates the cache optimistically so
          // navigation is instant; the server round-trip happens in the bg.
          deleteFeed({ feedId });
        }

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
      isPlus,
      isFeedTagChipsEnabled,
    ],
  );

  const feedData = useMemo<FeedSettingsFormData>(() => {
    return {
      name: feed?.flags?.name ?? '',
      icon: feed?.flags?.icon || '',
      ...feed?.flags,
      ...formState,
    };
  }, [feed, formState]);

  const { mutateAsync: onSubmit, isPending: isSubmitPending } = useMutation({
    mutationFn: async () => {
      if (!feedId) {
        throw new Error('Cannot update feed without an id');
      }
      // Free users can only edit name + icon; advanced flags are Plus-only and
      // rejected server-side. Scope the payload so saving name/icon never trips
      // that guard on feeds that already carry advanced flags.
      const updatePayload = isPlus
        ? { ...feedData, feedId }
        : { feedId, name: feedData.name, icon: feedData.icon };
      const result = await updateFeed(updatePayload);
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

      if (!feedId) {
        throw new Error('Cannot delete feed without an id');
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

  const cleanupRef = useRef<() => void>();
  cleanupRef.current = () => {
    queryClient.removeQueries({
      queryKey: getFeedSettingsQueryKey(user, feedId),
    });
  };

  useEffect(() => {
    return () => {
      // cleanup on discard or navigation without save
      cleanupRef.current?.();
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
      if (!tag.name) {
        return;
      }
      setDirty(true);
      const tagName = tag.name;

      if (action === 'follow') {
        setTagsToRemove((current) => {
          const newTags = { ...current };
          delete newTags[tagName];

          return newTags;
        });
      } else {
        setTagsToRemove((current) => {
          return { ...current, [tagName]: true };
        });
      }
    }, []),
    onDiscard: useCallback(
      async ({ activeView } = {}) => {
        // on mobile each section has its own state so when going back
        // we always prompt for discard
        const showMobileSectionDiscard = isMobile && activeView;

        const shouldDiscard =
          onValidateAction() ||
          (await showPrompt(
            showMobileSectionDiscard ? discardEditPrompt : discardPrompt,
          ));

        if (shouldDiscard) {
          onAskConfirmation(false);

          setDirty(false);
        }

        return shouldDiscard;
      },
      [
        onValidateAction,
        showPrompt,
        onAskConfirmation,
        discardPrompt,
        isMobile,
      ],
    ),
    isDirty,
    onBackToFeed,
    isNewFeed: isNewFeed ?? false,
    editFeedSettings: (callback) => {
      // all async operations usually don't require dirty state
      // only when we are creating a new feed we log it because
      // we delete it if user tries to quit without confirmation
      if (isNewFeed) {
        setDirty(true);
      }

      if (typeof callback === 'function') {
        return callback();
      }

      return undefined;
    },
  };
};
