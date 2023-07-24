import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  clearNotificationPreference,
  getNotificationPreferences,
  muteNotification,
  NotificationPreference,
  notificationPreferenceMap,
  NotificationPreferenceStatus,
} from '../../graphql/notifications';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { NotificationType } from '../../components/notifications/utils';

interface UseNotificationPreference {
  isPreferencesReady: boolean;
  preferences: NotificationPreference[];
  muteNotification: typeof muteNotification;
  clearNotificationPreference: typeof clearNotificationPreference;
}

interface UseNotificationPreferenceProps {
  params: Parameters<typeof getNotificationPreferences>[0];
}

export const checkHasMutedPreference = (
  { notificationType, referenceId, status }: NotificationPreference,
  type: NotificationType,
  id: string,
): boolean =>
  status === NotificationPreferenceStatus.Muted &&
  notificationType === type &&
  referenceId === id;

export const useNotificationPreference = ({
  params,
}: UseNotificationPreferenceProps): UseNotificationPreference => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const key = generateQueryKey(RequestKey.NotificationPreference, user, params);
  const { data, isFetched } = useQuery(key, () =>
    getNotificationPreferences(params),
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
          if (!oldData) return [];

          return oldData.filter(
            (preference) =>
              !checkHasMutedPreference(preference, type, referenceId),
          );
        });
      },
    },
  );

  return {
    preferences: data ?? [],
    muteNotification: muteNotificationAsync,
    clearNotificationPreference: clearNotificationPreferenceAsync,
    isPreferencesReady: isFetched,
  };
};
