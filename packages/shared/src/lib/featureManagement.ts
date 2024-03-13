import { JSONValue } from '@growthbook/growthbook';
import {
  ReadingStreaksExperiment,
  OnboardingV4dot5,
  PostPageOnboarding,
  UserAcquisition,
  PublishTimeFormat,
  OnboardingCopy,
  SourceSubscribeExperiment,
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
  onboardingAnimation: new Feature('onboarding_fake_loading', false),
  onboardingV4dot5: new Feature('onboarding_v4dot5', OnboardingV4dot5.Control),
  lowImps: new Feature('feed_low_imps'),
  bookmarkOnCard: new Feature('bookmark_on_card', false),
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
  userAcquisition: new Feature('user_acquisition', UserAcquisition.Control),
  forceRefresh: new Feature('force_refresh', false),
  feedAdSpot: new Feature('feed_ad_spot', 0),
  shareLoops: new Feature('share_loops', false),
  publishTimeFormat: new Feature(
    'publish_time_format',
    PublishTimeFormat.Control,
  ),
  onboardingOnlineUsers: new Feature('onboarding_online_users', false),
  onboardingCopy: new Feature('onboarding_copy', OnboardingCopy.Control),
  sourceSubscribe: new Feature(
    'source_subscribe',
    SourceSubscribeExperiment.Control,
  ),
  searchVersion: new Feature('search_version', 1),
};

export { feature };
