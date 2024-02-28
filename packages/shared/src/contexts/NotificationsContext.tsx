import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export interface NotificationsContextData {
  unreadCount: number;
  isNotificationsReady?: boolean;
  clearUnreadCount: () => void;
  incrementUnreadCount: () => void;
}

const NotificationsContext =
  React.createContext<NotificationsContextData>(null);

export default NotificationsContext;

export interface NotificationsContextProviderProps {
  children: ReactNode;
  unreadCount?: number;
  isNotificationsReady?: boolean;
}

export const NotificationsContextProvider = ({
  children,
  isNotificationsReady,
  unreadCount = 0,
}: NotificationsContextProviderProps): ReactElement => {
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);

  useEffect(() => {
    setCurrentUnreadCount(unreadCount);
  }, [unreadCount]);

  const clearUnreadCount = useCallback(() => setCurrentUnreadCount(0), []);
  const incrementUnreadCount = useCallback(
    (value = 1) => setCurrentUnreadCount((current) => current + value),
    [],
  );

  const data: NotificationsContextData = {
    isNotificationsReady,
    unreadCount: currentUnreadCount,
    clearUnreadCount,
    incrementUnreadCount,
  };

  return (
    <NotificationsContext.Provider value={data}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationContext = (): NotificationsContextData =>
  useContext(NotificationsContext);
