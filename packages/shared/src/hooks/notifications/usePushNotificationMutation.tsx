import { useCallback, useState } from 'react';
import type { UserPersistentContextType } from '../usePersistentContext';
import usePersistentContext from '../usePersistentContext';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../useActions';
import type { PermissionEvent } from '../useNotificationPermissionPopup';
import {
  ENABLE_NOTIFICATION_WINDOW_KEY,
  useNotificationPermissionPopup,
} from '../useNotificationPermissionPopup';
import { checkIsExtension } from '../../lib/func';
import type { NotificationPromptSource } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { useEventListener } from '../useEventListener';

export const PERMISSION_NOTIFICATION_KEY = 'permission:notification';

export interface UsePushNotificationMutation {
  acceptedJustNow: boolean;
  hasPermissionCache: boolean;
  onEnablePush: (source: NotificationPromptSource) => Promise<boolean>;
  onTogglePermission: (source: NotificationPromptSource) => Promise<unknown>;
}

interface UsePushNotificationMutationProps {
  onPopupGranted?(): void;
}

export const usePermissionCache =
  (): UserPersistentContextType<NotificationPermission> =>
    usePersistentContext(PERMISSION_NOTIFICATION_KEY, 'default');

export const usePushNotificationMutation = ({
  onPopupGranted,
}: UsePushNotificationMutationProps = {}): UsePushNotificationMutation => {
  const isExtension = checkIsExtension();
  const { isSubscribed, shouldOpenPopup, subscribe, unsubscribe } =
    usePushNotificationContext();
  const { user } = useAuthContext();
  const [acceptedJustNow, onAcceptedJustNow] = useState(false);
  const { completeAction, checkHasCompleted } = useActions();
  const [permissionCache, setPermissionCache] = usePermissionCache();

  const onGranted = useCallback(async () => {
    await setPermissionCache('granted');
    onAcceptedJustNow(true);

    if (!checkHasCompleted(ActionType.EnableNotification)) {
      await completeAction(ActionType.EnableNotification);
    }

    return true;
  }, [
    checkHasCompleted,
    completeAction,
    setPermissionCache,
    onAcceptedJustNow,
  ]);

  const { onOpenPopup } = useNotificationPermissionPopup({
    onPermissionChange: (permission) => {
      if (isExtension) {
        return null;
      }

      if (permission === 'granted') {
        return onGranted();
      }

      return setPermissionCache(permission);
    },
  });

  const onEnablePush = useCallback(
    async (source: NotificationPromptSource): Promise<boolean> => {
      if (!user) {
        return false;
      }

      if (shouldOpenPopup()) {
        onOpenPopup(source);
        return false;
      }

      const isGranted = subscribe(source);
      if (isGranted) {
        await onGranted();
      }

      return isGranted;
    },
    [user, shouldOpenPopup, subscribe, onOpenPopup, onGranted],
  );

  const onTogglePermission = useCallback(
    async (source: NotificationPromptSource): Promise<unknown> => {
      if (isSubscribed) {
        return unsubscribe(source);
      }

      return onEnablePush(source);
    },
    [isSubscribed, onEnablePush, unsubscribe],
  );

  useEventListener(globalThis, 'message', async (e) => {
    const { permission }: PermissionEvent = e?.data ?? {};
    const earlyReturnChecks = [
      e.data?.eventKey !== ENABLE_NOTIFICATION_WINDOW_KEY,
      !shouldOpenPopup,
      permission !== 'granted',
    ];

    if (earlyReturnChecks.some(Boolean)) {
      return;
    }

    await onGranted();

    if (onPopupGranted) {
      onPopupGranted();
    }
  });

  return {
    hasPermissionCache: permissionCache === 'granted',
    onTogglePermission,
    acceptedJustNow,
    onEnablePush,
  };
};
