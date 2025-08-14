import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationSettings } from '../../components/notifications/utils';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import {
  GET_NOTIFICATION_SETTINGS,
  updateNotificationSettings,
} from '../../graphql/users';

interface NotificationSettingsResponse {
  notificationSettings: NotificationSettings;
}

const useNotificationSettingsQuery = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const nsKey = generateQueryKey(RequestKey.NotificationSettings, {
    id: user?.id,
  });
  const { data, isLoading } = useQuery<NotificationSettingsResponse>({
    queryKey: nsKey,
    queryFn: () => gqlClient.request(GET_NOTIFICATION_SETTINGS),
  });
  const { mutate } = useMutation({
    onMutate: (notificationFlags) => {
      const oldData = queryClient.getQueryData(nsKey);

      queryClient.setQueryData(nsKey, {
        notificationSettings: notificationFlags,
      });

      return { oldData };
    },
    onError: (err, _, { oldData }) => {
      queryClient.setQueryData(nsKey, oldData);
    },
    mutationFn: (notificationFlags: NotificationSettings) => {
      return updateNotificationSettings(notificationFlags);
    },
  });

  return {
    notificationSettings: data?.notificationSettings,
    isLoading,
    mutate,
  };
};

export default useNotificationSettingsQuery;
