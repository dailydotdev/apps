import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type OSR from 'react-onesignal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  UseNotificationPermissionPopup,
  useNotificationPermissionPopup,
} from '../hooks/useNotificationPermissionPopup';
import usePersistentContext from '../hooks/usePersistentContext';
import { BootApp } from '../lib/boot';
import { isDevelopment, isTesting } from '../lib/constants';
import { checkIsExtension } from '../lib/func';
import AuthContext from './AuthContext';
import { AnalyticsEvent, NotificationPromptSource } from '../lib/analytics';
import { useAnalyticsContext } from './AnalyticsContext';
import { generateQueryKey, RequestKey } from '../lib/query';

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
  onTogglePermission: (
    source: NotificationPromptSource,
  ) => Promise<NotificationPermission>;
  trackPermissionGranted: (source: NotificationPromptSource) => void;
  OneSignal: typeof OSR;
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
  const { trackEvent } = useAnalyticsContext();
  const { user } = useContext(AuthContext);
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);
  const [isAlertShown, setIsAlertShown] = usePersistentContext(
    ALERT_PUSH_KEY,
    true,
  );
  const subscriptionCallbackRef =
    useRef<
      (
        isSubscribed: boolean,
        source?: NotificationPromptSource,
        existing_permission?: boolean,
      ) => unknown
    >();
  const notificationSourceRef = useRef<string>();
  const client = useQueryClient();
  const key = generateQueryKey(RequestKey.OneSignal, user);
  const { data: OneSignal, isFetched } = useQuery<typeof OSR>(
    key,
    async () => {
      const osr = client.getQueryData<typeof OSR>(key);

      if (osr) {
        return osr;
      }

      try {
        const OneSignalReact = (await import('react-onesignal')).default;

        OneSignalReact.Notifications.addEventListener(
          'permissionChange',
          (value) => {
            console.log('changes were made');
            subscriptionCallbackRef.current?.(value);
          },
        );

        await OneSignalReact.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: isDevelopment,
          serviceWorkerParam: { scope: '/push/onesignal/' },
          serviceWorkerPath: '/push/onesignal/OneSignalSDKWorker.js',
        });
        await OneSignalReact.login(user.id);

        return OneSignalReact;
      } catch (err) {
        trackEvent({
          event_name: AnalyticsEvent.GlobalError,
          extra: JSON.stringify({ msg: err }),
        });
        return null;
      }
    },
    {
      enabled: !!user && !isExtension && !isTesting,
    },
  );
  const isSubscribed = OneSignal?.User.PushSubscription.optedIn;

  const onUpdatePush = async (subscribed: boolean) => {
    const { optIn, optOut } = OneSignal.User.PushSubscription;

    if (!subscribed) {
      console.log('is opting out');
      return optOut();
    }

    if (isAlertShown) {
      setIsAlertShown(false);
    }

    console.log('is opting in');
    return optIn();
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

  const onTogglePermission = async (
    source: NotificationPromptSource,
  ): Promise<NotificationPermission> => {
    if (!user) {
      return 'default';
    }

    const { permission } = globalThis.Notification ?? {};

    if (app === BootApp.Extension || permission === 'denied') {
      onOpenPopup(source);
      return null;
    }

    notificationSourceRef.current = source;

    if (permission === 'default') {
      await OneSignal.Notifications.requestPermission(); // temporary to make Safari work for presentation
    }

    const updated = !isSubscribed;
    onUpdatePush(updated);
    onPermissionCache(updated ? 'granted' : 'denied');

    return 'granted';
  };

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

  const isNotificationSupported = useMemo(
    () =>
      !!globalThis.window?.Notification &&
      (!!OneSignal || isTesting) &&
      isFetched &&
      OneSignal?.Notifications.isPushSupported(),
    [OneSignal, isFetched],
  );

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
    onAcceptedPermissionJustNow,
    acceptedPermissionJustNow,
    hasPermissionCache,
    isInitialized: isFetched,
    isNotificationsReady,
    unreadCount: currentUnreadCount,
    isSubscribed,
    shouldShowSettingsAlert: isAlertShown,
    onShouldShowSettingsAlert: setIsAlertShown,
    onTogglePermission,
    clearUnreadCount,
    incrementUnreadCount,
    isNotificationSupported,
    trackPermissionGranted,
    OneSignal,
  };

  return (
    <NotificationsContext.Provider value={data}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationContext = (): NotificationsContextData =>
  useContext(NotificationsContext);
