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
  hasPermission: boolean;
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
  const [hasPermission, setHasPermission] = useState(false);
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);
  const {
    onOpenPopup,
    onHasEnabledPermission,
    onPermissionCache,
    hasEnabledPermission,
    hasPermissionCache,
  } = useNotificationPermissionPopup();

  const onUpdatePermission = async (
    value: NotificationPermission,
    updateOneSignal: boolean,
  ) => {
    const isGranted = value === 'granted';
    if (updateOneSignal) {
      await OneSignal?.setSubscription(isGranted);
    }

    setHasPermission(isGranted);
  };

  const onTogglePermission = async (): Promise<NotificationPermission> => {
    if (!user) return 'default';

    if (app === BootApp.Extension) {
      onOpenPopup();
      return null;
    }

    if (hasPermission) {
      await onUpdatePermission('denied', !isExtension);
      return 'denied';
    }

    const result = await globalThis.window?.Notification?.requestPermission();
    await onUpdatePermission(result, !isExtension);

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
      setHasPermission(false);
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
      setOneSignal(OneSignalReact);
      setIsInitialized(true);
      await OneSignalReact.setExternalUserId(user.id);
      const isSubscribed = await OneSignalReact.getSubscription();
      const permission = globalThis.Notification?.permission;
      const isPermitted = permission === 'granted';
      onPermissionCache(permission);
      if (isSubscribed !== isPermitted) {
        OneSignalReact.setSubscription(isPermitted);
      }
      onUpdatePermission(
        isSubscribed && isPermitted ? 'granted' : 'default',
        false,
      );
    });
  }, [isInitialized, isInitializing, user]);

  const data: NotificationsContextData = useMemo(
    () => ({
      onHasEnabledPermission,
      hasEnabledPermission,
      hasPermissionCache,
      isInitialized,
      unreadCount: currentUnreadCount,
      hasPermission,
      onTogglePermission,
      clearUnreadCount: () => setCurrentUnreadCount(0),
      incrementUnreadCount: (value = 1) =>
        setCurrentUnreadCount((current) => current + value),
      get isNotificationSupported() {
        return !!globalThis.window?.Notification;
      },
    }),
    [
      hasPermission,
      currentUnreadCount,
      isInitialized,
      user,
      hasEnabledPermission,
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
