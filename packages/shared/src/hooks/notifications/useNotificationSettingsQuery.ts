import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationSettings } from '../../components/notifications/utils';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
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
  const nsKey = generateQueryKey(RequestKey.NotificationSettings, user);
  const { data, isLoading } = useQuery<NotificationSettingsResponse>({
    queryKey: nsKey,
    queryFn: () => gqlClient.request(GET_NOTIFICATION_SETTINGS),
    staleTime: StaleTime.Default,
  });
  const { mutate } = useMutation<
    Awaited<ReturnType<typeof updateNotificationSettings>>,
    unknown,
    NotificationSettings,
    { oldData: NotificationSettingsResponse | undefined }
  >({
    onMutate: (notificationFlags) => {
      const oldData =
        queryClient.getQueryData<NotificationSettingsResponse>(nsKey);

      queryClient.setQueryData(nsKey, {
        notificationSettings: notificationFlags,
      });

      return { oldData };
    },
    onError: (_err, _, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(nsKey, context.oldData);
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
