import { QueryClient, useQueryClient } from 'react-query';
import { useContext } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from './analytics/useAnalyticsQueue';

export const EXTENSION_PERMISSION_KEY = 'extension-permission';

export type RequestContentScripts = (
  origin: string,
  client: QueryClient,
  trackEvent: (e: AnalyticsEvent) => void,
) => () => Promise<boolean>;

export type ContentScriptStatus = () => {
  contentScriptGranted: boolean;
  isFetched: boolean;
};

interface ExtensionPermission {
  useContentScriptStatus: ContentScriptStatus;
  requestContentScripts: () => Promise<boolean>;
  registerBrowserContentScripts: () => Promise<never>;
}

interface UseExtensionPermissionProps {
  origin: string;
}

export const useExtensionPermission = ({
  origin,
}: UseExtensionPermissionProps): ExtensionPermission => {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
  const data = client.getQueryData(EXTENSION_PERMISSION_KEY) || {
    // to avoid having to check for undefined wherever this is used outside the extension
    useContentScriptStatus: () => ({}),
  };

  const {
    registerBrowserContentScripts,
    requestContentScripts,
    useContentScriptStatus,
  } = data as {
    registerBrowserContentScripts: ExtensionPermission['registerBrowserContentScripts'];
    requestContentScripts: RequestContentScripts;
    useContentScriptStatus: ContentScriptStatus;
  };

  return {
    registerBrowserContentScripts,
    requestContentScripts: requestContentScripts?.(origin, client, trackEvent),
    useContentScriptStatus,
  };
};
