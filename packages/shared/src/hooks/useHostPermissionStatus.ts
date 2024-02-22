import { useQuery } from '@tanstack/react-query';
import { disabledRefetch } from '../lib/func';
import { useExtensionContext } from '../contexts/ExtensionContext';
import { generateQueryKey, RequestKey } from '../lib/query';

export const hostKey = generateQueryKey(RequestKey.Host, null);

export type UseHostStatus = {
  hostGranted: boolean;
  isFetched: boolean;
  isFetching: boolean;
  refetch: () => void;
};

export const useHostStatus = (): UseHostStatus => {
  const { getHostPermission } = useExtensionContext();

  const {
    data: hostGranted,
    isFetched,
    refetch,
    isFetching,
  } = useQuery(
    hostKey,
    async () => {
      if (typeof getHostPermission === 'function') {
        return await getHostPermission();
      }

      return false;
    },
    { ...disabledRefetch },
  );

  return { hostGranted, isFetched, isFetching, refetch };
};
