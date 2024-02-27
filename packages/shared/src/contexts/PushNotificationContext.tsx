import React, {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import OneSignal from 'react-onesignal';
import { AnalyticsEvent, NotificationPromptSource } from '../lib/analytics';
import { disabledRefetch } from '../lib/func';
import { useAuthContext } from './AuthContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import { isTesting } from '../lib/constants';
import { useAnalyticsContext } from './AnalyticsContext';
import { SubscriptionCallback } from '../components/notifications/utils';
import { BootApp } from '../lib/boot';

export interface PushNotificationsContextData {
  OneSignal: typeof OneSignal;
  isPushSupported: boolean;
  isInitialized: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  shouldOpenPopup: boolean;
  onSourceChange: (source: string) => void;
  trackPermissionGranted: (source: NotificationPromptSource) => void;
}

export const PushNotificationsContext =
  createContext<PushNotificationsContextData>({
    isPushSupported: false,
    isInitialized: true,
    isSubscribed: false,
    isLoading: false,
    shouldOpenPopup: true,
    trackPermissionGranted: null,
    onSourceChange: null,
    OneSignal: null,
  });

interface PushNotificationContextProviderProps {
  children: ReactElement;
  app: BootApp;
}

export function PushNotificationContextProvider({
  children,
  app,
}: PushNotificationContextProviderProps): ReactElement {
  const notificationSourceRef = useRef<string>();
  const onSourceChange = useCallback((source) => {
    notificationSourceRef.current = source;
  }, []);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useAuthContext();
  const { trackEvent } = useAnalyticsContext();
  const subscriptionCallbackRef = useRef<SubscriptionCallback>(
    (isSubscribedNew, source, existing_permission) => {
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
    },
  );
  const isEnabled = !!user && !isTesting;
  const key = generateQueryKey(RequestKey.OneSignal, user);
  const client = useQueryClient();
  const {
    data: OneSignalCache,
    isFetched,
    isLoading,
  } = useQuery<typeof OneSignal>(
    key,
    async () => {
      const osr = client.getQueryData<typeof OneSignal>(key);

      if (osr) {
        return osr;
      }

      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        serviceWorkerParam: { scope: '/push/onesignal/' },
        serviceWorkerPath: '/push/onesignal/OneSignalSDKWorker.js',
      });

      await OneSignal.login(user.id);

      setIsSubscribed(OneSignal.User.PushSubscription.optedIn);

      OneSignal.User.PushSubscription.addEventListener(
        'change',
        ({ current }) => {
          setIsSubscribed(() => current.optedIn);
          subscriptionCallbackRef.current?.(current.optedIn);
        },
      );

      return OneSignal;
    },
    { enabled: isEnabled, ...disabledRefetch },
  );

  const isPushSupported =
    !!globalThis.window?.Notification &&
    OneSignal.Notifications.isPushSupported();

  const trackPermissionGranted = useCallback(
    (source) => subscriptionCallbackRef.current?.(true, source, true),
    [],
  );

  const shouldOpenPopup = app !== BootApp.Webapp;

  return (
    <PushNotificationsContext.Provider
      value={{
        isInitialized: !isEnabled || isFetched,
        isLoading,
        isSubscribed,
        isPushSupported,
        onSourceChange,
        trackPermissionGranted,
        shouldOpenPopup,
        OneSignal:
          isEnabled && isFetched && !shouldOpenPopup ? OneSignalCache : null,
      }}
    >
      {children}
    </PushNotificationsContext.Provider>
  );
}

export const usePushNotificationContext = (): PushNotificationsContextData =>
  useContext(PushNotificationsContext);
