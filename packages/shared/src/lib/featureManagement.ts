import type { JSONValue } from '@growthbook/growthbook';
import type { FeedAdTemplate } from './feed';
import type { FeedSettingsKeys } from '../contexts/FeedContext';
import type { PlusItemStatus } from '../components/plus/PlusListItem';
import { isDevelopment } from './constants';
import { BriefingType } from '../graphql/posts';
import type { HeroCardsConfig } from '../types';
import { PostType } from '../types';

export class Feature<T extends JSONValue> {
  readonly id: string;

  readonly defaultValue: T;

  constructor(id: string, defaultValue: T) {
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
export const featurePostPageHighlights = new Feature(
  'post_page_highlights',
  false,
);
export const featurePostRedesign = new Feature('post_redesign', false);

// @ts-expect-error stale feature without default
export const plusTakeoverContent = new Feature<{
  title: string;
  description: string;
  features: Array<{ label: string; status: PlusItemStatus }>;
  cta: string;
  shouldShowRefund: boolean;
  shouldShowReviews: boolean;
}>('plus_takeover_content');

export const featurePlusCtaCopy = new Feature('plus_cta_copy', {
  full: 'Level Up with Plus',
  short: 'Upgrade',
});

export const featureLuckyButton = new Feature('lucky_button', false);

export const featureSmartComposer = new Feature('smart_composer', false);

export const featureStandupCreation = new Feature('standup_creation', false);

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

export const featurePlusEntryMobile = new Feature('plus_entry_mobile', false);

export const featureReadingReminderHeroCopy = new Feature(
  'reading_reminder_hero_copy',
  {
    title: 'Never miss a learning day',
    subtitle: 'Turn on your daily reading reminder and keep your routine.',
  },
);

export const clickbaitTriesMax = new Feature('clickbait_tries_max', 5);

// Experiment: show the clickbait shield to free users even while they have
// intro quests, to measure the effect on D1 retention.
export const featureClickbaitShieldIntroQuests = new Feature(
  'clickbait_shield_intro_quests',
  false,
);

export { feature };

export const featureCores = new Feature('cores', isDevelopment);

// whether the user will see post boost ads
// does not necessarily mean they can't boost a post if they have access to cores
export const featurePostBoostAds = new Feature('post_boost_ads', isDevelopment);

export const briefCardFeedFeature = new Feature(
  'brief_card_feed',
  isDevelopment,
);

export const profileCompletionCardFeature = new Feature(
  'profile_completion_card',
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
export const boostSettingsFeature = new Feature('boost_settings', {
  min: 1000,
  max: 100000,
  step: 1000,
  default_cores: 5000,
  default_days: 7,
});

export const adImprovementsV3Feature = new Feature('ad_improvements_v3', false);

export const featureYearInReview = new Feature('year_in_review_2025', false);

export const featureProfileCompletionIndicator = new Feature(
  'profile_completion_indicator',
  0,
);

export const questsFeature = new Feature('quests', true);

export const achievementTrackingWidgetFeature = new Feature(
  'achievement_tracking_widget',
  false,
);

export const sharedPostPreviewFeature = new Feature(
  'shared_post_preview',
  false,
);

export const featureOnboardingTagRecommender = new Feature(
  'onboarding_tag_recommender',
  false,
);

export const featureOnboardingPersonas = new Feature(
  'onboarding_personas',
  false,
);

export const featurePostSignupWidget = new Feature('post_signup_widget', false);

// Gates the one-time intermediate "read inside daily.dev" install prompt for
// users who haven't enabled the reader yet. Unlike the retired reader_modal_v2,
// this nudge is shown at most once ever (see readerInstallPromptSeen).
export const featureReaderModalNudge = new Feature('reader_modal_v3', false);

export const featureShortcutsHub = new Feature('shortcuts_hub_v2', false);

export const featureGiveback = new Feature('giveback', isDevelopment);

export const featureGivebackSuggestCause = new Feature(
  'giveback_suggest_cause',
  false,
);

export const featureCompanionDemoWidget = new Feature(
  'companion_demo_widget',
  false,
);

export const swipeOnboardingFeature = new Feature('swipe_onboarding', false);

export const featureUpvoteCountThreshold = new Feature<{
  threshold: number;
  belowThresholdLabel: string;
  newWindowHours: number;
}>('upvote_count_threshold', {
  threshold: 0,
  belowThresholdLabel: '',
  newWindowHours: 24,
});

export enum FeedChipsVariant {
  None = 'none',
  V2 = 'v2',
}
export const featureFeedChips = new Feature<FeedChipsVariant>(
  'feed_chips',
  FeedChipsVariant.V2,
);

export enum HijackingVariant {
  Default = 'default',
  CTA = 'cta',
  Auth = 'auth',
}
export const featureHijackingVariants = new Feature<HijackingVariant>(
  'hijacking_variants2',
  HijackingVariant.Default,
);

export const featureLayoutV2 = new Feature('layout_v2', false);

export const featureEngagementBarV2 = new Feature('engagement_bar_v2', false);

export const featureHeroCards = new Feature<HeroCardsConfig>('hero_cards', {
  enabled: false,
  minSpacing: 10,
  startIndex: 4,
  chipLabels: {
    breaking: 'Breaking',
    major: 'Major',
    notable: 'Notable',
    breakout: 'Breaking out',
    evergreen: 'Evergreen',
  },
  allowedPostTypes: {
    [PostType.Article]: true,
    [PostType.VideoYouTube]: true,
    [PostType.Share]: false,
    [PostType.Freeform]: false,
    [PostType.Collection]: false,
  },
});

// Floats the feed card action bar over the cover image with an iOS-style glass
// (dark translucent + blur) effect and shrinks the card height.
export const featureFeedCardGlassActions = new Feature(
  'feed_card_glass_actions',
  false,
);

export const featureOnboardingPermissionPrimer = new Feature(
  'onboarding_permission_primer',
  false,
);

export const featureAuthGoogleOneTap = new Feature('auth_google_onetap', false);

// Experiment: skip layout/paint for off-screen feed cards via CSS
// `content-visibility: auto` to keep long feeds responsive.
export const featureFeedContentVisibility = new Feature(
  'feed_content_visibility',
  false,
);

export const featurePublicSignupBanner = new Feature(
  'public_signup_banner',
  false,
);

export enum DailyPageVariant {
  None = 'none',
  V1 = 'v1.1',
  DailyAsDefault = 'daily-as-default',
}
export const featureDailyPage = new Feature<DailyPageVariant>(
  'daily_page',
  DailyPageVariant.None,
);

// Experiment: redesigned notifications page (type filters, time grouping,
// compact rows) backed by server-side type filtering on daily-api. Control is
// the legacy single-list page. Keep the default `false` — GrowthBook ramps it.
export const featureNotificationsRedesign = new Feature(
  'notifications_redesign',
  false,
);
