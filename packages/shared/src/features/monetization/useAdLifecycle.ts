import { useCallback } from 'react';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureAdSlotLifecycle } from '../../lib/featureManagement';
import { withoutAdSlotLifecycle } from './adSlotLifecycle';

export const useAdLifecycle = (shouldEvaluate = true) => {
  const { value } = useConditionalFeature({
    feature: featureAdSlotLifecycle,
    shouldEvaluate,
  });
  const isEnabled = value === true;
  const resolveAd = useCallback(
    <T extends { lifecycle?: unknown } | null>(ad: T): T =>
      ad && !isEnabled ? withoutAdSlotLifecycle(ad) : ad,
    [isEnabled],
  );

  return { isEnabled, resolveAd };
};
