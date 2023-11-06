import { JSONValue } from '@growthbook/growthbook';
import {
  OnboardingFilteringTitle,
  SearchExperiment,
  OnboardingV4,
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
  onboardingV4: new Feature('onboarding_v4', OnboardingV4.Control),
  search: new Feature('search', SearchExperiment.Control),
  onboardingFilterTitle: new Feature(
    'onboarding_filtering_title',
    OnboardingFilteringTitle.Control,
  ),
  lowImps: new Feature('feed_low_imps'),
};

export { feature };
