declare const navigator: Navigator & { brave?: { isBrave: unknown } };
export const faq = 'https://docs.daily.dev/faqs';
export const requestFeature =
  'https://github.com/dailydotdev/daily/discussions/new?category=feature-request';
export const reportIssue = 'https://it057218.typeform.com/to/zN8B5Vog';
export const termsOfService = 'https://daily.dev/tos';
export const privacyPolicy = 'https://daily.dev/privacy/applications-policy';
export const cookiePolicy = 'https://daily.dev/privacy/applications-cookies';
export const reputationGuide =
  'https://daily.dev/posts/what-is-reputation-how-do-i-earn-it';
export const ownershipGuide =
  'https://daily.dev/posts/claiming-ownership-on-an-article-you-wrote';
export const contentGuidelines = 'https://daily.dev/support/content-guidelines';
export const communityLinksGuidelines = 'https://r.daily.dev/community-links';
export const companionExplainerVideo = 'https://r.daily.dev/companion-overview';
export const companionPermissionGrantedLink =
  'https://r.daily.dev/try-the-companion';
export const initialDataKey = 'initial';
export const submissionGuidelineDocsLink =
  'https://docs.daily.dev/docs/how-does-daily-dev-work/community-picks-submission-guidelines';

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

export const authUrl =
  process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:4433';
export const heimdallUrl = isDevelopment
  ? process.env.NEXT_PUBLIC_HEIMDALL_URL || 'http://127.0.0.1:3000'
  : authUrl;
