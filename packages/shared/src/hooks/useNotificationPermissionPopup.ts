import { useMemo, useState } from 'react';
import { webappUrl } from '../lib/constants';
import usePersistentContext from './usePersistentContext';
import { NotificationPromptSource } from '../lib/analytics';
import { useEventListener, MessageEventData } from './useEventListener';

export interface PermissionEvent extends MessageEventData {
  permission: NotificationPermission;
}

export interface UseNotificationPermissionPopup {
  onOpenPopup?: (source: NotificationPromptSource) => void;
  onPermissionCache?: (permission: NotificationPermission) => void;
  onAcceptedPermissionJustNow: (state: boolean) => void;
  acceptedPermissionJustNow: boolean;
  hasPermissionCache: boolean;
}

interface UseNotificationPermissionPopupProps {
  onSuccess?: (subscribed: boolean) => void;
}

export const ENABLE_NOTIFICATION_WINDOW_KEY = 'enableNotificationMessage';
const PERMISSION_NOTIFICATION_KEY = 'permission:notification';

export const useNotificationPermissionPopup = ({
  onSuccess,
}: UseNotificationPermissionPopupProps = {}): UseNotificationPermissionPopup => {
  const [acceptedPermissionJustNow, setAcceptedPermissionJustNow] =
    useState(false);
  const [permissionCache, setPermissionCache] =
    usePersistentContext<NotificationPermission>(
      PERMISSION_NOTIFICATION_KEY,
      'default',
    );

  const onOpenPopup = (source: NotificationPromptSource) => {
    const params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=728,height=756,left=100,top=100`;
    window.open(
      `${webappUrl}popup/notifications/enable?source=${source}`,
      'Enable notifications popup',
      params,
    );
  };

  useEventListener(globalThis, 'message', (e) => {
    if (e.data?.eventKey !== ENABLE_NOTIFICATION_WINDOW_KEY) {
      return;
    }

    const { permission }: PermissionEvent = e?.data ?? {};

    if (!permission) {
      return;
    }

    const isGranted = permission === 'granted';

    setAcceptedPermissionJustNow(isGranted);
    setPermissionCache(permission);
    if (onSuccess) {
      onSuccess(isGranted);
    }
  });

  return useMemo(
    () => ({
      onOpenPopup,
      hasPermissionCache: permissionCache === 'granted',
      acceptedPermissionJustNow,
      onAcceptedPermissionJustNow: setAcceptedPermissionJustNow,
      onPermissionCache: setPermissionCache,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissionCache, acceptedPermissionJustNow],
  );
};
