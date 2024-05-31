declare const navigator: Navigator & { brave?: { isBrave: unknown } };

// All links are loaded via Rebrandly
export const faq = 'https://r.daily.dev/faqs';
export const feedback = 'https://r.daily.dev/feedback';
export const requestFeature = 'https://r.daily.dev/request-feature';
export const reportIssue = 'https://r.daily.dev/report-issue';
export const termsOfService = 'https://r.daily.dev/tos';
export const privacyPolicy = 'https://r.daily.dev/privacy-policy';
export const cookiePolicy = 'https://r.daily.dev/cookie-policy';
export const reputation = 'https://r.daily.dev/reputation';
export const ownershipGuide = 'https://r.daily.dev/claim';
export const contentGuidelines = 'https://r.daily.dev/content-guidelines';
export const communityLinksGuidelines = 'https://r.daily.dev/community-links';
export const tellMeWhy = 'https://r.daily.dev/tellmewhy';
export const companionExplainerVideo = 'https://r.daily.dev/companion-overview';
export const companionPermissionGrantedLink =
  'https://r.daily.dev/try-the-companion';
export const initialDataKey = 'initial';
export const install = 'https://r.daily.dev/install';
export const uninstall = 'https://r.daily.dev/uninstall';
export const weeklyGoal = 'https://r.daily.dev/weekly-goal';
export const sharingBookmarks = 'https://r.daily.dev/sharing-bookmarks';
export const devCard = 'https://r.daily.dev/devcard-github';
export const docs = 'https://r.daily.dev/docs';
export const markdownGuide = 'https://r.daily.dev/markdown-guide';
export const careers = 'https://r.daily.dev/careers';
export const firstNotificationLink = 'https://r.daily.dev/notifications';
export const reportSquadMember = 'https://r.daily.dev/report-squad-member';
export const squadFeedback = 'https://r.daily.dev/squad-feedback';
export const updateFirefoxExtensionLink = 'https://r.daily.dev/firefoxupdate';
export const downloadBrowserExtension = 'https://r.daily.dev/download';
export const referralToC = 'https://r.daily.dev/referral-toc';
export const twitter = 'https://r.daily.dev/twitter';
export const squadsPublicWaitlist = 'https://r.daily.dev/public-squad-waitlist';
export const squadsPublicSuggestion =
  'https://r.daily.dev/public-squad-suggestion';
export const squadsPublicGuide = 'https://r.daily.dev/public-squads-guide';
export const searchFeedback = 'https://r.daily.dev/search-feedback';
export const searchDocs = 'https://r.daily.dev/search-docs';
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

export const authUrl =
  process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:4433';
export const heimdallUrl = isDevelopment
  ? process.env.NEXT_PUBLIC_HEIMDALL_URL || 'http://127.0.0.1:3000'
  : authUrl;

export const bookmarkLoops = 'https://r.daily.dev/bookmarkloops';
export const migrateUserToStreaks = 'https://r.daily.dev/streaks';
