import { JSONValue } from '@growthbook/growthbook';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from './image';
import { ProductPriceType } from './featureValues';

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
  plusSubscription: new Feature('plus_subscription', false),
  plusEarlyAdopter: new Feature('plus_early_adopter', false),
  feedPageSizes: new Feature('feed_page_sizes', {
    default: 7,
    tablet: 9,
    laptop: 13,
    laptopL: 17,
    laptopXL: 21,
    desktop: 25,
  }),
  pricingIds: new Feature('pricing_ids', {
    pri_O1jdkx6sakk5kb6p586nejnqam: ProductPriceType.EarlyAdopter,
    pri_01jbsccbdbcwyhdy8hy3c2etyn: ProductPriceType.Monthly,
    pri_01jbscda57910yvwjtyapnrrzc: ProductPriceType.Yearly,
  }),
  postPersonalizedBanner: new Feature('post_banner_personalized', false),
};

export const featureAutorotateAds = new Feature('autorotate_ads', 0);
export const featureOnboardingSources = new Feature(
  'onboarding_sources',
  false,
);

export { feature };
