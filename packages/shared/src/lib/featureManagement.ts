import type { JSONValue } from '@growthbook/growthbook';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from './image';
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
  pricingIds: new Feature('pricing_ids', {
    pri_01jdkx6sakk5kb6p586nejnqam: 'monthly',
    pri_01jbsccbdbcwyhdy8hy3c2etyn: 'monthly',
    pri_01jjvm32ygwb1ja7w52e668fr2: 'yearly',
    pri_01jbscda57910yvwjtyapnrrzc: 'yearly',
  }),
};

export const featureOnboardingPlusCheckout = new Feature(
  'onboarding_plus_checkout',
  false,
);

export const featureAutorotateAds = new Feature('autorotate_ads', 0);

export const featureOnboardingDesktopPWA = new Feature(
  'onboarding_desktop_pwa',
  false,
);
export const featureOnboardingAndroid = new Feature(
  'onboarding_android',
  false,
);

export const featureFeedAdTemplate = new Feature('feed_ad_template', {
  default: {
    adStart: 2,
  },
} as Record<FeedSettingsKeys, FeedAdTemplate>);

export const featureAndroidPWA = new Feature('android_pwa_onboarding', false);
export const featureValidLanguages = new Feature('valid_languages', {
  en: 'English',
  es: 'Spanish',
  de: 'German',
  fr: 'French',
  it: 'Italian',
  'zh-Hans': 'Chinese (Simplified)',
  'pt-BR': 'Portuguese (Brazil)',
  'pt-PT': 'Portuguese (Portugal)',
  ja: 'Japanese',
  ko: 'Korean',
});

export const featureSocialShare = new Feature('social_share', false);

export { feature };
