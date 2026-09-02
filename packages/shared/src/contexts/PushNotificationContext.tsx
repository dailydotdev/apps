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
import type OneSignal from 'react-onesignal';
import type { NotificationPromptSource } from '../lib/log';
import { LogEvent } from '../lib/log';
import {
  checkIsExtension,
  disabledRefetch,
  isIOSNative,
  promisifyEventListener,
} from '../lib/func';
import { useAuthContext } from './AuthContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import { isTesting } from '../lib/constants';
import { useLogContext } from './LogContext';
import type { SubscriptionCallback } from '../components/notifications/utils';
import { postWebKitMessage, WebKitMessageHandlers } from '../lib/ios';
import { syncWebPushSubscription } from '../graphql/notifications';
import { storageWrapper } from '../lib/storageWrapper';

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
    subscribe: async () => false,
    unsubscribe: async () => undefined,
  });

interface PushNotificationContextProviderProps {
  children: ReactElement;
}

type ChangeEventHandler = Parameters<
  typeof OneSignal.Notifications.addEventListener<'permissionChange'>
>[1];

type PushSubscriptionChangeHandler = Parameters<
  typeof OneSignal.User.PushSubscription.addEventListener
>[1];

type WebPushSubscriptionState = {
  subscriptionId?: string | null;
  optedIn?: boolean;
};

const webPushSyncStorageKey = 'web-push-subscription-synced';

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
      if (!user) {
        throw new Error('Cannot initialize OneSignal push without user');
      }

      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
      if (!appId) {
        throw new Error('NEXT_PUBLIC_ONESIGNAL_APP_ID is required');
      }

      const osr = client.getQueryData<typeof OneSignal>(key);

      if (osr) {
        return osr;
      }

      const OneSignalImport = (await import('react-onesignal')).default;

      await OneSignalImport.init({
        appId,
        serviceWorkerParam: { scope: '/push/onesignal/' },
        serviceWorkerPath: '/push/onesignal/OneSignalSDKWorker.js',
      });

      await OneSignalImport.login(user.id);

      setIsSubscribed(!!OneSignalImport.User.PushSubscription.optedIn);

      return OneSignalImport;
    },
    enabled: isEnabled,
    ...disabledRefetch,
  });

  const isPushSupported = OneSignalCache?.Notifications.isPushSupported();

  const syncCurrentWebPushSubscription = useCallback(
    async (state?: WebPushSubscriptionState) => {
      if (!OneSignalCache || !user) {
        return;
      }

      const subscriptionId =
        state?.subscriptionId ??
        OneSignalCache.User.PushSubscription.id ??
        undefined;
      const optedIn =
        state?.optedIn ?? OneSignalCache.User.PushSubscription.optedIn ?? false;
      const marker =
        optedIn && subscriptionId ? `${user.id}:${subscriptionId}` : undefined;

      if (marker && storageWrapper.getItem(webPushSyncStorageKey) === marker) {
        return;
      }

      try {
        await syncWebPushSubscription({
          subscriptionId,
          origin: globalThis.location?.origin,
          optedIn,
        });

        if (marker) {
          storageWrapper.setItem(webPushSyncStorageKey, marker);
        }
      } catch (err) {
        logEvent({
          event_name: LogEvent.GlobalError,
          extra: JSON.stringify({
            origin: 'web_push_subscription_sync',
            error: err instanceof Error ? err.message : 'unknown',
          }),
        });
      }
    },
    [OneSignalCache, logEvent, user],
  );

  subscriptionCallbackRef.current = async (
    newPermission,
    source,
    existingPermission,
  ) => {
    if (newPermission) {
      await OneSignalCache?.User.PushSubscription.optIn();
      setIsSubscribed(true);
      await syncCurrentWebPushSubscription({ optedIn: true });

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
    await syncCurrentWebPushSubscription({ optedIn: false });
    setIsSubscribed(false);
  }, [OneSignalCache, syncCurrentWebPushSubscription]);

  useEffect(() => {
    if (!OneSignalCache) {
      return undefined;
    }

    const onChange: ChangeEventHandler = (permission) => {
      subscriptionCallbackRef.current?.(permission);
    };
    const onSubscriptionChange: PushSubscriptionChangeHandler = ({
      current,
    }) => {
      setIsSubscribed(!!current.optedIn);
      syncCurrentWebPushSubscription({
        subscriptionId: current.id,
        optedIn: current.optedIn,
      });
    };

    OneSignalCache.Notifications.addEventListener('permissionChange', onChange);
    OneSignalCache.User.PushSubscription.addEventListener(
      'change',
      onSubscriptionChange,
    );
    return () => {
      OneSignalCache.Notifications.removeEventListener(
        'permissionChange',
        onChange,
      );
      OneSignalCache.User.PushSubscription.removeEventListener(
        'change',
        onSubscriptionChange,
      );
    };
  }, [OneSignalCache, syncCurrentWebPushSubscription]);

  useEffect(() => {
    if (!OneSignalCache?.User.PushSubscription.optedIn) {
      return;
    }

    syncCurrentWebPushSubscription();
  }, [OneSignalCache, syncCurrentWebPushSubscription]);

  return (
    <PushNotificationsContext.Provider
      value={{
        isInitialized: !isEnabled || isFetched || !isSuccess,
        isLoading,
        isSubscribed,
        isPushSupported: !!(isPushSupported && isSuccess && isEnabled),
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
      if (!user) {
        throw new Error('Cannot initialize native push without user');
      }

      const promise = promisifyEventListener('push-state', (event) => {
        setIsSubscribed(!!event?.detail);
      });
      postWebKitMessage(WebKitMessageHandlers.PushState, null);
      postWebKitMessage(WebKitMessageHandlers.PushUserId, user.id);
      return promise;
    },
    enabled: isEnabled,
    ...disabledRefetch,
  });

  const subscribe = useCallback(
    async (source: NotificationPromptSource) => {
      const promise = promisifyEventListener('push-subscribe', (event) => {
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
        return subscribed;
      });
      postWebKitMessage(WebKitMessageHandlers.PushSubscribe, null);
      return promise;
    },
    [logEvent],
  );

  const unsubscribe = useCallback(async () => {
    postWebKitMessage(WebKitMessageHandlers.PushUnsubscribe, null);
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

  if (isIOSNative()) {
    return <NativeAppleSubProvider>{children}</NativeAppleSubProvider>;
  }

  return <OneSignalSubProvider>{children}</OneSignalSubProvider>;
}

export const usePushNotificationContext = (): PushNotificationsContextData =>
  useContext(PushNotificationsContext);
