import { JSONValue } from '@growthbook/growthbook';
import { SearchExperiment } from './featureValues';

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
  search: new Feature('search', SearchExperiment.Control),
  lowImps: new Feature('feed_low_imps'),
  onboardingTitle: new Feature(
    'onboarding_title',
    'Where developers grow together',
  ),
  onboardingSubTitle: new Feature(
    'onboarding_sub_title',
    'Get one personalized feed for all the knowledge you need.',
  ),
};

export { feature };
