import type { ReactElement } from 'react';
import React, {
  useRef,
  useEffect,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import OneSignal from 'react-onesignal';
import type { NotificationPromptSource } from '../lib/log';
import { LogEvent } from '../lib/log';
import { checkIsExtension, disabledRefetch } from '../lib/func';
import { useAuthContext } from './AuthContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import { isTesting } from '../lib/constants';
import { useLogContext } from './LogContext';
import type { SubscriptionCallback } from '../components/notifications/utils';

export interface PushNotificationsContextData {
  isPushSupported: boolean;
  isInitialized: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  shouldOpenPopup: () => boolean;
  subscribe: (source: NotificationPromptSource) => Promise<boolean>;
  unsubscribe: (source: NotificationPromptSource) => Promise<void>;
}

export const PushNotificationsContext =
  createContext<PushNotificationsContextData>({
    isPushSupported: false,
    isInitialized: true,
    isSubscribed: false,
    isLoading: false,
    shouldOpenPopup: () => true,
    subscribe: null,
    unsubscribe: null,
  });

interface PushNotificationContextProviderProps {
  children: ReactElement;
}

type ChangeEventHandler = Parameters<
  typeof OneSignal.Notifications.addEventListener<'permissionChange'>
>[1];

function OneSignalSubProvider({
  children,
}: PushNotificationContextProviderProps): ReactElement {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const sourceRef = useRef<string>();
  const subscriptionCallbackRef = useRef<SubscriptionCallback>();

  const isEnabled = !!user && !isTesting;

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
    enabled: isEnabled,
    ...disabledRefetch,
  });

  const isPushSupported = OneSignalCache?.Notifications.isPushSupported();

  subscriptionCallbackRef.current = async (
    newPermission,
    source,
    existingPermission,
  ) => {
    if (newPermission) {
      await OneSignal.User.PushSubscription.optIn();
      setIsSubscribed(true);

      logEvent({
        event_name: LogEvent.ClickEnableNotification,
        extra: JSON.stringify({
          origin: source || sourceRef.current,
          provider: 'web',
          permission: 'granted',
          ...(existingPermission && {
            existing_permission: existingPermission,
          }),
        }),
      });
    }
  };

  const subscribe = useCallback(
    async (source: NotificationPromptSource) => {
      if (!OneSignalCache) {
        return false;
      }

      sourceRef.current = source;
      const { permission } = OneSignalCache.Notifications;
      if (!permission) {
        await OneSignalCache.Notifications.requestPermission();
      } else {
        await subscriptionCallbackRef.current?.(true, source, true);
      }
      return OneSignalCache.Notifications.permission;
    },
    [OneSignalCache],
  );

  const unsubscribe = useCallback(async () => {
    if (!OneSignalCache) {
      return;
    }
    await OneSignalCache.User.PushSubscription.optOut();
    setIsSubscribed(false);
  }, [OneSignalCache]);

  useEffect(() => {
    if (!OneSignalCache) {
      return undefined;
    }

    const onChange: ChangeEventHandler = (permission) => {
      subscriptionCallbackRef.current?.(permission);
    };

    OneSignalCache.Notifications.addEventListener('permissionChange', onChange);
    return () => {
      OneSignalCache.Notifications.removeEventListener(
        'permissionChange',
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
        isPushSupported: isPushSupported && isSuccess && isEnabled,
        shouldOpenPopup: () => {
          const { permission } = globalThis.Notification ?? {};
          return permission === 'denied';
        },
        subscribe,
        unsubscribe,
      }}
    >
      {children}
    </PushNotificationsContext.Provider>
  );
}

function NativeAppleSubProvider({
  children,
}: PushNotificationContextProviderProps): ReactElement {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const isEnabled = !!user && !isTesting;

  const key = generateQueryKey(RequestKey.ApplePush, user);
  const { isFetched, isLoading, isSuccess } = useQuery<void>({
    queryKey: key,

    queryFn: async () => {
      return new Promise((resolve) => {
        globalThis.addEventListener(
          'push-state',
          (event: CustomEvent) => {
            setIsSubscribed(!!event?.detail);
            resolve();
          },
          { once: true },
        );
        globalThis.webkit.messageHandlers['push-state'].postMessage(null);
        globalThis.webkit.messageHandlers['push-user-id'].postMessage(user.id);
      });
    },
    enabled: isEnabled,
    ...disabledRefetch,
  });

  const subscribe = useCallback(
    async (source: NotificationPromptSource) => {
      return new Promise<boolean>((resolve) => {
        globalThis.addEventListener(
          'push-subscribe',
          (event: CustomEvent) => {
            const subscribed = !!event?.detail;
            setIsSubscribed(subscribed);
            if (subscribed) {
              logEvent({
                event_name: LogEvent.ClickEnableNotification,
                extra: JSON.stringify({
                  origin: source,
                  provider: 'apple',
                  permission: 'granted',
                }),
              });
            }
            resolve(subscribed);
          },
          { once: true },
        );
        globalThis.webkit.messageHandlers['push-subscribe'].postMessage(null);
      });
    },
    [logEvent],
  );

  const unsubscribe = useCallback(async () => {
    globalThis.webkit.messageHandlers['push-unsubscribe'].postMessage(null);
    setIsSubscribed(false);
  }, []);

  return (
    <PushNotificationsContext.Provider
      value={{
        isInitialized: isFetched || !isSuccess,
        isLoading,
        isSubscribed,
        isPushSupported: true,
        shouldOpenPopup: () => false,
        subscribe,
        unsubscribe,
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

  if (isExtension) {
    throw new Error(
      'PushNotificationContextProvider should only be used in the webapp',
    );
  }

  if (globalThis.webkit && globalThis.webkit.messageHandlers) {
    return <NativeAppleSubProvider>{children}</NativeAppleSubProvider>;
  }

  return <OneSignalSubProvider>{children}</OneSignalSubProvider>;
}

export const usePushNotificationContext = (): PushNotificationsContextData =>
  useContext(PushNotificationsContext);
