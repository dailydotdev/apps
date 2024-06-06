import { JSONValue } from '@growthbook/growthbook';
import {
  ExperienceLevelExperiment,
  TagSourceSocialProof,
  CustomFeedsExperiment,
  ShortcutsUIExperiment,
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
  lowImps: new Feature('feed_low_imps'),
  bookmarkOnCard: new Feature('bookmark_on_card', false),
  onboardingVisual: new Feature('onboarding_visual', {
    showCompanies: true,
    fullBackground: false,
    image: cloudinary.onboarding.default,
  }),
  forceRefresh: new Feature('force_refresh', false),
  feedAdSpot: new Feature('feed_ad_spot', 0),
  searchVersion: new Feature('search_version', 1),
  forcedTagSelection: new Feature('forced_tag_selection', false),
  readingReminder: new Feature('reading_reminder', false),
  onboardingMostVisited: new Feature('onboarding_most_visited', false),
  shareExperience: new Feature('share_experience', false),
  bookmarkLoops: new Feature('bookmark_loops', false),
  sidebarClosed: new Feature('sidebar_closed', false),
  tagSourceSocialProof: new Feature(
    'tag_source_social_proof',
    TagSourceSocialProof.Control,
  ),
  experienceLevel: new Feature(
    'experience_level',
    ExperienceLevelExperiment.Control,
  ),
  featureTheme: new Feature('feature_theme', {}),
  customFeeds: new Feature('custom_feeds', CustomFeedsExperiment.Control),
  hypeCampaign: new Feature('hype_campaign', false),
  searchGoogle: new Feature('search_google', false),
  onboardingFlip: new Feature('onboarding_flip', false),
  improvedSharedPostCard: new Feature('improved_shared_post_card', false),
  feedSettingsFeedback: new Feature('feed_settings_feedback', false),
  onboardingLinks: new Feature('onboarding_links', false),
  shortcutsUI: new Feature('shortcuts_ui', ShortcutsUIExperiment.Control),
  shareVia: new Feature('share_via', false),
};

export { feature };
