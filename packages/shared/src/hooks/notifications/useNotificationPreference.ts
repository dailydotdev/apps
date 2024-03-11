import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  clearNotificationPreference,
  getNotificationPreferences,
  hideSourceFeedPosts,
  muteNotification,
  NotificationPreference,
  notificationPreferenceMap,
  NotificationPreferenceStatus,
  showSourceFeedPosts,
  subscribeNotification,
} from '../../graphql/notifications';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { NotificationType } from '../../components/notifications/utils';
import { Squad } from '../../graphql/sources';
import { updateFlagsCache } from '../../graphql/source/common';

interface UseNotificationPreference {
  isFetching: boolean;
  isPreferencesReady: boolean;
  preferences: NotificationPreference[];
  hideSourceFeedPosts(): Promise<unknown>;
  showSourceFeedPosts(): Promise<unknown>;
  muteNotification: typeof muteNotification;
  clearNotificationPreference: typeof clearNotificationPreference;
  subscribeNotification: typeof subscribeNotification;
}

export interface UseNotificationPreferenceProps {
  params: Parameters<typeof getNotificationPreferences>[0];
  squad?: Squad;
}

export const checkHasStatusPreference = (
  { notificationType, referenceId, status }: NotificationPreference,
  type: NotificationType,
  id: string,
  targetStatuses: NotificationPreferenceStatus[],
): boolean =>
  targetStatuses.includes(status) &&
  notificationType === type &&
  referenceId === id;

export const useNotificationPreference = ({
  params,
  squad,
}: UseNotificationPreferenceProps): UseNotificationPreference => {
  const { user, isLoggedIn } = useAuthContext();
  const client = useQueryClient();
  const key = generateQueryKey(RequestKey.NotificationPreference, user, params);
  const { data, isFetched, isLoading } = useQuery(
    key,
    () => getNotificationPreferences(params),
    { enabled: isLoggedIn && params?.length > 0, initialData: () => [] },
  );
  const { mutateAsync: muteNotificationAsync } = useMutation(muteNotification, {
    onSuccess: (_, { referenceId, type }) => {
      client.setQueryData<NotificationPreference[]>(key, (oldData = []) => {
        const preference: NotificationPreference = {
          referenceId,
          notificationType: type,
          type: notificationPreferenceMap[type],
          userId: user.id,
          status: NotificationPreferenceStatus.Muted,
        };

        return [...oldData, preference];
      });
    },
  });

  const { mutateAsync: clearNotificationPreferenceAsync } = useMutation(
    clearNotificationPreference,
    {
      onSuccess: (_, { referenceId, type }) => {
        client.setQueryData<NotificationPreference[]>(key, (oldData) => {
          if (!oldData) {
            return [];
          }

          return oldData.filter(
            (preference) =>
              !checkHasStatusPreference(preference, type, referenceId, [
                NotificationPreferenceStatus.Muted,
                NotificationPreferenceStatus.Subscribed,
              ]),
          );
        });
      },
    },
  );

  const { mutateAsync: subscribeNotificationAsync } = useMutation(
    subscribeNotification,
    {
      onSuccess: (_, { referenceId, type }) => {
        client.setQueryData<NotificationPreference[]>(key, (oldData = []) => {
          const preference: NotificationPreference = {
            referenceId,
            notificationType: type,
            type: notificationPreferenceMap[type],
            userId: user.id,
            status: NotificationPreferenceStatus.Subscribed,
          };

          return [...oldData, preference];
        });
      },
    },
  );

  const { mutateAsync: hideSourceFeedPostsAsync } = useMutation(
    hideSourceFeedPosts,
    {
      onSuccess: () => {
        updateFlagsCache(client, squad, user, { hideFeedPosts: true });
      },
    },
  );

  const { mutateAsync: showSourceFeedPostsAsync } = useMutation(
    showSourceFeedPosts,
    {
      onSuccess: () => {
        updateFlagsCache(client, squad, user, { hideFeedPosts: false });
      },
    },
  );

  return {
    hideSourceFeedPosts: useCallback(
      () => hideSourceFeedPostsAsync(squad?.id),
      [hideSourceFeedPostsAsync, squad?.id],
    ),
    showSourceFeedPosts: useCallback(
      () => showSourceFeedPostsAsync(squad?.id),
      [showSourceFeedPostsAsync, squad?.id],
    ),
    isFetching: isLoading,
    preferences: data,
    muteNotification: muteNotificationAsync,
    subscribeNotification: subscribeNotificationAsync,
    clearNotificationPreference: clearNotificationPreferenceAsync,
    isPreferencesReady: isFetched,
  };
};
