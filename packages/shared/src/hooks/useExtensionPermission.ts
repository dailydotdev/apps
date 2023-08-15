import { useQueryClient } from 'react-query';

export const EXTENSION_PERMISSION_KEY = 'extension-permission';

export type RequestContentScripts = (
  origin: string,
  onPermission?: UseExtensionPermissionProps['onPermission'],
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
  onPermission?: (granted: boolean) => void;
}

export const useExtensionPermission = ({
  origin,
  onPermission,
}: UseExtensionPermissionProps): ExtensionPermission => {
  const client = useQueryClient();
  const data =
    client.getQueryData<{
      registerBrowserContentScripts: ExtensionPermission['registerBrowserContentScripts'];
      requestContentScripts: RequestContentScripts;
      useContentScriptStatus: ContentScriptStatus;
    }>(EXTENSION_PERMISSION_KEY) || {};

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
    requestContentScripts: requestContentScripts?.(origin, onPermission),
    useContentScriptStatus,
  };
};
