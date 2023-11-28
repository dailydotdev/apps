import React, { ReactElement, ReactNode, useContext } from 'react';

import browser, { Permissions } from 'webextension-polyfill';
import { QueryClient, useQueryClient } from 'react-query';
import {
  requestContentScripts,
  // registerBrowserContentScripts,
  getContentScriptPermission,
  getHostPermission,
  HOST_PERMISSIONS,
} from '../../../extension/src/lib/extensionScripts';
import AnalyticsContext from './AnalyticsContext';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';

export type RequestContentScripts = (data: {
  origin: string;
  skipRedirect?: boolean;
}) => Promise<boolean>;

export type CreateRequestContentScripts = (
  client: QueryClient,
  trackEvent: (e: AnalyticsEvent) => void,
) => RequestContentScripts;

export interface ExtensionContextData {
  getContentScriptPermission?: () => Promise<boolean>;
  requestContentScripts?: RequestContentScripts;
  registerBrowserContentScripts?: () => Promise<void>;
  getHostPermission?: () => Promise<boolean>;
  requestHostPermissions?: Permissions.Static['request'];
  origins?: string[];
}

export const ExtensionContext = React.createContext<ExtensionContextData>({});

export type ExtensionContextProviderProps = {
  children?: ReactNode;
};

export const ExtensionContextProvider = ({
  children,
}: ExtensionContextProviderProps): ReactElement => {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);

  const contextData = {
    // registerBrowserContentScripts,
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
