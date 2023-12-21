import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

import browser from 'webextension-polyfill';
import { useQueryClient } from '@tanstack/react-query';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { ExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import {
  requestContentScripts,
  getContentScriptPermission,
  getHostPermission,
  HOST_PERMISSIONS,
} from '../lib/extensionScripts';

export type ExtensionContextProviderProps = {
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  children?: ReactNode;
};

export const ExtensionContextProvider = ({
  setCurrentPage,
  children,
}: ExtensionContextProviderProps): ReactElement => {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);

  const contextData = useMemo(
    () => ({
      requestContentScripts: requestContentScripts?.(client, trackEvent),
      getContentScriptPermission,
      getHostPermission,
      requestHostPermissions: browser.permissions.request,
      origins: HOST_PERMISSIONS,
      setCurrentPage,
    }),
    [client, setCurrentPage, trackEvent],
  );

  return (
    <ExtensionContext.Provider value={contextData}>
      {children}
    </ExtensionContext.Provider>
  );
};
