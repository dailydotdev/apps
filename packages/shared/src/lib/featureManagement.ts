import type { JSONValue } from '@growthbook/growthbook';
import type { FeedAdTemplate } from './feed';
import type { FeedSettingsKeys } from '../contexts/FeedContext';
import type { PlusItemStatus } from '../components/plus/PlusListItem';
import { OnboardingGridVariation } from './featureValues';
import { isDevelopment } from './constants';
import { BriefingType } from '../graphql/posts';

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

export const followingFeedVersion = new Feature('following_feed_version', 2);
export const popularFeedVersion = new Feature('popular_feed_version', 2);
export const upvotedFeedVersion = new Feature('upvoted_feed_version', 2);
export const discussedFeedVersion = new Feature('discussed_feed_version', 2);
export const latestFeedVersion = new Feature('latest_feed_version', 2);
export const customFeedVersion = new Feature('custom_feed_version', 2);

export const plusTakeoverContent = new Feature<{
  title: string;
  description: string;
  features: Array<{ label: string; status: PlusItemStatus }>;
  cta: string;
  shouldShowRefund: boolean;
  shouldShowReviews: boolean;
}>('plus_takeover_content', null);

export const featurePlusCtaCopy = new Feature('plus_cta_copy', {
  full: 'Upgrade to Plus',
  short: 'Upgrade',
});

export const featureAutorotateAds = new Feature('autorotate_ads', 0);

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

export const featurePlusEntryMobile = new Feature('plus_entry_mobile', false);
export const featureOnboardingGridVariation = new Feature(
  'onboarding_feature_grid_variation',
  OnboardingGridVariation.Control,
);

export const clickbaitTriesMax = new Feature('clickbait_tries_max', 5);

export { feature };

export const featureCores = new Feature('cores', isDevelopment);

// whether the user will see post boost ads
// does not necessarily mean they can't boost a post if they have access to cores
export const featurePostBoostAds = new Feature('post_boost_ads', isDevelopment);

export const briefCardFeedFeature = new Feature(
  'brief_card_feed',
  isDevelopment,
);

export const briefGeneratePricing = new Feature<Record<BriefingType, number>>(
  'brief_generate_pricing',
  {
    [BriefingType.Daily]: 300,
    [BriefingType.Weekly]: 500,
  },
);

export const briefFeedEntrypointPage = new Feature<false | number>(
  'brief_feed_banner_page',
  0,
);

export const briefUIFeature = new Feature('brief_ui', isDevelopment);
export const adFavicon = new Feature('ad_favicon', isDevelopment);
