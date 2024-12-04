import { JSONValue } from '@growthbook/growthbook';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from './image';
import { PlusPriceType } from './featureValues';

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
  postBannerExtensionPrompt: new Feature('post_banner_extension_prompt', false),
  plusSubscription: new Feature('plus_subscription', true),
  pricingIds: new Feature('pricing_ids', {
    pri_01jbsccbdbcwyhdy8hy3c2etyn: PlusPriceType.Monthly,
    pri_01jbscda57910yvwjtyapnrrzc: PlusPriceType.Yearly,
  }),
  onboardingAndroid: new Feature('onboarding_android', false),
  postPersonalizedBanner: new Feature('post_banner_personalized', false),
};

export const featureAutorotateAds = new Feature('autorotate_ads', 0);
export const featureOnboardingSources = new Feature(
  'onboarding_sources',
  false,
);

export { feature };
