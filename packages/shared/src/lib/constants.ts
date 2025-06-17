import type { RadioItemProps } from '../components/fields/RadioItem';

declare const navigator: Navigator & { brave?: { isBrave: unknown } };

// All links are loaded via Rebrandly
export const faq = 'https://r.daily.dev/faqs';
export const feedback = 'https://r.daily.dev/feedback';
export const termsOfService = 'https://r.daily.dev/tos';
export const privacyPolicy = 'https://r.daily.dev/privacy-policy';
export const cookiePolicy = 'https://r.daily.dev/cookie-policy';
export const reputation = 'https://r.daily.dev/reputation';
export const ownershipGuide = 'https://r.daily.dev/claim';
export const contentGuidelines = 'https://r.daily.dev/content-guidelines';
export const communityLinksGuidelines = 'https://r.daily.dev/community-links';
export const companionExplainerVideo = 'https://r.daily.dev/companion-overview';
export const companionPermissionGrantedLink =
  'https://r.daily.dev/try-the-companion';
export const initialDataKey = 'initial';
export const install = 'https://r.daily.dev/install';
export const uninstall = 'https://r.daily.dev/uninstall';
export const sharingBookmarks = 'https://r.daily.dev/sharing-bookmarks';
export const devCard = 'https://r.daily.dev/devcard-github';
export const docs = 'https://r.daily.dev/docs';
export const markdownGuide = 'https://r.daily.dev/markdown-guide';
export const careers = 'https://r.daily.dev/careers';
export const firstNotificationLink = 'https://r.daily.dev/notifications';
export const reportSquadMember = 'https://r.daily.dev/report-squad-member';
export const squadFeedback = 'https://r.daily.dev/squad-feedback';
export const downloadBrowserExtension = 'https://r.daily.dev/download';
export const twitter = 'https://r.daily.dev/twitter';
export const slackIntegration = 'https://r.daily.dev/slack';
export const statusPage = 'https://r.daily.dev/status';
export const businessWebsiteUrl = 'https://r.daily.dev/business';
export const appsUrl = 'https://daily.dev/apps';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting =
  process.env.NODE_ENV === 'test' || (!isDevelopment && !isProduction);
export const isGBDevMode = process.env.NEXT_PUBLIC_GB_DEV_MODE === 'true';

export const isBrave = (): boolean => {
  if (!window.Promise) {
    return false;
  }
  return typeof navigator.brave?.isBrave === 'function';
};
export const isChrome = (): boolean =>
  /Chrome/.test(globalThis?.navigator?.userAgent) &&
  /Google Inc/.test(globalThis?.navigator?.vendor);

export const webappUrl = process.env.NEXT_PUBLIC_WEBAPP_URL;
export const onboardingUrl = `${webappUrl}onboarding`;
export const plusUrl = `${webappUrl}plus`;
export const managePlusUrl = 'https://r.daily.dev/billing';
export const plusDetailsUrl = 'https://r.daily.dev/plus-onboarding';
export const plusSuccessUrl = `${plusUrl}/success`;
export const walletUrl = `${webappUrl}wallet`;
export const settingsUrl = `${webappUrl}settings`;
export const briefingUrl = `${webappUrl}briefing`;

export const authUrl =
  process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:4433';
export const heimdallUrl = isDevelopment
  ? process.env.NEXT_PUBLIC_HEIMDALL_URL || 'http://127.0.0.1:3000'
  : authUrl;

export const migrateUserToStreaks = 'https://r.daily.dev/streaks';
export const topReaderBadgeDocs = 'https://r.daily.dev/top-reader-badge';
export const plusOrganizationInfo = 'https://r.daily.dev/organizations';

export const squadCategoriesPaths = {
  'My Squads': '/squads/discover/my',
  discover: '/squads/discover',
  featured: '/squads/discover/featured',
};

export const AD_PLACEHOLDER_SOURCE_ID = '__dailydotdev_app_ad_placeholder__';

export const emojiOptions = [
  '',
  '🐹',
  '🐍',
  '☕️',
  '🔥',
  '📦',
  '⚙️',
  '🐙',
  '🐳',
  '💡',
  '📜',
  '🚀',
];

export enum FeedOrder {
  Recommended = 'recommended',
  Date = 'date',
  Upvotes = 'upvotes',
  Downvotes = 'downvotes',
  Comments = 'comments',
  Clicks = 'clicks',
}

export const feedRangeFilters: RadioItemProps[] = [
  {
    label: 'All time',
    value: null,
  },
  {
    label: 'Past 24 hours',
    value: '1',
  },
  {
    label: 'Past week',
    value: '7',
  },
  {
    label: 'Past month',
    value: '30',
  },
];

/*
  The list below must match the Confluence page attached
  https://dailydotdev.atlassian.net/wiki/spaces/HAN/pages/1571946510/Restricted+countries+for+business+activities+aka+sanctioned+countries#Restricted-Countries-and-Regions
*/
export const invalidPlusRegions = [
  'AF', // Afghanistan
  'AQ', // Antarctica
  'BY', // Belarus
  'MM', // Burma (Myanmar)
  'CF', // Central African Republic
  'UA-43', // Crimea (Region of Ukraine)
  'CU', // Cuba
  'CD', // Democratic Republic of Congo
  'UA-14', // Donetsk (Region of Ukraine)
  'HT', // Haiti
  'IR', // Iran
  'IQ', // Iraq
  'UA-65', // Kherson (Region of Ukraine)
  'LB', // Lebanon
  'LY', // Libya
  'UA-09', // Luhansk (Region of Ukraine)
  'ML', // Mali
  'AN', // Netherlands Antilles
  'NI', // Nicaragua
  'KP', // North Korea
  'RU', // Russia
  'SO', // Somalia
  'SS', // South Sudan
  'SD', // Sudan
  'SY', // Syria
  'VE', // Venezuela
  'YE', // Yemen
  'UA-23', // Zaporizhzhia (Region of Ukraine)
  'ZW', // Zimbabwe
];

export const DeletedPostId = '404';

export const BROADCAST_CHANNEL_NAME = 'dailydev_broadcast';
export const broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

export const withdrawLink = 'https://r.daily.dev/withdraw';

export const coresDocsLink = 'https://r.daily.dev/cores';

export const webFunnelPrefix = '/helloworld';

export const creatorsTermsOfService = 'https://r.daily.dev/creators-terms';
