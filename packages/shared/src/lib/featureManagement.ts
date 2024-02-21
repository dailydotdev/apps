import { JSONValue } from '@growthbook/growthbook';
import {
  FeedLayout,
  PostPageOnboarding,
  ReadingStreaksExperiment,
  SearchExperiment,
} from './featureValues';
import { cloudinary } from './image';

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
  bookmarkOnCard: new Feature('bookmark_on_card', false),
  feedLayout: new Feature('feed_layout', FeedLayout.Control),
  readingStreaks: new Feature(
    'reading_streaks',
    ReadingStreaksExperiment.Control,
  ),
  onboardingVisual: new Feature('onboarding_visual', {
    showCompanies: true,
    poster: cloudinary.onboarding.video.poster,
    webm: cloudinary.onboarding.video.webm,
    mp4: cloudinary.onboarding.video.mp4,
  }),
  postPageOnboarding: new Feature(
    'post_page_onboarding',
    PostPageOnboarding.Control,
  ),
  socialProofOnboarding: new Feature('social_proof_onboarding', false),
  copyLink: new Feature('copy_link', false),
  onboardingOptimizations: new Feature('onboarding_optimizations', false),
};

export { feature };
