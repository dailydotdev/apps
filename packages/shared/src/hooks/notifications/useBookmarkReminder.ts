import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';
import { addDays, addHours, nextMonday, set } from 'date-fns';
import {
  Bookmark,
  setBookmarkReminder,
  SetBookmarkReminderProps,
} from '../../graphql/bookmarks';
import { useToastNotification } from '../useToastNotification';
import { updatePostCache } from '../usePostById';
import { ActiveFeedContext } from '../../contexts';
import { updateCachedPagePost } from '../../lib/query';
import { optimisticPostUpdateInFeed, postLogEvent } from '../../lib/feed';
import { EmptyResponse } from '../../graphql/emptyResponse';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, NotificationPromptSource } from '../../lib/log';
import { Post } from '../../graphql/posts';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { usePushNotificationMutation } from './usePushNotificationMutation';

export enum ReminderPreference {
  OneHour = 'In 1 hour',
  LaterToday = 'Later today',
  Tomorrow = 'Tomorrow',
  TwoDays = 'In 2 days',
  NextWeek = 'Next week',
}

interface MutateBookmarkProps extends SetBookmarkReminderProps {
  existingReminder?: Date;
  preference: ReminderPreference;
}

interface BookmarkReminderProps {
  postId: string;
  preference: ReminderPreference;
  existingReminder?: Date;
}

interface UseBookmarkReminder {
  onBookmarkReminder: (props: BookmarkReminderProps) => Promise<EmptyResponse>;
  onRemoveReminder: (postId: string) => void;
}

export const getRemindAt = (
  date: Date,
  preference: ReminderPreference,
): Date => {
  const atNineAM = (value: Date) => set(value, { hours: 9, minutes: 0 });

  switch (preference) {
    case ReminderPreference.OneHour:
      return addHours(date, 1);
    case ReminderPreference.LaterToday:
      return set(date, { hours: 19, minutes: 0 });
    case ReminderPreference.Tomorrow:
      return addDays(atNineAM(date), 1);
    case ReminderPreference.TwoDays:
      return addDays(atNineAM(date), 2);
    case ReminderPreference.NextWeek:
      return nextMonday(atNineAM(date));
    default:
      return addHours(date, 1);
  }
};

interface UseBookmarkReminderProps {
  post: Post;
}

export const useBookmarkReminder = ({
  post,
}: UseBookmarkReminderProps): UseBookmarkReminder => {
  const client = useQueryClient();
  const { queryKey: feedQueryKey, items } = useContext(ActiveFeedContext);
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { isPushSupported, isSubscribed } = usePushNotificationContext();
  const { onEnablePush } = usePushNotificationMutation();

  const onUpdateCache = (postId: string, remindAt?: Date) => {
    updatePostCache(client, postId, (_post) => ({
      bookmark: { ..._post.bookmark, remindAt },
    }));

    if (feedQueryKey) {
      const bookmark: Bookmark = { createdAt: new Date(), remindAt };
      const updatePost = updateCachedPagePost(feedQueryKey, client);
      const postIndexToUpdate = items.findIndex(
        (item) => item.type === 'post' && item.post.id === postId,
      );
      const update = optimisticPostUpdateInFeed(items, updatePost, () => ({
        bookmark,
      }));

      update({ index: postIndexToUpdate });
    }
  };

  const { mutateAsync: onUndoReminder } = useMutation(setBookmarkReminder, {
    onSuccess: (_, { postId, remindAt }) => {
      onUpdateCache(postId, remindAt);
    },
  });
  const { mutateAsync: onSetBookmarkReminder } = useMutation(
    ({ postId, remindAt }: MutateBookmarkProps) =>
      setBookmarkReminder({ postId, remindAt }),
    {
      onSuccess: (_, { postId, existingReminder, preference, remindAt }) => {
        onUpdateCache(postId, remindAt);

        displayToast(`Reminder set for ${preference.toLowerCase()}`, {
          onUndo: () => onUndoReminder({ postId, remindAt: existingReminder }),
        });

        if (isPushSupported && !isSubscribed) {
          onEnablePush(NotificationPromptSource.BookmarkReminder);
        }
      },
      onError: () => displayToast('Failed to set reminder'),
    },
  );

  const onBookmarkReminder = useCallback(
    (props: BookmarkReminderProps) => {
      const { preference } = props;
      const now = new Date();
      const isValidPreference =
        Object.values(ReminderPreference).includes(preference);
      const isPastLaterToday = now.getHours() >= 19;
      const isInvalidLaterToday =
        ReminderPreference.LaterToday === preference && isPastLaterToday;

      if (!isValidPreference || isInvalidLaterToday) {
        throw new Error('Invalid preference');
      }

      logEvent(
        postLogEvent(LogEvent.SetBookmarkReminder, post, {
          extra: { remind_in: preference },
        }),
      );

      return onSetBookmarkReminder({
        ...props,
        remindAt: getRemindAt(now, preference),
      });
    },
    [logEvent, onSetBookmarkReminder, post],
  );

  return {
    onBookmarkReminder,
    onRemoveReminder: useCallback(
      (postId) => {
        logEvent(postLogEvent(LogEvent.RemoveBookmarkReminder, post));

        return onUndoReminder({ postId, remindAt: null });
      },
      [logEvent, onUndoReminder, post],
    ),
  };
};
