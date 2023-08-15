import { useQueryClient } from 'react-query';

export const EXTENSION_PERMISSION_KEY = 'extension-permission';

export type RequestContentScripts = (
  origin: string,
  onPermission?: UseExtensionPermissionProps['onPermission'],
) => () => Promise<boolean>;

interface ExtensionPermission {
  isFetched?: boolean;
  contentScriptGranted: boolean;
  requestContentScripts: () => Promise<boolean>;
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
  const { requestContentScripts, contentScriptGranted, isFetched } =
    client.getQueryData<{
      requestContentScripts: RequestContentScripts;
      contentScriptGranted: boolean;
      isFetched: boolean;
    }>(EXTENSION_PERMISSION_KEY) || {};

  return {
    requestContentScripts: requestContentScripts?.(origin, onPermission),
    contentScriptGranted,
    isFetched,
  };
};
