import { useCallback } from 'react';
import { webappUrl } from '../lib/constants';
import { NotificationPromptSource } from '../lib/log';
import { useEventListener, MessageEventData } from './useEventListener';

export interface PermissionEvent extends MessageEventData {
  permission: NotificationPermission;
}

export interface UseNotificationPermissionPopup {
  onOpenPopup?: (source: NotificationPromptSource) => void;
}

interface UseNotificationPermissionPopupProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export const ENABLE_NOTIFICATION_WINDOW_KEY = 'enableNotificationMessage';

export const useNotificationPermissionPopup = ({
  onPermissionChange,
}: UseNotificationPermissionPopupProps = {}): UseNotificationPermissionPopup => {
  const onOpenPopup = useCallback((source: NotificationPromptSource) => {
    const params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=728,height=756,left=100,top=100`;
    window.open(
      `${webappUrl}popup/notifications/enable?source=${source}`,
      'Enable notifications popup',
      params,
    );
  }, []);

  useEventListener(globalThis, 'message', (e) => {
    if (e.data?.eventKey !== ENABLE_NOTIFICATION_WINDOW_KEY) {
      return;
    }

    const { permission }: PermissionEvent = e?.data ?? {};

    if (!permission) {
      return;
    }

    onPermissionChange(permission);
  });

  return { onOpenPopup };
};
