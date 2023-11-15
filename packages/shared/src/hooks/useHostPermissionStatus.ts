import { useQuery } from 'react-query';
import { useExtensionPermission } from './useExtensionPermission';
import { disabledRefetch } from '../lib/func';

export const hostKey = ['host_key'];

export type UseHostStatus = {
  hostGranted: boolean;
  isFetched: boolean;
};

export const useHostStatus = (): UseHostStatus => {
  const { getHostPermission } = useExtensionPermission();

  const { data: hostGranted, isFetched } = useQuery(
    hostKey,
    () => {
      if (typeof getHostPermission === 'function') {
        return getHostPermission();
      }

      return false;
    },
    { ...disabledRefetch, enabled: !!getHostPermission },
  );

  return { hostGranted, isFetched };
};
