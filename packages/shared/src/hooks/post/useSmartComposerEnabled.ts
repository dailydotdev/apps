import { featureSmartComposer } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import usePersistentContext from '../usePersistentContext';

export const FORCE_SMART_COMPOSER_KEY = 'force_smart_composer';

interface UseSmartComposerEnabledProps {
  shouldEvaluate: boolean;
}

interface UseSmartComposerEnabled {
  value: boolean;
  isForced: boolean;
}

/**
 * Returns whether the Smart Composer experiment is active for the current user.
 *
 * Combines the GrowthBook feature flag with an internal-only override stored
 * in IndexedDB (toggled via `SmartComposerDevToggle` on non-prod environments).
 * The override is intended for QA/internal testing — it never bypasses the
 * production API check that gates the toggle UI itself.
 */
export const useSmartComposerEnabled = ({
  shouldEvaluate,
}: UseSmartComposerEnabledProps): UseSmartComposerEnabled => {
  const [forceOverride] = usePersistentContext<boolean>(
    FORCE_SMART_COMPOSER_KEY,
    false,
  );
  const { value: flagValue } = useConditionalFeature({
    feature: featureSmartComposer,
    shouldEvaluate,
  });

  const isForced = !!forceOverride;
  return {
    value: flagValue || isForced,
    isForced,
  };
};
