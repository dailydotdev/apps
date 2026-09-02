import type { OnboardingRedirectParams } from '../../lib/onboardingRedirect';
import { getOnboardingRedirect } from '../../lib/onboardingRedirect';

// A logged-in user who just registered and hasn't customized their feed yet.
const justSignedUp: OnboardingRedirectParams = {
  pathname: '/posts/[id]',
  isRouterReady: true,
  hasRoutedInstallReferral: false,
  isComingFromInstall: false,
  isFunnel: false,
  isOnboardingActionsReady: true,
  isOnboardingComplete: false,
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
    // The decision must not depend on auth-modal state at all, which is why no
    // such input exists on `OnboardingRedirectParams`.
    expect(getOnboardingRedirect(justSignedUp)).toBeNull();
  });

  it.each([
    '/posts/[id]',
    '/squads/[handle]',
    '/[userId]',
    '/tags/[tag]',
    '/sources/[source]',
    '/search/posts',
    '/bookmarks',
    '/discussed',
    '/following',
    '/feeds/[slugOrId]',
    '/explore/[tag]',
  ])('does not force onboarding away from %s', (pathname) => {
    expect(redirect({ pathname })).toBeNull();
  });

  it.each(['/', '/popular', '/upvoted', '/my-feed'])(
    'forces onboarding on the main feed at %s',
    (pathname) => {
      expect(redirect({ pathname })).toEqual({
        destination: '/onboarding',
        isInstallReferral: false,
      });
    },
  );

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

  it.each(['/onboarding', '/activate'])(
    'never redirects away from %s',
    (pathname) => {
      expect(redirect({ pathname })).toBeNull();
    },
  );

  describe('install referrals', () => {
    const fromInstall: Partial<OnboardingRedirectParams> = {
      pathname: '/',
      isComingFromInstall: true,
      isOnboardingActionsReady: false,
    };

    it('routes every install referral to the activation primer', () => {
      expect(redirect(fromInstall)).toEqual({
        destination: '/activate',
        isInstallReferral: true,
      });
    });

    it('routes install referrals ahead of onboarding completion', () => {
      expect(
        redirect({
          ...fromInstall,
          isOnboardingActionsReady: true,
          isOnboardingComplete: true,
        }),
      ).toEqual({ destination: '/activate', isInstallReferral: true });
    });

    it('does not route a second time once the referral was handled', () => {
      expect(
        redirect({ ...fromInstall, hasRoutedInstallReferral: true }),
      ).toBeNull();
    });

    it('does not send a handled referral on to onboarding', () => {
      // After `replace('/activate')` the `ref` query is dropped while the
      // router still reports `/`. Without the one-shot guard the general rule
      // would fire and clobber the activation navigation.
      expect(
        redirect({
          pathname: '/',
          hasRoutedInstallReferral: true,
          isOnboardingActionsReady: true,
          isOnboardingComplete: false,
        }),
      ).toBeNull();
    });
  });
});
