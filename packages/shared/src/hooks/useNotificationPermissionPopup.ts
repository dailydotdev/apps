import { useMemo, useState } from 'react';
import { webappUrl } from '../lib/constants';
import usePersistentContext from './usePersistentContext';
import useWindowEvents, { MessageEventData } from './useWindowEvents';

export interface PermissionEvent extends MessageEventData {
  permission: NotificationPermission;
}

export interface UseNotificationPermissionPopup {
  onOpenPopup?: () => void;
  onPermissionCache?: (permission: NotificationPermission) => void;
  onAcceptedPermissionJustNow: (state: boolean) => void;
  acceptedPermissionJustNow: boolean;
  hasPermissionCache: boolean;
}

interface UseNotificationPermissionPopupProps {
  onSuccess?: (permission: NotificationPermission) => void;
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

  const onOpenPopup = () => {
    const params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=728,height=756,left=100,top=100`;
    window.open(
      `${webappUrl}popup/notifications/enable`,
      'Enable notifications popup',
      params,
    );
  };

  useWindowEvents<PermissionEvent>(
    'message',
    ENABLE_NOTIFICATION_WINDOW_KEY,
    (e) => {
      const { permission } = e?.data ?? {};

      if (!permission) {
        return;
      }

      setAcceptedPermissionJustNow(permission === 'granted');
      setPermissionCache(permission);
      onSuccess?.(permission);
    },
  );

  return useMemo(
    () => ({
      onOpenPopup,
      hasPermissionCache: permissionCache === 'granted',
      acceptedPermissionJustNow,
      onAcceptedPermissionJustNow: setAcceptedPermissionJustNow,
      onPermissionCache: setPermissionCache,
    }),
    [permissionCache, acceptedPermissionJustNow],
  );
};
