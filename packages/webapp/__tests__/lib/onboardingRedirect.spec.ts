import type { OnboardingRedirectParams } from '../../lib/onboardingRedirect';
import { getOnboardingRedirect } from '../../lib/onboardingRedirect';

// A logged-in user who just registered and hasn't customized their feed yet.
const justSignedUp: OnboardingRedirectParams = {
  pathname: '/posts/[id]',
  isRouterReady: true,
  hasRoutedInstallReferral: false,
  isComingFromInstall: false,
  isPermissionPrimerLoading: false,
  isPermissionPrimerEnabled: false,
  isLoggedIn: true,
  isFunnel: false,
  isOnboardingActionsReady: true,
  isOnboardingComplete: false,
  isSwipeOnboardingPreviewForced: false,
};

const redirect = (overrides: Partial<OnboardingRedirectParams> = {}) =>
  getOnboardingRedirect({ ...justSignedUp, ...overrides });

describe('getOnboardingRedirect', () => {
  it('keeps a user who just signed up on the post page', () => {
    expect(redirect()).toBeNull();
  });

  it('keeps them on the post page regardless of the auth modal lifecycle', () => {
    // Regression guard for #6131: the deferral used to be gated on
    // `shouldShowLogin`, which flips to false the moment registration succeeds
    // and closes the modal, bouncing the user off the post they were reading.
    // The decision must not depend on auth-modal state at all.
    expect(getOnboardingRedirect(justSignedUp)).toBeNull();
  });

  it.each([
    '/posts/[id]',
    '/squads/[handle]',
    '/[userId]',
    '/tags/[tag]',
    '/sources/[source]',
    '/search',
    '/bookmarks',
  ])('does not force onboarding away from %s', (pathname) => {
    expect(redirect({ pathname })).toBeNull();
  });

  it.each([
    '/',
    '/popular',
    '/upvoted',
    '/discussed',
    '/latest',
    '/following',
    '/my-feed',
  ])('forces onboarding on the main feed at %s', (pathname) => {
    expect(redirect({ pathname })).toEqual({
      destination: '/onboarding',
      isInstallReferral: false,
    });
  });

  it('carries the swipe preview query when forced', () => {
    expect(
      redirect({ pathname: '/', isSwipeOnboardingPreviewForced: true }),
    ).toEqual({
      destination: '/onboarding?swipeOnboardingPreview=1',
      isInstallReferral: false,
    });
  });

  it('stays put once onboarding is complete', () => {
    expect(redirect({ pathname: '/', isOnboardingComplete: true })).toBeNull();
  });

  it('stays put until onboarding actions have loaded', () => {
    expect(
      redirect({ pathname: '/', isOnboardingActionsReady: false }),
    ).toBeNull();
  });

  it('stays put on the funnel', () => {
    expect(redirect({ pathname: '/', isFunnel: true })).toBeNull();
  });

  it('stays put until the router is ready', () => {
    expect(redirect({ pathname: '/', isRouterReady: false })).toBeNull();
  });

  it.each(['/onboarding', '/activate', '/recruiter', '/jobs', '/settings'])(
    'never redirects away from %s',
    (pathname) => {
      expect(redirect({ pathname })).toBeNull();
    },
  );

  describe('install referrals', () => {
    const fromInstall: Partial<OnboardingRedirectParams> = {
      pathname: '/',
      isComingFromInstall: true,
      isLoggedIn: false,
      isOnboardingActionsReady: false,
    };

    it('routes enrolled users to the activation primer', () => {
      expect(
        redirect({ ...fromInstall, isPermissionPrimerEnabled: true }),
      ).toEqual({ destination: '/activate', isInstallReferral: true });
    });

    it('routes logged-out users to onboarding when not enrolled', () => {
      expect(redirect(fromInstall)).toEqual({
        destination: '/onboarding',
        isInstallReferral: true,
      });
    });

    it('waits for the permission primer experiment to resolve', () => {
      expect(
        redirect({ ...fromInstall, isPermissionPrimerLoading: true }),
      ).toBeNull();
    });

    it('does not route a second time once the referral was handled', () => {
      expect(
        redirect({
          ...fromInstall,
          isPermissionPrimerEnabled: true,
          hasRoutedInstallReferral: true,
        }),
      ).toBeNull();
    });
  });
});
