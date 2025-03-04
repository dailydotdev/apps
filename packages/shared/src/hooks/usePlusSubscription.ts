import { useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { TargetType } from '../lib/log';
import type { LogEvent, TargetId } from '../lib/log';
import { useLogContext } from '../contexts/LogContext';
import type { SubscriptionProvider } from '../lib/plus';

type LogSubscriptionEvent = {
  event_name: LogEvent | string;
  target_id?: TargetId | string;
  extra?: Record<string, unknown>;
};

export const usePlusSubscription = (): {
  isPlus: boolean;
  plusProvider: SubscriptionProvider | null;
  logSubscriptionEvent: (event: LogSubscriptionEvent) => void;
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

  return {
    isPlus,
    plusProvider,
    logSubscriptionEvent,
  };
};
