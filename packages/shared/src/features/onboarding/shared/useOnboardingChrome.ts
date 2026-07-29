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

/**
 * The two decorative pieces of the onboarding funnel — the aura frame and the
 * progress dots — ship together as one experiment arm, so they are read from a
 * single flag rather than each component deciding for itself.
 *
 * The control arm is the brand gradient canvas with no dots. Everything else in
 * the redesign (the rail, the type scale, the glass CTA, the top strip) is
 * baseline and is not gated here.
 */
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
