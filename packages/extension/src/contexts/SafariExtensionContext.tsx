import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';

import browser from 'webextension-polyfill';
import { ExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import { HOST_PERMISSIONS } from '../lib/extensionScripts';

/**
 * Safari ExtensionContext — provides no-ops for unsupported APIs:
 * - Content script registration (no companion in Safari)
 * - promptUninstallExtension (management.uninstallSelf not available)
 */

export type SafariExtensionContextProviderProps = {
  currentPage: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  children?: ReactNode;
};

const noopContentScripts = () => async () => false;
const noopGetPermission = () => Promise.resolve(false);
const noopUninstall = () => Promise.resolve();

export const SafariExtensionContextProvider = ({
  currentPage,
  setCurrentPage,
  children,
}: SafariExtensionContextProviderProps): ReactElement => {
  const contextData = useMemo(
    () => ({
      requestContentScripts: noopContentScripts(),
      getContentScriptPermission: noopGetPermission,
      getHostPermission: () =>
        browser.permissions.contains({ origins: HOST_PERMISSIONS }),
      requestHostPermissions: browser.permissions.request,
      origins: HOST_PERMISSIONS,
      currentPage,
      setCurrentPage,
      promptUninstallExtension: noopUninstall,
    }),
    [currentPage, setCurrentPage],
  );

  return (
    <ExtensionContext.Provider value={contextData}>
      {children}
    </ExtensionContext.Provider>
  );
};
