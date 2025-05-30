import { useCallback, useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import type { LogEvent, TargetId } from '../lib/log';
import { TargetType } from '../lib/log';
import { useLogContext } from '../contexts/LogContext';
import type { SubscriptionStatus } from '../lib/plus';
import { SubscriptionProvider } from '../lib/plus';
import { managePlusUrl, plusUrl, webappUrl } from '../lib/constants';
import { isIOSNative } from '../lib/func';

type LogSubscriptionEvent = {
  event_name: LogEvent | string;
  target_id?: TargetId | string;
  plan_type?: string;
  team_size?: number;
  extra?: Record<string, unknown>;
};

export const usePlusSubscription = (): {
  isPlus: boolean;
  plusProvider?: SubscriptionProvider;
  logSubscriptionEvent: (event: LogSubscriptionEvent) => void;
  plusHref: string | undefined;
  status?: SubscriptionStatus;
} => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const isPlus = user?.isPlus || false;
  const { status, provider: plusProvider } = user?.subscriptionFlags || {};

  const logSubscriptionEvent = useCallback(
    ({
      event_name,
      target_id,
      extra,
      team_size,
      plan_type,
    }: LogSubscriptionEvent) => {
      logEvent({
        event_name,
        target_type: TargetType.Plus,
        target_id,
        plan_type,
        team_size,
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
    return `${webappUrl}account/subscription`;
  }, [isPlus, plusProvider]);

  return {
    isPlus,
    plusProvider,
    logSubscriptionEvent,
    plusHref,
    status,
  };
};
