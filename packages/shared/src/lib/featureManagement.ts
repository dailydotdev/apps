import { JSONValue } from '@growthbook/growthbook';
import { FeedLayout, SearchExperiment } from './featureValues';

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
  search: new Feature('search', SearchExperiment.V1),
  lowImps: new Feature('feed_low_imps'),
  bookmarkOnCard: new Feature('bookmark_on_card', false),
  onboardingCopy: new Feature('onboarding_copy', {
    title: 'Where developers grow together',
    description: 'Get one personalized feed for all the knowledge you need.',
  }),
  feedLayout: new Feature('feed_layout', FeedLayout.V1), // TODO: revert after testing
  cardFeedbackCopy: new Feature('card_feedback_copy', 'Did you like the post?'),
};

export { feature };
