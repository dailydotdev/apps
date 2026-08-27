import { isOnboardingFeedPathname } from './onboarding';

// Both the logged-out redirect in `MainLayout` and the signed-in one in the
// webapp's `getOnboardingRedirect` read this predicate. The two used to keep
// separate lists that silently drifted apart, so pin the set here: changing it
// changes who gets forced into onboarding on both surfaces at once.
describe('isOnboardingFeedPathname', () => {
  it.each(['/', '/popular', '/upvoted', '/my-feed'])(
    'forces onboarding on %s',
    (pathname) => {
      expect(isOnboardingFeedPathname(pathname)).toBe(true);
    },
  );

  it.each([
    '/discussed',
    '/following',
    '/feeds/[slugOrId]',
    '/explore/[tag]',
    '/search/posts',
    '/posts/[id]',
    '/squads/[handle]',
    '/[userId]',
    '/bookmarks',
    '/onboarding',
    '/activate',
  ])('leaves the user on %s', (pathname) => {
    expect(isOnboardingFeedPathname(pathname)).toBe(false);
  });

  it('matches route patterns, not resolved hrefs', () => {
    // Callers pass `router.pathname`, so a resolved URL must not match.
    expect(isOnboardingFeedPathname('/popular?ref=install')).toBe(false);
    expect(isOnboardingFeedPathname('/feeds/my-custom-feed')).toBe(false);
  });
});
