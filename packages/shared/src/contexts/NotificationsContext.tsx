import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BootApp } from '../lib/boot';
import { AnalyticsEvent, NotificationPromptSource } from '../lib/analytics';
import { useAnalyticsContext } from './AnalyticsContext';
import { SubscriptionCallback } from '../hooks/notifications/useOneSignal';
import {
  UsePushNotification,
  usePushNotification,
} from '../hooks/notifications/usePushNotification';

export interface NotificationsContextData {
  unreadCount: number;
  isNotificationsReady?: boolean;
  clearUnreadCount: () => void;
  incrementUnreadCount: () => void;
  trackPermissionGranted: (source: NotificationPromptSource) => void;
  push: UsePushNotification;
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

export const NotificationsContextProvider = ({
  app,
  children,
  isNotificationsReady,
  unreadCount = 0,
}: NotificationsContextProviderProps): ReactElement => {
  const { trackEvent } = useAnalyticsContext();
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);
  const subscriptionCallbackRef = useRef<SubscriptionCallback>();
  const notificationSourceRef = useRef<string>();
  const onSourceChange = useCallback((source) => {
    notificationSourceRef.current = source;
  }, []);
  const push = usePushNotification({
    app,
    onSourceChange,
    onSubscriptionChange: subscriptionCallbackRef.current,
  });

  useEffect(() => {
    subscriptionCallbackRef.current = (
      isSubscribedNew,
      source,
      existing_permission,
    ) => {
      if (isSubscribedNew) {
        trackEvent({
          event_name: AnalyticsEvent.ClickEnableNotification,
          extra: JSON.stringify({
            origin: source || notificationSourceRef.current,
            permission: 'granted',
            ...(existing_permission && { existing_permission }),
          }),
        });
      }
    };
  }, [trackEvent, notificationSourceRef]);

  useEffect(() => {
    setCurrentUnreadCount(unreadCount);
  }, [unreadCount]);

  const clearUnreadCount = useCallback(() => setCurrentUnreadCount(0), []);
  const incrementUnreadCount = useCallback(
    (value = 1) => setCurrentUnreadCount((current) => current + value),
    [],
  );
  const trackPermissionGranted = useCallback(
    (source) => subscriptionCallbackRef.current?.(true, source, true),
    [],
  );

  const data: NotificationsContextData = {
    isNotificationsReady,
    unreadCount: currentUnreadCount,
    clearUnreadCount,
    incrementUnreadCount,
    trackPermissionGranted,
    push,
  };

  return (
    <NotificationsContext.Provider value={data}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationContext = (): NotificationsContextData =>
  useContext(NotificationsContext);
