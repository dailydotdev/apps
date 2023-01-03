declare const navigator: Navigator & { brave?: { isBrave: unknown } };

// All links are loaded via Rebrandly
export const faq = 'https://r.daily.dev/faqs';
export const feedback = 'https://r.daily.dev/feedback';
export const requestFeature = 'https://r.daily.dev/request-feature';
export const reportIssue = 'https://r.daily.dev/report-issue';
export const termsOfService = 'https://r.daily.dev/tos';
export const privacyPolicy = 'https://r.daily.dev/privacy-policy';
export const cookiePolicy = 'https://r.daily.dev/cookie-policy';
export const reputationGuide = 'https://r.daily.dev/reputation-guide';
export const ownershipGuide = 'https://r.daily.dev/claim';
export const contentGuidelines = 'https://r.daily.dev/content-guidelines';
export const communityLinksGuidelines = 'https://r.daily.dev/community-links';
export const companionExplainerVideo = 'https://r.daily.dev/companion-overview';
export const companionPermissionGrantedLink =
  'https://r.daily.dev/try-the-companion';
export const initialDataKey = 'initial';
export const submissionGuidelineDocsLink =
  'https://r.daily.dev/submission-guidelines';
export const uninstall = 'https://r.daily.dev/uninstall';
export const weeklyGoal = 'https://r.daily.dev/weekly-goal';
export const sharingBookmarks = 'https://r.daily.dev/sharing-bookmarks';
export const devCard = 'https://r.daily.dev/devcard-github';
export const docs = 'https://r.daily.dev/docs';
export const markdownGuide = 'https://r.daily.dev/markdown-guide';
export const firstNotificationLink = 'https://r.daily.dev/notifications';

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting =
  process.env.NODE_ENV === 'test' || (!isDevelopment && !isProduction);

export const isBrave = (): boolean => {
  if (!window.Promise) {
    return false;
  }
  return typeof navigator.brave?.isBrave === 'function';
};

export const webappUrl = process.env.NEXT_PUBLIC_WEBAPP_URL;

export const authUrl =
  process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:4433';
export const heimdallUrl = isDevelopment
  ? process.env.NEXT_PUBLIC_HEIMDALL_URL || 'http://127.0.0.1:3000'
  : authUrl;
