import { useCallback, useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { feature } from '../lib/featureManagement';
import { useFeature } from '../components/GrowthBookProvider';
import { LogEvent, TargetId, TargetType } from '../lib/log';
import { useLogContext } from '../contexts/LogContext';

export const usePlusSubscription = (): {
  showPlusSubscription: boolean;
  isPlus: boolean;
  logSubscriptionEvent: (
    event_name: LogEvent,
    target_id: TargetId,
    extra?: Record<string, unknown>,
  ) => void;
} => {
  const { user } = useAuthContext();
  const isPlus = user?.isPlus || false;
  const plusSubscriptionFeature = useFeature(feature.plusSubscription);
  const { logEvent } = useLogContext();

  const logSubscriptionEvent = useCallback(
    (
      event_name: LogEvent,
      target_id: TargetId,
      extra?: Record<string, unknown>,
    ) => {
      logEvent({
        event_name,
        target_type: TargetType.Plus,
        target_id,
        extra: JSON.stringify(extra) || undefined,
      });
    },
    [logEvent],
  );

  const showPlusSubscription = useMemo(
    () => (isPlus ? true : plusSubscriptionFeature),
    [isPlus, plusSubscriptionFeature],
  );

  return {
    showPlusSubscription,
    isPlus,
    logSubscriptionEvent,
  };
};
