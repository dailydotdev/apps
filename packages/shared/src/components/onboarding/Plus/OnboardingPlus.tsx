import { withExperiment } from '../../withExperiment';
import { OnboardingPlusControl } from './OnboardingPlusControl';
import { OnboardingPlusVariationV1 } from './OnboardingPlusVariationV1';
import { featureOnboardingGridVariationV1 } from '../../../lib/featureManagement';

export const OnboardingPlus = withExperiment(OnboardingPlusVariationV1, {
  feature: featureOnboardingGridVariationV1,
  value: true,
  fallback: OnboardingPlusControl,
});
