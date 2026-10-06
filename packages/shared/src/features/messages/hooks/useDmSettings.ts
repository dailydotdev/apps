import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { gqlClient } from '../../../graphql/common';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import {
  DIRECT_MESSAGE_SETTINGS_QUERY,
  UPDATE_DIRECT_MESSAGE_SETTINGS_MUTATION,
} from '../graphql';
import { isDmMockMode } from '../transport';

type UseDmSettings = {
  allowsMessages: boolean;
  isFetched: boolean;
  setAllowsMessages: (value: boolean) => Promise<unknown>;
};

type DmSettings = { enabled: boolean };

// Receiving direct messages is on by default; daily-api owns and enforces it.
const useApiDmSettings = (): UseDmSettings => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(
    RequestKey.DirectMessages,
    user,
    'settings',
  );
  const { data, isFetched } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await gqlClient.request<{
        directMessageSettings: DmSettings;
      }>(DIRECT_MESSAGE_SETTINGS_QUERY);

      return res.directMessageSettings;
    },
    enabled: !!user?.id,
  });
  const { mutateAsync } = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await gqlClient.request<{
        updateDirectMessageSettings: DmSettings;
      }>(UPDATE_DIRECT_MESSAGE_SETTINGS_MUTATION, { enabled });

      return res.updateDirectMessageSettings;
    },
    onMutate: (enabled) => {
      const previous = queryClient.getQueryData<DmSettings>(queryKey);
      queryClient.setQueryData<DmSettings>(queryKey, { enabled });

      return previous;
    },
    onError: (_, __, previous) => queryClient.setQueryData(queryKey, previous),
    onSuccess: (settings) => queryClient.setQueryData(queryKey, settings),
  });

  return {
    allowsMessages: data?.enabled !== false,
    isFetched,
    setAllowsMessages: mutateAsync,
  };
};

// Without a chat server the setting can only live on this device.
const useDeviceDmSettings = (): UseDmSettings => {
  const { user } = useAuthContext();
  const [allowsMessages, setAllowsMessages, isFetched] =
    usePersistentContext<boolean>(`dm_allow_messages_${user?.id}`, true, [
      true,
      false,
    ]);

  return {
    allowsMessages: allowsMessages !== false,
    isFetched,
    setAllowsMessages,
  };
};

export const useDmSettings: () => UseDmSettings = isDmMockMode
  ? useDeviceDmSettings
  : useApiDmSettings;
