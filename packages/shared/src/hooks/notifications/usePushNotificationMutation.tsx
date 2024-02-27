import { useCallback, useState } from 'react';
import usePersistentContext, {
  UserPersistentContextType,
} from '../usePersistentContext';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../useActions';
import { useNotificationPermissionPopup } from '../useNotificationPermissionPopup';
import { checkIsExtension } from '../../lib/func';
import { NotificationPromptSource } from '../../lib/analytics';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';

export const PERMISSION_NOTIFICATION_KEY = 'permission:notification';

export interface UsePushNotificationMutation {
  acceptedJustNow: boolean;
  hasPermissionCache: boolean;
  onEnablePush: (source: NotificationPromptSource) => Promise<boolean>;
  onTogglePermission: (source: NotificationPromptSource) => Promise<unknown>;
}

export const usePermissionCache =
  (): UserPersistentContextType<NotificationPermission> =>
    usePersistentContext(PERMISSION_NOTIFICATION_KEY, 'default');

export const usePushNotificationMutation = (): UsePushNotificationMutation => {
  const isExtension = checkIsExtension();
  const { onSourceChange, OneSignal, isSubscribed, shouldOpenPopup } =
    usePushNotificationContext();
  const { user } = useAuthContext();
  const [acceptedJustNow, onAcceptedJustNow] = useState(false);
  const { completeAction, checkHasCompleted } = useActions();
  const [permissionCache, setPermissionCache] = usePermissionCache();

  const onGranted = useCallback(async () => {
    setPermissionCache('granted');
    onAcceptedJustNow(true);

    if (!checkHasCompleted(ActionType.EnableNotification)) {
      completeAction(ActionType.EnableNotification);
    }

    await OneSignal.User.PushSubscription.optIn();

    return true;
  }, [
    OneSignal,
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

      const { permission } = globalThis.Notification ?? {};

      if (shouldOpenPopup || permission === 'denied') {
        onOpenPopup(source);
        return false;
      }

      onSourceChange(source);

      if (permission === 'granted') {
        return onGranted();
      }

      await OneSignal.Notifications.requestPermission();

      const isGranted = OneSignal.Notifications.permission;

      if (isGranted) {
        await onGranted();
      }

      return isGranted;
    },
    [user, shouldOpenPopup, onSourceChange, OneSignal, onOpenPopup, onGranted],
  );

  const onTogglePermission = useCallback(
    async (source: NotificationPromptSource): Promise<unknown> => {
      if (isSubscribed) {
        onSourceChange(source);
        return OneSignal.User.PushSubscription.optOut();
      }

      return onEnablePush(source);
    },
    [OneSignal, isSubscribed, onEnablePush, onSourceChange],
  );

  return {
    hasPermissionCache: permissionCache === 'granted',
    onTogglePermission,
    acceptedJustNow,
    onEnablePush,
  };
};
