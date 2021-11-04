import { UseMutateAsyncFunction, useMutation } from 'react-query';
import { useEffect } from 'react';
import request from 'graphql-request';
import { UPDATE_ALERTS } from '../graphql/alerts';
import { apiUrl } from '../lib/config';
import { FeedSettings } from '../graphql/feedSettings';
import useAlertContext from './useAlertContext';

interface UseFilterAlertReturn {
  disableFilterAlert: UseMutateAsyncFunction;
}

export default function useFilterAlert(
  feedSettings: FeedSettings,
  disableOnLoad = true,
): UseFilterAlertReturn {
  const { alerts, setAlerts } = useAlertContext();

  const { mutateAsync: disableFilterAlert } = useMutation<
    unknown,
    unknown,
    void,
    () => Promise<void>
  >(
    () =>
      request(`${apiUrl}/graphql`, UPDATE_ALERTS, {
        data: { filter: false },
      }),
    {
      onMutate: () => {
        setAlerts({ ...alerts, filter: false });

        return () => setAlerts({ ...alerts, filter: true });
      },
      onError: (_, __, rollback) => rollback(),
    },
  );

  useEffect(() => {
    if (
      disableOnLoad &&
      alerts?.filter &&
      (feedSettings?.includeTags?.length ||
        feedSettings?.blockedTags?.length ||
        feedSettings?.excludeSources?.length ||
        feedSettings?.advancedSettings?.length)
    ) {
      disableFilterAlert();
    }
  }, [alerts?.filter, disableOnLoad, feedSettings]);

  return { disableFilterAlert };
}
