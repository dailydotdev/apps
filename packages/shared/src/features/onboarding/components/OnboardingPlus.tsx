import { withExperiment } from '../../../components/withExperiment';
import { OnboardingPlusVariation } from './OnboardingPlusVariation';
import { OnboardingPlusControl } from './OnboardingPlusControl';
import { featureOnboardingPlusFeatureGrid } from '../../../lib/featureManagement';

export const OnboardingPlus = withExperiment(OnboardingPlusVariation, {
  feature: featureOnboardingPlusFeatureGrid,
  value: true,
  fallback: OnboardingPlusControl,
});
