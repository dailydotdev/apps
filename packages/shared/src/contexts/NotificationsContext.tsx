import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import AuthContext from './AuthContext';

interface NotificationsContextData {
  unreadCount: number;
  hasPermission: boolean;
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

  const data = useMemo(() => {
    return {
      unreadCount,
      hasPermission,
      notificationsAvailable,
      requestPermission,
    };
  }, [hasPermission, user]);

  return (
    <NotificationsContext.Provider value={data}>
      {children}
    </NotificationsContext.Provider>
  );
};
