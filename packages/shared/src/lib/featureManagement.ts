import { JSONValue } from '@growthbook/growthbook';
import {
  ReadingStreaksExperiment,
  PostPageOnboarding,
  UserAcquisition,
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
  userAcquisition: new Feature('user_acquisition', UserAcquisition.Control),
  forceRefresh: new Feature('force_refresh', false),
  feedAdSpot: new Feature('feed_ad_spot', 0),
  shareLoops: new Feature('share_loops', false),
  onboardingOnlineUsers: new Feature('onboarding_online_users', false),
  onboardingCopy: new Feature('onboarding_copy', OnboardingCopy.Control),
  sourceSubscribe: new Feature(
    'source_subscribe',
    SourceSubscribeExperiment.Control,
  ),
  searchVersion: new Feature('search_version', 1),
  commentFeed: new Feature('comment_feed', false),
  forcedTagSelection: new Feature('forced_tag_selection', false),
  mobileUxLayout: new Feature('mobile_ux_layout', false),
};

export { feature };
