import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  UseNotificationPermissionPopup,
  useNotificationPermissionPopup,
} from '../hooks/useNotificationPermissionPopup';
import usePersistentContext from '../hooks/usePersistentContext';
import { BootApp } from '../lib/boot';
import { isDevelopment, isTesting } from '../lib/constants';
import { checkIsExtension } from '../lib/func';
import AuthContext from './AuthContext';

export interface NotificationsContextData
  extends UseNotificationPermissionPopup {
  unreadCount: number;
  isInitialized: boolean;
  isSubscribed: boolean;
  isNotificationSupported: boolean;
  isNotificationsReady?: boolean;
  shouldShowSettingsAlert?: boolean;
  onShouldShowSettingsAlert?: (state: boolean) => Promise<void>;
  clearUnreadCount: () => void;
  incrementUnreadCount: () => void;
  onTogglePermission: () => Promise<NotificationPermission>;
}

const NotificationsContext =
  React.createContext<NotificationsContextData>(null);

export default NotificationsContext;

export interface NotificationsContextProviderProps {
  children: ReactNode;
  unreadCount?: number;
  isNotificationsReady?: boolean;
  app: BootApp;
}

const ALERT_PUSH_KEY = 'alert_push_key';

export const NotificationsContextProvider = ({
  app,
  children,
  isNotificationsReady,
  unreadCount = 0,
}: NotificationsContextProviderProps): ReactElement => {
  const isExtension = checkIsExtension();
  const [OneSignal, setOneSignal] = useState(null);
  const { user } = useContext(AuthContext);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registrationId, setRegistrationId] = useState<string>(null);
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);
  const [isAlertShown, setIsAlertShown] = usePersistentContext(
    ALERT_PUSH_KEY,
    true,
  );

  const getRegistrationId = async (isGranted: boolean) => {
    if (!isGranted) {
      return '';
    }

    if (registrationId) {
      return registrationId;
    }

    await globalThis.OneSignal?.registerForPushNotifications?.();
    const id = await globalThis.OneSignal?.getRegistrationId();
    setRegistrationId(id);
    await OneSignal?.setExternalUserId?.(user.id);

    return id;
  };

  const onUpdatePush = async (permission: NotificationPermission) => {
    const isGranted = permission === 'granted';
    const id = await getRegistrationId(isGranted);
    const isRegistered = !!id;
    const allowedPush = isGranted && isRegistered;

    await OneSignal?.setSubscription?.(allowedPush);
    setIsSubscribed(allowedPush);

    if (isAlertShown && allowedPush) {
      setIsAlertShown(false);
    }

    return allowedPush;
  };

  const {
    onOpenPopup,
    onAcceptedPermissionJustNow,
    onPermissionCache,
    acceptedPermissionJustNow,
    hasPermissionCache,
  } = useNotificationPermissionPopup({
    onSuccess: !isExtension && onUpdatePush,
  });

  const onUpdatePermission = async (permission: NotificationPermission) => {
    const allowedPush = await onUpdatePush(permission);

    onPermissionCache(allowedPush ? 'granted' : 'default');
  };

  const onTogglePermission = async (): Promise<NotificationPermission> => {
    if (!user) return 'default';

    const { permission } = globalThis.Notification ?? {};

    if (app === BootApp.Extension || permission === 'denied') {
      onOpenPopup();
      return null;
    }

    if (isSubscribed) {
      await onUpdatePermission('denied');
      return 'denied';
    }

    const result = await globalThis.window?.Notification?.requestPermission();
    await onUpdatePermission(result);

    return result;
  };

  useEffect(() => {
    setCurrentUnreadCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    if (isInitialized || isInitializing || !user || isExtension) {
      return;
    }

    if (isTesting) {
      setIsInitialized(true);
      setIsSubscribed(false);
      return;
    }

    setIsInitializing(true);
    import('react-onesignal').then(async (mod) => {
      const OneSignalReact = mod.default;
      await OneSignalReact.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: isDevelopment,
        serviceWorkerParam: { scope: '/push/onesignal/' },
        serviceWorkerPath: '/push/onesignal/OneSignalSDKWorker.js',
      });
      const isGranted = globalThis.Notification?.permission === 'granted';
      const [id, subscribed, externalId] = await Promise.all([
        globalThis.OneSignal?.getRegistrationId(),
        OneSignalReact.getSubscription(),
        OneSignalReact.getExternalUserId(),
      ]);
      const isValidSubscription = subscribed && isGranted;
      setOneSignal(OneSignalReact);
      setIsInitialized(true);
      setIsSubscribed(isValidSubscription);
      if (id) {
        setRegistrationId(id);
      } else if (isValidSubscription) {
        await globalThis.OneSignal?.registerForPushNotifications?.();
        const regId = await globalThis.OneSignal?.getRegistrationId();
        setRegistrationId(regId);
      }

      if (isValidSubscription && !externalId) {
        OneSignalReact.setExternalUserId(user.id);
      }
    });
  }, [isInitialized, isInitializing, user]);

  const data: NotificationsContextData = useMemo(
    () => ({
      onAcceptedPermissionJustNow,
      acceptedPermissionJustNow,
      hasPermissionCache,
      isInitialized,
      isNotificationsReady,
      unreadCount: currentUnreadCount,
      isSubscribed,
      shouldShowSettingsAlert: isAlertShown,
      onShouldShowSettingsAlert: setIsAlertShown,
      onTogglePermission,
      clearUnreadCount: () => setCurrentUnreadCount(0),
      incrementUnreadCount: (value = 1) =>
        setCurrentUnreadCount((current) => current + value),
      get isNotificationSupported() {
        return !!globalThis.window?.Notification;
      },
    }),
    [
      isNotificationsReady,
      isSubscribed,
      unreadCount,
      currentUnreadCount,
      isInitialized,
      user,
      acceptedPermissionJustNow,
      hasPermissionCache,
    ],
  );

  return (
    <NotificationsContext.Provider value={data}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationContext = (): NotificationsContextData =>
  useContext(NotificationsContext);
