import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';

import browser from 'webextension-polyfill';
import { useQueryClient } from '@tanstack/react-query';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import { ExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import {
  requestContentScripts,
  getContentScriptPermission,
  getHostPermission,
  HOST_PERMISSIONS,
  promptUninstallExtension,
} from '../lib/extensionScripts';

export type ExtensionContextProviderProps = {
  currentPage: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  children?: ReactNode;
};

export const ExtensionContextProvider = ({
  currentPage,
  setCurrentPage,
  children,
}: ExtensionContextProviderProps): ReactElement => {
  const client = useQueryClient();
  const { logEvent } = useContext(LogContext);

  const contextData = useMemo(
    () => ({
      requestContentScripts: requestContentScripts?.(client, logEvent),
      getContentScriptPermission,
      getHostPermission,
      requestHostPermissions: browser.permissions.request,
      origins: HOST_PERMISSIONS,
      currentPage,
      setCurrentPage,
      promptUninstallExtension,
    }),
    [client, currentPage, setCurrentPage, logEvent],
  );

  return (
    <ExtensionContext.Provider value={contextData}>
      {children}
    </ExtensionContext.Provider>
  );
};
