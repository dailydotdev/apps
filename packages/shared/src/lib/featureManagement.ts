import { JSONValue } from '@growthbook/growthbook';
import {
  AdsPostPage,
  OnboardingBanner,
  SeoSidebarExperiment,
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
  onboardingVisual: new Feature('onboarding_visual', {
    showCompanies: true,
    fullBackground: false,
    image: cloudinary.onboarding.default,
  }),
  feedAdSpot: new Feature('feed_ad_spot', 0),
  searchVersion: new Feature('search_version', 1),
  readingReminder: new Feature('reading_reminder', false),
  onboardingMostVisited: new Feature('onboarding_most_visited', false),
  shareExperience: new Feature('share_experience', false),
  featureTheme: new Feature('feature_theme', {}),
  hypeCampaign: new Feature('hype_campaign', false),
  improvedSharedPostCard: new Feature('improved_shared_post_card', false),
  feedSettingsFeedback: new Feature('feed_settings_feedback', false),
  onboardingLinks: new Feature('onboarding_links', false),
  shortcutsUI: new Feature('shortcuts_ui', ShortcutsUIExperiment.Control),
  showRoadmap: new Feature('show_roadmap', false),
  seoSidebar: new Feature('seo_sidebar', SeoSidebarExperiment.Control),
  bookmark_provider: new Feature('bookmark_provider', false),
  onboardingChecklist: new Feature('onboarding_checklist', false),
  feedLayoutPreview: new Feature('feed_layout_preview', false),
  onboardingBanner: new Feature('onboarding_banner', OnboardingBanner.Control),
  adsPostPage: new Feature('ads_post_page', AdsPostPage.Control),
  notificationsNavBar: new Feature('notifications_nav_bar', false),
};

export { feature };
