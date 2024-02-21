import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const [OneSignal, setOneSignal] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registrationId, setRegistrationId] = useState<string>(null);
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

  const getRegistrationId = async (isGranted: boolean) => {
    if (!isGranted) {
      return '';
    }

    if (registrationId) {
      return registrationId;
    }

    await globalThis.OneSignal?.registerForPushNotifications?.();
    const id = await globalThis.OneSignal?.getRegistrationId();
    setRegistrationId(id);
    await OneSignal?.setExternalUserId?.(user.id);

    return id;
  };

  const onUpdatePush = async (permission: NotificationPermission) => {
    const isGranted = permission === 'granted';
    const id = await getRegistrationId(isGranted);
    const isRegistered = !!id;
    const allowedPush = isGranted && isRegistered;

    await OneSignal?.setSubscription?.(allowedPush);
    setIsSubscribed(allowedPush);

    if (isAlertShown && allowedPush) {
      setIsAlertShown(false);
    }

    return allowedPush;
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

  const onUpdatePermission = async (permission: NotificationPermission) => {
    const allowedPush = await onUpdatePush(permission);

    onPermissionCache(allowedPush ? 'granted' : 'default');
  };

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

    if (isSubscribed) {
      await onUpdatePermission('denied');
      return 'denied';
    }

    notificationSourceRef.current = source;
    const result = await globalThis.window?.Notification?.requestPermission();
    await onUpdatePermission(result);

    return result;
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

  useEffect(() => {
    if (isInitialized || isInitializing || !user || isExtension) {
      return;
    }

    if (isTesting) {
      setIsInitialized(true);
      setIsSubscribed(false);
      return;
    }

    setIsInitializing(true);
    try {
      import('react-onesignal').then(async (mod) => {
        const OneSignalReact = mod.default;

        OneSignalReact.on('subscriptionChange', (value) =>
          subscriptionCallbackRef.current?.(value),
        );

        await OneSignalReact.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: isDevelopment,
          serviceWorkerParam: { scope: '/push/onesignal/' },
          serviceWorkerPath: '/push/onesignal/OneSignalSDKWorker.js',
        });
        const isGranted = globalThis.Notification?.permission === 'granted';
        const [id, subscribed, externalId] = await Promise.all([
          globalThis.OneSignal?.getRegistrationId(),
          OneSignalReact.getSubscription(),
          OneSignalReact.getExternalUserId(),
        ]);
        const isValidSubscription = subscribed && isGranted;
        setOneSignal(OneSignalReact);
        setIsInitialized(true);
        setIsSubscribed(isValidSubscription);
        if (id) {
          setRegistrationId(id);
        } else if (isValidSubscription) {
          await globalThis.OneSignal?.registerForPushNotifications?.();
          const regId = await globalThis.OneSignal?.getRegistrationId();
          setRegistrationId(regId);
        }

        if (isValidSubscription && !externalId) {
          OneSignalReact.setExternalUserId(user.id);
        }
      });
    } catch (err) {
      setIsInitialized(true);
      trackEvent({
        event_name: AnalyticsEvent.GlobalError,
        extra: JSON.stringify({ msg: err }),
      });
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isInitializing, user]);

  const data: NotificationsContextData = useMemo(
    () => ({
      onAcceptedPermissionJustNow,
      acceptedPermissionJustNow,
      hasPermissionCache,
      isInitialized,
      isNotificationsReady,
      unreadCount: currentUnreadCount,
      isSubscribed,
      shouldShowSettingsAlert: isAlertShown,
      onShouldShowSettingsAlert: setIsAlertShown,
      onTogglePermission,
      clearUnreadCount: () => setCurrentUnreadCount(0),
      incrementUnreadCount: (value = 1) =>
        setCurrentUnreadCount((current) => current + value),
      get isNotificationSupported() {
        return !!globalThis.window?.Notification && !!OneSignal;
      },
      trackPermissionGranted: (source) =>
        subscriptionCallbackRef.current?.(true, source, true),
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isNotificationsReady,
      isSubscribed,
      unreadCount,
      currentUnreadCount,
      isInitialized,
      user,
      isAlertShown,
      acceptedPermissionJustNow,
      hasPermissionCache,
      subscriptionCallbackRef,
    ],
  );

  return (
    <NotificationsContext.Provider value={data}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationContext = (): NotificationsContextData =>
  useContext(NotificationsContext);
