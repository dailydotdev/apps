import type { JSONValue } from '@growthbook/growthbook';

import type { FeedAdTemplate } from './feed';
import type { FeedSettingsKeys } from '../contexts/FeedContext';
import type { PlusItemStatus } from '../components/plus/PlusListItem';
import { isDevelopment } from './constants';

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
  feedAdSpot: new Feature('feed_ad_spot', 2),
  searchVersion: new Feature('search_version', 2),
  featureTheme: new Feature('feature_theme', {}),
  showRoadmap: new Feature('show_roadmap', true),
  showCodeSnippets: new Feature('show_code_snippets', false),
};

export const plusTakeoverContent = new Feature<{
  title: string;
  description: string;
  features: Array<{ label: string; status: PlusItemStatus }>;
  cta: string;
  shouldShowRefund: boolean;
  shouldShowReviews: boolean;
}>('plus_takeover_content', null);

export const featurePostTagSorting = new Feature('post_tag_sorting', false);

export const visitLinkFeature = new Feature('post_visit_link', false);

export const featurePlusCtaCopy = new Feature('plus_cta_copy', {
  full: 'Upgrade to Plus',
  short: 'Upgrade',
});

export const featureAutorotateAds = new Feature('autorotate_ads', 0);

export const featureOnboardingAndroid = new Feature(
  'onboarding_android',
  false,
);

export const featureFeedAdTemplate = new Feature('feed_ad_template', {
  default: {
    adStart: 2,
  },
} as Record<FeedSettingsKeys, FeedAdTemplate>);

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

export const featurePlusButtonColors = new Feature<
  'avocado' | 'cabbage' | 'onion' | 'cheesebacon' | 'onionbacon' | ''
>('plus_button_colors', '');

export const featureSocialShare = new Feature('social_share', false);

export const featureCustomFeedPlacement = new Feature(
  'custom_feed_placement',
  false,
);

export const featureInteractiveFeed = new Feature('interactive_feed', false);

export const featureOnboardingPlusFeatureGrid = new Feature(
  'onboarding_plus_feature_grid',
  false,
);

export { feature };

export const featureCores = new Feature('cores', isDevelopment);
