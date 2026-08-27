import { isOnboardingFeedPathname } from '@dailydotdev/shared/src/lib/onboarding';

// Loop guards only. Every other non-feed path already falls through to the
// `isOnboardingFeedPathname` gate below; these two are the redirect targets, so
// they have to be excluded before the install branch fires.
const onboardingExcludedPaths = ['/onboarding', '/activate'];

const isOnboardingExcludedPath = (pathname: string): boolean =>
  onboardingExcludedPaths.some((path) => pathname.startsWith(path));

export interface OnboardingRedirectParams {
  pathname: string;
  isRouterReady: boolean;
  hasRoutedInstallReferral: boolean;
  isComingFromInstall: boolean;
  isFunnel: boolean;
  isOnboardingActionsReady: boolean;
  isOnboardingComplete: boolean;
}

export interface OnboardingRedirect {
  destination: string;
  isInstallReferral: boolean;
}

/**
 * Decides whether the app should route the user into onboarding (or the
 * new-tab activation primer). Returns `null` to stay put.
 */
export const getOnboardingRedirect = ({
  pathname,
  isRouterReady,
  hasRoutedInstallReferral,
  isComingFromInstall,
  isFunnel,
  isOnboardingActionsReady,
  isOnboardingComplete,
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
  // `isComingFromInstall` to false and would send the user to `/onboarding`
  // on top of the `/activate` navigation already in flight.
  if (hasRoutedInstallReferral) {
    return null;
  }

  // Extension installs land on `/?ref=install` and always get the activation
  // primer, which hands off to `/onboarding` once the user acts on it. This
  // takes priority over onboarding completion. `MainLayout` defers these
  // referrals here so only one place routes them.
  if (isComingFromInstall) {
    return { destination: '/activate', isInstallReferral: true };
  }

  if (isFunnel || !isOnboardingActionsReady || isOnboardingComplete) {
    return null;
  }

  if (!isOnboardingFeedPathname(pathname)) {
    return null;
  }

  return { destination: '/onboarding', isInstallReferral: false };
};
