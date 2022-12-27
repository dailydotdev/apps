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
import { BootApp } from '../lib/boot';
import { isDevelopment, isTesting } from '../lib/constants';
import AuthContext from './AuthContext';

interface NotificationsContextData extends UseNotificationPermissionPopup {
  unreadCount: number;
  isInitialized: boolean;
  isSubscribed: boolean;
  isNotificationSupported: boolean;
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
  app: BootApp;
}

export const NotificationsContextProvider = ({
  app,
  children,
  unreadCount = 0,
}: NotificationsContextProviderProps): ReactElement => {
  const isExtension = !!process.env.TARGET_BROWSER;
  const [OneSignal, setOneSignal] = useState(null);
  const { user } = useContext(AuthContext);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registrationId, setRegistrationId] = useState<string>(null);
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);
  const {
    onOpenPopup,
    onAcceptedPermissionJustNow,
    onPermissionCache,
    acceptedPermissionJustNow,
    hasPermissionCache,
  } = useNotificationPermissionPopup();

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
    await OneSignal.setExternalUserId(user.id);

    return id;
  };

  const onUpdatePermission = async (permission: NotificationPermission) => {
    const isGranted = permission === 'granted';
    const id = await getRegistrationId(isGranted);
    const isRegistered = !!id;
    const allowedPush = isGranted && isRegistered;

    await OneSignal?.setSubscription(allowedPush);

    setIsSubscribed(allowedPush);
    onPermissionCache(allowedPush ? 'granted' : 'default');
  };

  const onTogglePermission = async (): Promise<NotificationPermission> => {
    if (!user) return 'default';

    if (app === BootApp.Extension) {
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
      });
      const isGranted = globalThis.Notification?.permission === 'granted';
      const id = await globalThis.OneSignal?.getRegistrationId();
      const isEnabled = await OneSignalReact.isPushNotificationsEnabled();
      const subscribed = await OneSignalReact.getSubscription();
      setOneSignal(OneSignalReact);
      setIsInitialized(true);
      setRegistrationId(id);
      setIsSubscribed(isEnabled && subscribed && isGranted);
      if (!isEnabled || !isGranted) {
        await OneSignalReact.setSubscription(false);
      }
      if (id) {
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
      unreadCount: currentUnreadCount,
      isSubscribed,
      onTogglePermission,
      clearUnreadCount: () => setCurrentUnreadCount(0),
      incrementUnreadCount: (value = 1) =>
        setCurrentUnreadCount((current) => current + value),
      get isNotificationSupported() {
        return !!globalThis.window?.Notification;
      },
    }),
    [
      isSubscribed,
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
