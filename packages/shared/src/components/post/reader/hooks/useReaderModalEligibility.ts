import { useAuthContext } from '../../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import { featureReaderModal } from '../../../../lib/featureManagement';
import { isExtensionCapableBrowser } from '../../../../lib/func';

export type UseReaderModalEligibilityResult = {
  isEligible: boolean;
  isReaderModalEnabled: boolean;
  isReaderFeatureLoading: boolean;
};

/**
 * Single source of truth for "should this user see the reader-modal
 * experiment at all". Two filters apply:
 *
 * 1. **Browser capability**: only Chrome and Edge can complete the embedded-
 *    browsing flow today, so pulling other browsers into the test pollutes
 *    the stats and shows them a path that can never succeed.
 * 2. **Authenticated user**: anonymous visitors are excluded so we don't
 *    distract them from the onboarding funnel with reader-experiment
 *    variants before they've converted.
 *
 * Returns the eligibility flag plus the GrowthBook value so callers can
 * fan-out to their own UI gates. GrowthBook is only evaluated when the user
 * is eligible to avoid unnecessary feature evaluations.
 */
export function useReaderModalEligibility(): UseReaderModalEligibilityResult {
  const { user } = useAuthContext();
  const isEligible = isExtensionCapableBrowser() && !!user;

  const { value: isReaderModalEnabled, isLoading: isReaderFeatureLoading } =
    useConditionalFeature({
      feature: featureReaderModal,
      shouldEvaluate: isEligible,
    });

  return { isEligible, isReaderModalEnabled, isReaderFeatureLoading };
}
