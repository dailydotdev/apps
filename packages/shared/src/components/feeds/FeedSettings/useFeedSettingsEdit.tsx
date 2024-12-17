import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
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
import { useFeeds, useToastNotification } from '../../../hooks';
import { useExitConfirmation } from '../../../hooks/useExitConfirmation';
import { PromptOptions, usePrompt } from '../../../hooks/usePrompt';
import { labels } from '../../../lib';
import { generateQueryKey } from '../../../lib/query';
import { ButtonColor } from '../../buttons/Button';
import { SharedFeedPage } from '../../utilities';
import { FeedSettingsEditContextValue, FeedSettingsFormData } from './types';
import { Feed } from '../../../graphql/feed';

const discardPrompt: PromptOptions = {
  title: labels.feed.prompt.discard.title,
  description: labels.feed.prompt.discard.description,
  okButton: {
    title: labels.feed.prompt.discard.okButton,
    color: ButtonColor.Ketchup,
  },
};

export type UseFeedSettingsEditProps = {
  feedSlugOrId: string;
};

export type UseFeedSettingsEdit = FeedSettingsEditContextValue;

export const useFeedSettingsEdit = ({
  feedSlugOrId,
}: UseFeedSettingsEditProps): UseFeedSettingsEdit => {
  const router = useRouter();
  const [formState, setFormState] = useState<Partial<FeedSettingsFormData>>();
  const queryClient = useQueryClient();
  const { feeds, updateFeed, deleteFeed } = useFeeds();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();

  const feed = useMemo<Feed>(() => {
    return feeds?.edges.find(
      (edge) =>
        edge.node.slug === feedSlugOrId || edge.node.id === feedSlugOrId,
    )?.node;
  }, [feeds, feedSlugOrId]);
  const feedId = feed?.id;

  const { user } = useAuthContext();
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
      router.replace(`${webappUrl}feeds/${data.id}`);
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
    }, [onValidateAction, showPrompt, onAskConfirmation]),
    isDirty,
  };
};
