import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { NotificationPreference } from '../../graphql/notifications';
import {
  clearNotificationPreference,
  getNotificationPreferences,
  hideSourceFeedPosts,
  muteNotification,
  notificationPreferenceMap,
  NotificationPreferenceStatus,
  showSourceFeedPosts,
  subscribeNotification,
} from '../../graphql/notifications';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { NotificationType } from '../../components/notifications/utils';
import type { Squad } from '../../graphql/sources';
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
  optimistic?: boolean;
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
  optimistic = false,
}: UseNotificationPreferenceProps): UseNotificationPreference => {
  const { user, isLoggedIn } = useAuthContext();
  const client = useQueryClient();
  const key = generateQueryKey(RequestKey.NotificationPreference, user, params);
  const {
    data = [],
    isFetched,
    isPending,
  } = useQuery({
    queryKey: key,
    queryFn: () => getNotificationPreferences(params),
    enabled: isLoggedIn && params?.length > 0,
    staleTime: StaleTime.Default,
  });

  const applySubscribe = (
    oldData: NotificationPreference[] = [],
    referenceId: string,
    type: NotificationType,
  ): NotificationPreference[] => {
    if (!user) {
      return oldData;
    }

    const notificationType = notificationPreferenceMap[type];
    if (!notificationType) {
      return oldData;
    }

    const preference: NotificationPreference = {
      referenceId,
      notificationType: type,
      type: notificationType,
      userId: user.id,
      status: NotificationPreferenceStatus.Subscribed,
    };

    return [
      ...oldData.filter(
        (pref) =>
          !(pref.notificationType === type && pref.referenceId === referenceId),
      ),
      preference,
    ];
  };

  const applyClear = (
    oldData: NotificationPreference[] | undefined,
    referenceId: string,
    type: NotificationType,
  ): NotificationPreference[] => {
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
  };

  const rollback = (
    _: unknown,
    __: unknown,
    previous: NotificationPreference[] | undefined,
  ) => {
    if (typeof previous !== 'undefined') {
      client.setQueryData(key, previous);
    }
  };
  const { mutateAsync: muteNotificationAsync } = useMutation({
    mutationFn: muteNotification,
    onSuccess: (_, { referenceId, type }) => {
      client.setQueryData<NotificationPreference[]>(key, (oldData = []) => {
        if (!user) {
          return oldData;
        }

        const notificationType = notificationPreferenceMap[type];
        if (!notificationType) {
          return oldData;
        }

        const preference: NotificationPreference = {
          referenceId,
          notificationType: type,
          type: notificationType,
          userId: user.id,
          status: NotificationPreferenceStatus.Muted,
        };

        const filteredData = oldData.filter(
          (pref) =>
            !(
              pref.notificationType === type && pref.referenceId === referenceId
            ),
        );

        return [...filteredData, preference];
      });
    },
  });

  const { mutateAsync: clearNotificationPreferenceAsync } = useMutation({
    mutationFn: clearNotificationPreference,
    onMutate: ({ referenceId, type }) => {
      if (!optimistic) {
        return undefined;
      }

      const previous = client.getQueryData<NotificationPreference[]>(key);
      client.setQueryData<NotificationPreference[]>(key, (oldData) =>
        applyClear(oldData, referenceId, type),
      );

      return previous;
    },
    onSuccess: (_, { referenceId, type }) => {
      if (optimistic) {
        return;
      }

      client.setQueryData<NotificationPreference[]>(key, (oldData) =>
        applyClear(oldData, referenceId, type),
      );
    },
    onError: rollback,
  });

  const { mutateAsync: subscribeNotificationAsync } = useMutation({
    mutationFn: subscribeNotification,
    onMutate: ({ referenceId, type }) => {
      if (!optimistic) {
        return undefined;
      }

      const previous = client.getQueryData<NotificationPreference[]>(key);
      client.setQueryData<NotificationPreference[]>(key, (oldData = []) =>
        applySubscribe(oldData, referenceId, type),
      );

      return previous;
    },
    onSuccess: (_, { referenceId, type }) => {
      if (optimistic) {
        return;
      }

      client.setQueryData<NotificationPreference[]>(key, (oldData = []) =>
        applySubscribe(oldData, referenceId, type),
      );
    },
    onError: rollback,
  });

  const { mutateAsync: hideSourceFeedPostsAsync } = useMutation({
    mutationFn: hideSourceFeedPosts,
    onSuccess: () => {
      if (!squad || !user) {
        return;
      }

      updateFlagsCache(client, squad, user, { hideFeedPosts: true });
    },
  });

  const { mutateAsync: showSourceFeedPostsAsync } = useMutation({
    mutationFn: showSourceFeedPosts,
    onSuccess: () => {
      if (!squad || !user) {
        return;
      }

      updateFlagsCache(client, squad, user, { hideFeedPosts: false });
    },
  });

  return {
    hideSourceFeedPosts: useCallback(() => {
      if (!squad?.id) {
        return Promise.resolve();
      }

      return hideSourceFeedPostsAsync(squad.id);
    }, [hideSourceFeedPostsAsync, squad]),
    showSourceFeedPosts: useCallback(() => {
      if (!squad?.id) {
        return Promise.resolve();
      }

      return showSourceFeedPostsAsync(squad.id);
    }, [showSourceFeedPostsAsync, squad]),
    isFetching: isPending,
    preferences: data,
    muteNotification: muteNotificationAsync,
    subscribeNotification: subscribeNotificationAsync,
    clearNotificationPreference: clearNotificationPreferenceAsync,
    isPreferencesReady: isFetched,
  };
};
