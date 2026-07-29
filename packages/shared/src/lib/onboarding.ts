// The pages where an incomplete onboarding is *forced* rather than deferred.
// Anywhere else (a post, a squad, a profile, a custom feed) the user keeps
// browsing and is nudged instead, so signing up in place never costs them the
// page they were on.
//
// Route patterns, not hrefs: this is matched against `router.pathname`, which
// is shared between the logged-out redirect in `MainLayout` and the logged-in
// one in the webapp's `getOnboardingRedirect`. Both must agree, or the same
// URL forces onboarding for one audience and not the other.
const onboardingFeedPathnames = new Set([
  '/',
  '/popular',
  '/upvoted',
  '/my-feed',
]);

export const isOnboardingFeedPathname = (pathname: string): boolean =>
  onboardingFeedPathnames.has(pathname);
