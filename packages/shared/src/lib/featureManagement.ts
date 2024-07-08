import { JSONValue } from '@growthbook/growthbook';
import {
  SeoSidebarExperiment,
  ShortcutsUIExperiment,
  UpvoteExperiment,
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
  shareExperience: new Feature('share_experience', false),
  featureTheme: new Feature('feature_theme', {}),
  shortcutsUI: new Feature('shortcuts_ui', ShortcutsUIExperiment.Control),
  showRoadmap: new Feature('show_roadmap', false),
  seoSidebar: new Feature('seo_sidebar', SeoSidebarExperiment.Control),
  onboardingChecklist: new Feature('onboarding_checklist', false),
  upvote: new Feature('animated_upvote', UpvoteExperiment.Animated),
};

export { feature };
