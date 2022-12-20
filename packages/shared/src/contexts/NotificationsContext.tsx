import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isDevelopment } from '../lib/constants';
import AuthContext from './AuthContext';

interface NotificationsContextData {
  unreadCount: number;
  isInitialized: boolean;
  hasPermission: boolean;
  isNotificationSupported: boolean;
  onTogglePermission: () => Promise<boolean>;
}

const NotificationsContext =
  React.createContext<NotificationsContextData>(null);

export default NotificationsContext;

export interface NotificationsContextProviderProps {
  children: ReactNode;
  unreadCount?: number;
}

export const NotificationsContextProvider = ({
  children,
  unreadCount = 0,
}: NotificationsContextProviderProps): ReactElement => {
  const isExtension = !!process.env.TARGET_BROWSER;
  const [OneSignal, setOneSignal] = useState(null);
  const { user } = useContext(AuthContext);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const onTogglePermission = async (): Promise<boolean> => {
    if (!user) return false;

    if (hasPermission) {
      await OneSignal?.setSubscription(false);
      setHasPermission(false);
      return true;
    }

    const result = await globalThis.window?.Notification?.requestPermission();
    const isGranted = result === 'granted';
    setHasPermission(isGranted);
    OneSignal?.setSubscription(isGranted);

    return isGranted;
  };

  useEffect(() => {
    if (isInitialized || !user || isExtension) {
      return;
    }

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
      const isGranted = await OneSignalReact.getSubscription();
      setHasPermission(isGranted);
    });
  }, [isInitialized, user]);

  const data: NotificationsContextData = useMemo(
    () => ({
      isInitialized,
      unreadCount,
      hasPermission,
      onTogglePermission,
      get isNotificationSupported() {
        return !!globalThis.window?.Notification;
      },
    }),
    [hasPermission, unreadCount, isInitialized, user],
  );

  return (
    <NotificationsContext.Provider value={data}>
      {children}
    </NotificationsContext.Provider>
  );
};
