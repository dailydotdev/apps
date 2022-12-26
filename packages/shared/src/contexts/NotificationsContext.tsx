import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isDevelopment, isTesting } from '../lib/constants';
import AuthContext from './AuthContext';

interface NotificationsContextData {
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
}

export const ENABLE_NOTIFICATION_WINDOW_KEY = 'enableNotificationMessage';

export const NotificationsContextProvider = ({
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
      const isPermitted = globalThis.Notification?.permission === 'granted';
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
    [hasPermission, currentUnreadCount, isInitialized, user],
  );

  return (
    <NotificationsContext.Provider value={data}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationContext = (): NotificationsContextData =>
  useContext(NotificationsContext);
