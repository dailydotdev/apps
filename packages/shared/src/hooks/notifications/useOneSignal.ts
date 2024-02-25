import { useQuery, useQueryClient } from '@tanstack/react-query';
import type OSR from 'react-onesignal';
import { useState } from 'react';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { isDevelopment, isTesting } from '../../lib/constants';
import { AnalyticsEvent, NotificationPromptSource } from '../../lib/analytics';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { checkIsExtension } from '../../lib/func';

interface UseOneSignal {
  OneSignal: typeof OSR | null;
  isPushSupported: boolean;
  isSubscribed: boolean;
  isFetched: boolean;
}

export type SubscriptionCallback = (
  isSubscribed: boolean,
  source?: NotificationPromptSource,
  existing_permission?: boolean,
) => unknown;

interface UseOneSignalProps {
  onSubscriptionChange: SubscriptionCallback;
}

export const useOneSignal = ({
  onSubscriptionChange,
}: UseOneSignalProps): UseOneSignal => {
  const isExtension = checkIsExtension();
  const { user } = useAuthContext();
  const { trackEvent } = useAnalyticsContext();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const client = useQueryClient();
  const key = generateQueryKey(RequestKey.OneSignal, user);
  const isEnabled = !!user && !isExtension && !isTesting;
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
          (value) => onSubscriptionChange?.(value),
        );

        await OneSignalReact.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: isDevelopment,
          serviceWorkerParam: { scope: '/push/onesignal/' },
          serviceWorkerPath: '/push/onesignal/OneSignalSDKWorker.js',
        });
        await OneSignalReact.login(user.id);

        setIsSubscribed(OneSignalReact.User.PushSubscription.optedIn);

        OneSignalReact.User.PushSubscription.addEventListener(
          'change',
          ({ current }) => setIsSubscribed(() => current.optedIn),
        );

        return OneSignalReact;
      } catch (err) {
        trackEvent({
          event_name: AnalyticsEvent.GlobalError,
          extra: JSON.stringify({ msg: err }),
        });
        return null;
      }
    },
    { enabled: isEnabled },
  );

  const isPushSupported =
    !!globalThis.window?.Notification &&
    OneSignal?.Notifications.isPushSupported();

  return {
    isSubscribed,
    isPushSupported: isPushSupported || isTesting,
    isFetched: !isEnabled || isFetched,
    OneSignal,
  };
};
