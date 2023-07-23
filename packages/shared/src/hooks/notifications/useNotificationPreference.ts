import { useMutation, useQuery } from 'react-query';
import {
  getNotificationPreferences,
  muteNotification,
  NotificationPreference,
} from '../../graphql/notifications';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

interface UseNotificationPreference {
  preferences: NotificationPreference[];
  muteNotification: typeof muteNotification;
}

interface UseNotificationPreferenceProps {
  params: Parameters<typeof getNotificationPreferences>[0];
}

export const useNotificationPreference = ({
  params,
}: UseNotificationPreferenceProps): UseNotificationPreference => {
  const { user } = useAuthContext();
  const { data } = useQuery(
    generateQueryKey(RequestKey.NotificationPreference, user, params),
    () => getNotificationPreferences(params),
  );
  const { mutateAsync: muteNotificationAsync } = useMutation(muteNotification);

  return { preferences: data, muteNotification: muteNotificationAsync };
};
