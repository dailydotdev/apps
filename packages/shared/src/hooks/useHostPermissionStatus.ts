import { useQuery } from 'react-query';
import { useContext } from 'react';
import { disabledRefetch } from '../lib/func';
import { ExtensionContext } from '../contexts/ExtensionContext';

export const hostKey = ['host_key'];

export type UseHostStatus = {
  hostGranted: boolean;
  isFetched: boolean;
  refetch: () => void;
};

export const useHostStatus = (): UseHostStatus => {
  const { getHostPermission } = useContext(ExtensionContext);

  const {
    data: hostGranted,
    isFetched,
    refetch,
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

  return { hostGranted, isFetched, refetch };
};
