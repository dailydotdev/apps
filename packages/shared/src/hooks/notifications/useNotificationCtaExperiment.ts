import { notificationCtaV2Feature } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';

export interface UseNotificationCtaExperiment {
  isEnabled: boolean;
}

interface UseNotificationCtaExperimentProps {
  shouldEvaluate?: boolean;
}

export const useNotificationCtaExperiment = ({
  shouldEvaluate = true,
}: UseNotificationCtaExperimentProps = {}): UseNotificationCtaExperiment => {
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: notificationCtaV2Feature,
    shouldEvaluate,
  });

  const isEnabled = Boolean(isFeatureEnabled);

  return {
    isEnabled,
  };
};
