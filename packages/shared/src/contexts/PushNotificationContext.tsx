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
import { LogEvent, NotificationPromptSource } from '../lib/log';
import { checkIsExtension, disabledRefetch } from '../lib/func';
import { useAuthContext } from './AuthContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import { isTesting } from '../lib/constants';
import { useLogContext } from './LogContext';
import { SubscriptionCallback } from '../components/notifications/utils';

export interface PushNotificationsContextData {
  OneSignal: typeof OneSignal;
  isPushSupported: boolean;
  isInitialized: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  shouldOpenPopup: boolean;
  onSourceChange: (source: string) => void;
  logPermissionGranted: (source: NotificationPromptSource) => void;
}

export const PushNotificationsContext =
  createContext<PushNotificationsContextData>({
    isPushSupported: false,
    isInitialized: true,
    isSubscribed: false,
    isLoading: false,
    shouldOpenPopup: true,
    logPermissionGranted: null,
    onSourceChange: null,
    OneSignal: null,
  });

interface PushNotificationContextProviderProps {
  children: ReactElement;
}

/**
 * This context provider should only be used in the webapp
 */
export function PushNotificationContextProvider({
  children,
}: PushNotificationContextProviderProps): ReactElement {
  const isExtension = checkIsExtension();
  const notificationSourceRef = useRef<string>();
  const onSourceChange = useCallback((source) => {
    notificationSourceRef.current = source;
  }, []);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const subscriptionCallback: SubscriptionCallback = (
    isSubscribedNew,
    source,
    existing_permission,
  ) => {
    if (isSubscribedNew) {
      logEvent({
        event_name: LogEvent.ClickEnableNotification,
        extra: JSON.stringify({
          origin: source || notificationSourceRef.current,
          permission: 'granted',
          ...(existing_permission && { existing_permission }),
        }),
      });
    }
  };
  const subscriptionCallbackRef =
    useRef<SubscriptionCallback>(subscriptionCallback);
  subscriptionCallbackRef.current = subscriptionCallback;
  const isEnabled = !!user && !isTesting;
  const key = generateQueryKey(RequestKey.OneSignal, user);
  const client = useQueryClient();
  const {
    data: OneSignalCache,
    isFetched,
    isLoading,
    isSuccess,
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

      return OneSignal;
    },
    { enabled: isEnabled, ...disabledRefetch },
  );

  const isPushSupported =
    !!globalThis.window?.Notification &&
    OneSignal.Notifications.isPushSupported();

  const logPermissionGranted = useCallback(
    (source) => subscriptionCallbackRef.current?.(true, source, true),
    [],
  );

  useEffect(() => {
    if (!OneSignalCache) {
      return undefined;
    }

    const onChange: Parameters<
      typeof OneSignal.User.PushSubscription.addEventListener
    >[1] = ({ current }) => {
      setIsSubscribed(() => current.optedIn);
      subscriptionCallbackRef.current?.(current.optedIn);
    };

    OneSignal.User.PushSubscription.addEventListener('change', onChange);
    return () => {
      OneSignal.User.PushSubscription.removeEventListener('change', onChange);
    };
  }, [OneSignalCache]);

  if (isExtension) {
    throw new Error(
      'PushNotificationContextProvider should only be used in the webapp',
    );
  }

  return (
    <PushNotificationsContext.Provider
      value={{
        isInitialized: !isEnabled || isFetched || !isSuccess,
        isLoading,
        isSubscribed,
        isPushSupported: isPushSupported && isSuccess && isEnabled,
        onSourceChange,
        logPermissionGranted,
        shouldOpenPopup: false,
        OneSignal: isEnabled && isFetched ? OneSignalCache : null,
      }}
    >
      {children}
    </PushNotificationsContext.Provider>
  );
}

export const usePushNotificationContext = (): PushNotificationsContextData =>
  useContext(PushNotificationsContext);
