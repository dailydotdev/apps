import React, { ReactElement, ReactNode, useContext } from 'react';

import browser from 'webextension-polyfill';
import { useQueryClient } from 'react-query';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { ExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import {
  requestContentScripts,
  getContentScriptPermission,
  getHostPermission,
  HOST_PERMISSIONS,
} from '../lib/extensionScripts';

export type ExtensionContextProviderProps = {
  children?: ReactNode;
};

export const ExtensionContextProvider = ({
  children,
}: ExtensionContextProviderProps): ReactElement => {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);

  const contextData = {
    requestContentScripts: requestContentScripts?.(client, trackEvent),
    getContentScriptPermission,
    getHostPermission,
    requestHostPermissions: browser.permissions.request,
    origins: HOST_PERMISSIONS,
  };

  return (
    <ExtensionContext.Provider value={contextData}>
      {children}
    </ExtensionContext.Provider>
  );
};
