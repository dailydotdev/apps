const onboardingExcludedPaths = [
  '/onboarding',
  '/activate',
  '/recruiter',
  '/jobs',
  '/settings',
];

// Onboarding is only *forced* when the user lands on the main feed. Anywhere
// else (a post, a squad, a profile) they signed up in place and should keep
// reading. `PostOnboardingActivation` is the nudge back to `/onboarding`, and
// it carries `after_auth` so the page isn't lost.
const mainFeedPathnames = new Set([
  '/',
  '/popular',
  '/upvoted',
  '/discussed',
  '/latest',
  '/following',
  '/my-feed',
]);

const isOnboardingExcludedPath = (pathname: string): boolean =>
  onboardingExcludedPaths.some((path) => pathname.startsWith(path));

export interface OnboardingRedirectParams {
  pathname: string;
  isRouterReady: boolean;
  hasRoutedInstallReferral: boolean;
  isComingFromInstall: boolean;
  isPermissionPrimerLoading: boolean;
  isPermissionPrimerEnabled: boolean;
  isLoggedIn: boolean;
  isFunnel: boolean;
  isOnboardingActionsReady: boolean;
  isOnboardingComplete: boolean;
  isSwipeOnboardingPreviewForced: boolean;
}

export interface OnboardingRedirect {
  destination: string;
  isInstallReferral: boolean;
}

/**
 * Decides whether the app should route the user into onboarding (or the
 * install-referral activation primer). Returns `null` to stay put.
 */
export const getOnboardingRedirect = ({
  pathname,
  isRouterReady,
  hasRoutedInstallReferral,
  isComingFromInstall,
  isPermissionPrimerLoading,
  isPermissionPrimerEnabled,
  isLoggedIn,
  isFunnel,
  isOnboardingActionsReady,
  isOnboardingComplete,
  isSwipeOnboardingPreviewForced,
}: OnboardingRedirectParams): OnboardingRedirect | null => {
  // Don't act on the query until it's parsed; `ref=install` is read below and
  // is undefined on the first render of a hard load.
  if (!isRouterReady) {
    return null;
  }

  // Never redirect away from onboarding-related surfaces (prevents loops).
  if (isOnboardingExcludedPath(pathname)) {
    return null;
  }

  // Once an install referral has been routed, stop here. The redirect drops
  // the `ref` query, so a later run on the still-pending `/` flips
  // `isComingFromInstall` to false and would race a second redirect on top.
  if (hasRoutedInstallReferral) {
    return null;
  }

  // Wait for the permission primer experiment to resolve before routing
  // install referrals.
  if (isComingFromInstall && isPermissionPrimerLoading) {
    return null;
  }

  // `MainLayout` defers `?ref=install` referrals to this decision, so route
  // them here exclusively. Enrolled users get the activation primer (which
  // takes priority over onboarding completion). Logged-out users who aren't
  // enrolled still need onboarding, and the gate below never fires for them
  // since their onboarding actions never load while logged out.
  if (isComingFromInstall && isPermissionPrimerEnabled) {
    return { destination: '/activate', isInstallReferral: true };
  }

  if (isComingFromInstall && !isLoggedIn) {
    return { destination: '/onboarding', isInstallReferral: true };
  }

  if (isFunnel || !isOnboardingActionsReady || isOnboardingComplete) {
    return null;
  }

  if (!mainFeedPathnames.has(pathname)) {
    return null;
  }

  return {
    destination: isSwipeOnboardingPreviewForced
      ? '/onboarding?swipeOnboardingPreview=1'
      : '/onboarding',
    isInstallReferral: false,
  };
};
