import type { ReactElement, MutableRefObject } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type OneSignal from 'react-onesignal';
import type { NotificationPromptSource } from '../lib/log';
import { LogEvent } from '../lib/log';
import { checkIsExtension, disabledRefetch } from '../lib/func';
import { useAuthContext } from './AuthContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import { isTesting } from '../lib/constants';
import { useLogContext } from './LogContext';
import type { SubscriptionCallback } from '../components/notifications/utils';

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

interface SubProviderProps {
  children: ReactElement;
  notificationSourceRef: MutableRefObject<string>;
  onSourceChange: PushNotificationsContextData['onSourceChange'];
}

type ChangeEventHandler = Parameters<
  typeof OneSignal.User.PushSubscription.addEventListener
>[1];

function OneSignalSubProvider({
  children,
  notificationSourceRef,
  onSourceChange,
}: SubProviderProps): ReactElement {
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
          provider: 'web',
          permission: 'granted',
          ...(existing_permission && { existing_permission }),
        }),
      });
    }
  };
  const subscriptionCallbackRef =
    useRef<SubscriptionCallback>(subscriptionCallback);
  subscriptionCallbackRef.current = subscriptionCallback;

  const key = generateQueryKey(RequestKey.OneSignal, user);
  const client = useQueryClient();
  const {
    data: OneSignalCache,
    isFetched,
    isLoading,
    isSuccess,
  } = useQuery<typeof OneSignal>({
    queryKey: key,

    queryFn: async () => {
      const osr = client.getQueryData<typeof OneSignal>(key);

      if (osr) {
        return osr;
      }

      const OneSignalImport = (await import('react-onesignal')).default;

      await OneSignalImport.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        serviceWorkerParam: { scope: '/push/onesignal/' },
        serviceWorkerPath: '/push/onesignal/OneSignalSDKWorker.js',
      });

      await OneSignalImport.login(user.id);

      setIsSubscribed(OneSignalImport.User.PushSubscription.optedIn);

      return OneSignalImport;
    },
    ...disabledRefetch,
  });

  const logPermissionGranted = useCallback(
    (source) => subscriptionCallbackRef.current?.(true, source, true),
    [],
  );

  const isEnabled = !!user && !isTesting;
  const isPushSupported = OneSignalCache?.Notifications.isPushSupported();

  useEffect(() => {
    if (!OneSignalCache) {
      return undefined;
    }

    const onChange: ChangeEventHandler = ({ current }) => {
      setIsSubscribed(() => current.optedIn);
      subscriptionCallbackRef.current?.(current.optedIn);
    };

    OneSignalCache.User.PushSubscription.addEventListener('change', onChange);
    return () => {
      OneSignalCache.User.PushSubscription.removeEventListener(
        'change',
        onChange,
      );
    };
  }, [OneSignalCache]);

  return (
    <PushNotificationsContext.Provider
      value={{
        isInitialized: !isEnabled || isFetched || !isSuccess,
        isLoading,
        isSubscribed,
        isPushSupported: !!(isPushSupported && isSuccess && isEnabled),
        onSourceChange,
        logPermissionGranted,
        shouldOpenPopup: false,
        OneSignal: isFetched ? OneSignalCache : null,
      }}
    >
      {children}
    </PushNotificationsContext.Provider>
  );
}

function NativeAppleSubProvider({
  children,
  notificationSourceRef,
  onSourceChange,
}: SubProviderProps): ReactElement {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const subscriptionCallback: SubscriptionCallback = (
    isSubscribedNew,
    source,
    existing_permission,
  ) => {
    if (isSubscribedNew) {
      // TODO: check if we can encapsulate this
      logEvent({
        event_name: LogEvent.ClickEnableNotification,
        extra: JSON.stringify({
          origin: source || notificationSourceRef.current,
          provider: 'apple',
          permission: 'granted',
          // TODO: check if this field is needed
          ...(existing_permission && { existing_permission }),
        }),
      });
    }
  };
  const subscriptionCallbackRef =
    useRef<SubscriptionCallback>(subscriptionCallback);
  subscriptionCallbackRef.current = subscriptionCallback;

  const logPermissionGranted = useCallback(
    (source) => subscriptionCallbackRef.current?.(true, source, true),
    [],
  );

  const key = generateQueryKey(RequestKey.ApplePush, user);
  const { isFetched, isLoading, isSuccess } = useQuery<void>({
    queryKey: key,

    queryFn: async () => {
      return new Promise((resolve) => {
        globalThis.addEventListener(
          'push-permission-state',
          (event: CustomEvent) => {
            // eslint-disable-next-line no-console
            console.log('push-permission-state', event?.detail);
            setIsSubscribed(
              ['authorized', 'ephemeral', 'provisional'].indexOf(
                event?.detail,
              ) > -1,
            );
            resolve();
          },
          { once: true },
        );
        globalThis.webkit.messageHandlers[
          'push-permission-state'
        ].postMessage();
        globalThis.webkit.messageHandlers['push-user-id'].postMessage(user.id);
      });
    },
    ...disabledRefetch,
  });

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('native apple sub provider');
  }, []);

  return (
    <PushNotificationsContext.Provider
      value={{
        isInitialized: isFetched || !isSuccess,
        isLoading,
        isSubscribed,
        isPushSupported: true,
        onSourceChange,
        logPermissionGranted,
        shouldOpenPopup: false,
        OneSignal: null,
      }}
    >
      {children}
    </PushNotificationsContext.Provider>
  );
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

  if (isExtension) {
    throw new Error(
      'PushNotificationContextProvider should only be used in the webapp',
    );
  }

  if (globalThis.webkit && globalThis.webkit.messageHandlers) {
    return (
      <NativeAppleSubProvider
        onSourceChange={onSourceChange}
        notificationSourceRef={notificationSourceRef}
      >
        {children}
      </NativeAppleSubProvider>
    );
  }

  return (
    <OneSignalSubProvider
      onSourceChange={onSourceChange}
      notificationSourceRef={notificationSourceRef}
    >
      {children}
    </OneSignalSubProvider>
  );
}

export const usePushNotificationContext = (): PushNotificationsContextData =>
  useContext(PushNotificationsContext);
