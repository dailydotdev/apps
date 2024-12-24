import { useCallback, useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { feature, plusImprovedEntryPoint } from '../lib/featureManagement';
import { useFeature } from '../components/GrowthBookProvider';
import { TargetType } from '../lib/log';
import type { LogEvent, TargetId } from '../lib/log';
import { useLogContext } from '../contexts/LogContext';
import { useConditionalFeature } from './useConditionalFeature';

type LogSubscriptionEvent = {
  event_name: LogEvent | string;
  target_id?: TargetId | string;
  extra?: Record<string, unknown>;
};

export const usePlusSubscription = (): {
  showPlusSubscription: boolean;
  isPlus: boolean;
  isEnrolledNotPlus: boolean;
  isPlusEntrypointExperiment: boolean;
  logSubscriptionEvent: (event: LogSubscriptionEvent) => void;
} => {
  const { user } = useAuthContext();
  const isPlus = user?.isPlus || false;
  const plusSubscriptionFeature = useFeature(feature.plusSubscription);
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

  const showPlusSubscription = useMemo(
    () => (isPlus ? true : plusSubscriptionFeature),
    [isPlus, plusSubscriptionFeature],
  );
  const { value: isEntrypointExperiment } = useConditionalFeature({
    feature: plusImprovedEntryPoint,
    shouldEvaluate: showPlusSubscription,
  });

  const isEnrolledNotPlus = useMemo(
    () => plusSubscriptionFeature && !isPlus,
    [plusSubscriptionFeature, isPlus],
  );

  return {
    showPlusSubscription,
    isPlus,
    isEnrolledNotPlus,
    isPlusEntrypointExperiment: isEntrypointExperiment,
    logSubscriptionEvent,
  };
};
