import { useQuery } from 'react-query';
import { useContext } from 'react';
import { disabledRefetch } from '../lib/func';
import { ExtensionContext } from '../contexts/common';

export const contentScriptKey = ['permission_key'];

export type UseContentScriptStatus = {
  contentScriptGranted: boolean;
  isFetched: boolean;
};

export const useContentScriptStatus = (): UseContentScriptStatus => {
  const { getContentScriptPermission } = useContext(ExtensionContext);

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
