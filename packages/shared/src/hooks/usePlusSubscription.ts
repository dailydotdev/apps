import { useCallback, useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { TargetType } from '../lib/log';
import type { LogEvent, TargetId } from '../lib/log';
import { useLogContext } from '../contexts/LogContext';
import { SubscriptionProvider } from '../lib/plus';
import { managePlusUrl, plusUrl } from '../lib/constants';
import { isIOSNative } from '../lib/func';

type LogSubscriptionEvent = {
  event_name: LogEvent | string;
  target_id?: TargetId | string;
  extra?: Record<string, unknown>;
};

export const usePlusSubscription = (): {
  isPlus: boolean;
  plusProvider: SubscriptionProvider | null;
  logSubscriptionEvent: (event: LogSubscriptionEvent) => void;
  plusHref: string | undefined;
} => {
  const { user } = useAuthContext();
  const isPlus = user?.isPlus || false;
  const plusProvider = user?.subscriptionFlags?.provider || null;
  const { logEvent } = useLogContext();

  const logSubscriptionEvent = useCallback(
    ({ event_name, target_id, extra }: LogSubscriptionEvent) => {
      logEvent({
        event_name,
        target_type: TargetType.Plus,
        target_id,
        extra: JSON.stringify(extra) || undefined,
      });
    },
    [logEvent],
  );

  const plusHref = useMemo(() => {
    if (!isPlus) {
      return plusUrl;
    }

    // Plus users with Apple StoreKit on iOS get no URL (handled by onClick)
    if (isIOSNative() && plusProvider === SubscriptionProvider.AppleStoreKit) {
      return undefined;
    }

    // External subscription management for Paddle users
    if (plusProvider === SubscriptionProvider.Paddle) {
      return managePlusUrl;
    }

    // Internal subscription management for other cases
    return '/account/subscription';
  }, [isPlus, plusProvider]);

  return {
    isPlus,
    plusProvider,
    logSubscriptionEvent,
    plusHref,
  };
};
