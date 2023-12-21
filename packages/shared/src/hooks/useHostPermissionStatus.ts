import { useQuery } from '@tanstack/react-query';
import { disabledRefetch } from '../lib/func';
import { useExtensionContext } from '../contexts/ExtensionContext';

export const hostKey = ['host_key'];

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
    () => {
      if (typeof getHostPermission === 'function') {
        return getHostPermission();
      }

      return false;
    },
    { ...disabledRefetch },
  );

  return { hostGranted, isFetched, isFetching, refetch };
};
