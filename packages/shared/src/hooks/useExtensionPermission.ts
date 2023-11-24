import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from './analytics/useAnalyticsQueue';

export const EXTENSION_PERMISSION_KEY = ['extension-permission'];

export type RequestContentScripts = (data: {
  origin: string;
  skipRedirect?: boolean;
}) => Promise<boolean>;

export type CreateRequestContentScripts = (
  client: QueryClient,
  trackEvent: (e: AnalyticsEvent) => void,
) => RequestContentScripts;

export type ContentScriptStatus = {
  contentScriptGranted: boolean;
  isFetched: boolean;
};

interface ExtensionPermission {
  getContentScriptPermission: () => Promise<boolean>;
  requestContentScripts: RequestContentScripts;
  registerBrowserContentScripts: () => Promise<never>;
}

export const useExtensionPermission = (): ExtensionPermission => {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
  const data = client.getQueryData(EXTENSION_PERMISSION_KEY) || {};

  const {
    registerBrowserContentScripts,
    requestContentScripts,
    getContentScriptPermission,
  } = data as {
    registerBrowserContentScripts: ExtensionPermission['registerBrowserContentScripts'];
    requestContentScripts: CreateRequestContentScripts;
    getContentScriptPermission: ExtensionPermission['getContentScriptPermission'];
  };

  return {
    registerBrowserContentScripts,
    requestContentScripts: requestContentScripts?.(client, trackEvent),
    getContentScriptPermission,
  };
};
