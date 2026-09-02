import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useContext, useEffect, useState } from 'react';

export interface NotificationsContextData {
  unreadCount: number;
  isNotificationsReady?: boolean;
  clearUnreadCount: () => void;
  incrementUnreadCount: (value?: number) => void;
}

const NotificationsContext = React.createContext<NotificationsContextData>(
  null as unknown as NotificationsContextData,
);

export default NotificationsContext;

export interface NotificationsContextProviderProps {
  children: ReactNode;
  unreadCount?: number;
  isNotificationsReady?: boolean;
  onUpdateUnreadCount?: (unreadCount: number) => void;
}

export const NotificationsContextProvider = ({
  children,
  isNotificationsReady,
  onUpdateUnreadCount,
  unreadCount = 0,
}: NotificationsContextProviderProps): ReactElement => {
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);

  useEffect(() => {
    setCurrentUnreadCount(unreadCount);
  }, [unreadCount]);

  const clearUnreadCount = useCallback(() => {
    setCurrentUnreadCount(0);
    onUpdateUnreadCount?.(0);
  }, [onUpdateUnreadCount]);

  const incrementUnreadCount = useCallback(
    (value = 1) => {
      const nextUnreadCount = currentUnreadCount + value;

      setCurrentUnreadCount(nextUnreadCount);
      onUpdateUnreadCount?.(nextUnreadCount);
    },
    [currentUnreadCount, onUpdateUnreadCount],
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
