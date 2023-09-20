import { JSONValue } from '@growthbook/growthbook';
import {
  OnboardingV2,
  OnboardingFilteringTitle,
  SearchExperiment,
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
  feedVersion: new Feature('feed_version', 1),
  onboardingV2: new Feature('onboarding_v2', OnboardingV2.Control),
  search: new Feature('search', SearchExperiment.Control),
  onboardingFilterTitle: new Feature(
    'onboarding_filtering_title',
    OnboardingFilteringTitle.Control,
  ),
  engagementLoopJuly2023Companion: new Feature(
    'engagement_loop_july2023_companion',
  ),
  engagementLoopJuly2023Upvote: new Feature('engagement_loop_july2023_upvote'),
};

export { feature };
