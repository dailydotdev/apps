import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AuthContext from './AuthContext';

interface NotificationsContextData {
  unreadCount: number;
  hasPermission: boolean;
  clearUnreadCount: () => void;
  incrementUnreadCount: () => void;
  notificationsAvailable: () => boolean;
  requestPermission: () => Promise<NotificationPermission>;
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
  const { user } = useContext(AuthContext);
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);
  const [hasPermission, setHasPermission] = useState(
    globalThis.window?.Notification?.permission === 'granted',
  );

  const notificationsAvailable = () => {
    return !!globalThis.window?.Notification;
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!user) return 'default';

    const result = await globalThis.window?.Notification?.requestPermission();
    setHasPermission(result === 'granted');
    return result;
  };

  useEffect(() => {
    setCurrentUnreadCount(0);
  }, [unreadCount]);

  const data = useMemo(() => {
    return {
      hasPermission,
      unreadCount: currentUnreadCount,
      clearUnreadCount: () => setCurrentUnreadCount(0),
      incrementUnreadCount: (value = 1) =>
        setCurrentUnreadCount((current) => current + value),
      notificationsAvailable,
      requestPermission,
    };
  }, [hasPermission, currentUnreadCount, unreadCount, user]);

  return (
    <NotificationsContext.Provider value={data}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationContext = (): NotificationsContextData =>
  useContext(NotificationsContext);
