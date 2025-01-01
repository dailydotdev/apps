import type { JSONValue } from '@growthbook/growthbook';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from './image';
import { PlusPriceType } from './featureValues';
import type { FeedAdTemplate } from './feed';
import type { FeedSettingsKeys } from '../contexts/FeedContext';

export class Feature<T extends JSONValue> {
  readonly id: string;

  readonly defaultValue?: T;

  constructor(id: string, defaultValue?: T) {
    this.id = id;
    this.defaultValue = defaultValue;
  }
}

const feature = {
  showError: new Feature('show_error', false),
  feedVersion: new Feature('feed_version', 15),
  onboardingVisual: new Feature('onboarding_visual', {
    fullBackground: {
      mobile: cloudinaryOnboardingFullBackgroundMobile,
      desktop: cloudinaryOnboardingFullBackgroundDesktop,
    },
  }),
  feedAdSpot: new Feature('feed_ad_spot', 2),
  searchVersion: new Feature('search_version', 2),
  featureTheme: new Feature('feature_theme', {}),
  showRoadmap: new Feature('show_roadmap', true),
  onboardingChecklist: new Feature('onboarding_checklist', true),
  showCodeSnippets: new Feature('show_code_snippets', false),
  plusSubscription: new Feature('plus_subscription', false),
  pricingIds: new Feature('pricing_ids', {
    pri_01jbsccbdbcwyhdy8hy3c2etyn: PlusPriceType.Monthly,
    pri_01jbscda57910yvwjtyapnrrzc: PlusPriceType.Yearly,
  }),
};

export const featurePostBannerExtensionPrompt = new Feature(
  'post_banner_extension_prompt',
  false,
);
export const plusImprovedEntryPoint = new Feature(
  'plus_improved_entry_points',
  false,
);
export const feedActionSpacing = new Feature('feed_action_spacing', false);
export const featureAutorotateAds = new Feature('autorotate_ads', 0);
export const featureUpvoteCounter = new Feature(
  'always_visible_upvote_counter',
  false,
);

export const featureOnboardingExtension = new Feature(
  'onboarding_extension',
  false,
);
export const featureOnboardingPWA = new Feature('onboarding_pwa', false);
export const featureOnboardingAndroid = new Feature(
  'onboarding_android',
  false,
);

export const featureFeedAdTemplate = new Feature('feed_ad_template', {
  default: {
    adStart: 2,
  },
} as Record<FeedSettingsKeys, FeedAdTemplate>);

export { feature };
