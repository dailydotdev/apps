import { useQuery } from '@tanstack/react-query';
import { disabledRefetch } from '../lib/func';
import { useExtensionContext } from '../contexts/ExtensionContext';

export const contentScriptKey = ['permission_key'];

export type UseContentScriptStatus = {
  contentScriptGranted: boolean;
  isFetched: boolean;
};

export const useContentScriptStatus = (): UseContentScriptStatus => {
  const { getContentScriptPermission } = useExtensionContext();

  const { data: contentScriptGranted, isFetched } = useQuery(
    contentScriptKey,
    () => {
      if (typeof getContentScriptPermission === 'function') {
        return getContentScriptPermission();
      }

      return false;
    },
    { ...disabledRefetch, enabled: !!getContentScriptPermission },
  );

  return { contentScriptGranted, isFetched };
};
