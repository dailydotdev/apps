import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import {
  featureOnboardingChrome,
  OnboardingChromeVariant,
} from '../../../lib/featureManagement';

interface OnboardingChrome {
  /** The animated edge-aura frame around the viewport. */
  hasAura: boolean;
  /** The progress dots under the docked CTA. */
  hasDots: boolean;
}

/** Aura and dots ship as one arm, so both read from one flag. */
export const useOnboardingChrome = (
  isOnboarding?: boolean,
): OnboardingChrome => {
  const { value } = useConditionalFeature({
    feature: featureOnboardingChrome,
    shouldEvaluate: !!isOnboarding,
  });
  const isAura = !!isOnboarding && value === OnboardingChromeVariant.Aura;

  return { hasAura: isAura, hasDots: isAura };
};
