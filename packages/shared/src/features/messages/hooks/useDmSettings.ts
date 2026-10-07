import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { gqlClient } from '../../../graphql/common';
import { LogEvent } from '../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import {
  DIRECT_MESSAGE_SETTINGS_QUERY,
  UPDATE_DIRECT_MESSAGE_SETTINGS_MUTATION,
} from '../graphql';
import { isDmMockMode } from '../transport';

type UseDmSettings = {
  allowsMessages: boolean;
  isFetched: boolean;
  setAllowsMessages: (value: boolean) => void;
};

type DmSettings = { enabled: boolean };

// Callers outside the messages screen (the privacy page) must pass the flag,
// so users outside the rollout never query the setting.
type UseDmSettingsProps = { enabled?: boolean };

// Receiving direct messages is on by default; daily-api owns and enforces it.
const useApiDmSettings = ({
  enabled = true,
}: UseDmSettingsProps = {}): UseDmSettings => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
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
    enabled: enabled && !!user?.id,
  });
  const { mutate } = useMutation({
    mutationFn: async (isEnabled: boolean) => {
      const res = await gqlClient.request<{
        updateDirectMessageSettings: DmSettings;
      }>(UPDATE_DIRECT_MESSAGE_SETTINGS_MUTATION, { enabled: isEnabled });

      return res.updateDirectMessageSettings;
    },
    onMutate: (isEnabled) => {
      const previous = queryClient.getQueryData<DmSettings>(queryKey);
      queryClient.setQueryData<DmSettings>(queryKey, { enabled: isEnabled });

      return previous;
    },
    onError: (_, __, previous) => {
      queryClient.setQueryData(queryKey, previous);
      displayToast("Couldn't save your message settings. Please try again.");
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKey, settings);
      logEvent({
        event_name: LogEvent.ToggleDirectMessages,
        extra: JSON.stringify({ enabled: settings.enabled }),
      });
    },
  });

  return {
    allowsMessages: data?.enabled !== false,
    isFetched,
    setAllowsMessages: mutate,
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
  const setValue = useCallback(
    (value: boolean) => {
      setAllowsMessages(value);
    },
    [setAllowsMessages],
  );

  return {
    allowsMessages: allowsMessages !== false,
    isFetched,
    setAllowsMessages: setValue,
  };
};

export const useDmSettings: (props?: UseDmSettingsProps) => UseDmSettings =
  isDmMockMode ? useDeviceDmSettings : useApiDmSettings;
