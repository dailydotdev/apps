import React from 'react';
import { withExperiment } from '../../withExperiment';
import { OnboardingPlusControl } from './OnboardingPlusControl';
import {
  featureOnboardingGridVariation,
  featureOnboardingPlusFeatureGrid,
} from '../../../lib/featureManagement';
import { useConditionalFeature } from '../../../hooks';
import { OnboardingGridVariation } from '../../../lib/featureValues';
import { OnboardingPlusVariationV1 } from './OnboardingPlusVariationV1';
import { OnboardingPlusVariation } from './OnboardingPlusVariation';

const OnboardingPlusVariationExperiment = (props) => {
  const { value: plusVariation } = useConditionalFeature({
    shouldEvaluate: true,
    feature: featureOnboardingGridVariation,
  });
  switch (plusVariation) {
    case OnboardingGridVariation.V1:
      return <OnboardingPlusVariationV1 {...props} />;
      break;
    default:
      return <OnboardingPlusVariation {...props} />;
      break;
  }
};

export const OnboardingPlus = withExperiment(
  OnboardingPlusVariationExperiment,
  {
    feature: featureOnboardingPlusFeatureGrid,
    value: true,
    fallback: OnboardingPlusControl,
  },
);
