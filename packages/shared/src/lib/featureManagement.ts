import { JSONValue } from '@growthbook/growthbook';
import {
  OnboardingV2,
  OnboardingFilteringTitle,
  SearchExperiment,
  OnboardingV3,
} from './featureValues';

export class Feature<T extends JSONValue> {
  readonly id: string;

  readonly defaultValue?: T;

  constructor(id: string, defaultValue?: T) {
    this.id = id;
    this.defaultValue = defaultValue;
  }
}

const feature = {
  feedVersion: new Feature('feed_version', 15),
  onboardingV2: new Feature('onboarding_v2', OnboardingV2.Control),
  onboardingV3: new Feature('onboarding_v3', OnboardingV3.Control),
  search: new Feature('search', SearchExperiment.Control),
  onboardingFilterTitle: new Feature(
    'onboarding_filtering_title',
    OnboardingFilteringTitle.Control,
  ),
  lowImps: new Feature('feed_low_imps'),
};

export { feature };
