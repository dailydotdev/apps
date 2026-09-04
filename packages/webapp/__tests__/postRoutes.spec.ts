import { isPostDetailPath, isPostPermalinkPath } from '../lib/postRoutes';

describe('isPostPermalinkPath', () => {
  it('accepts a post permalink', () => {
    expect(isPostPermalinkPath('/posts/why-react-rerenders-abc123')).toBe(true);
  });

  it.each([
    '/posts/best-of',
    '/posts/discussed',
    '/posts/latest',
    '/posts/upvoted',
  ])('rejects the feed page %s', (pathname) => {
    expect(isPostPermalinkPath(pathname)).toBe(false);
  });

  it('rejects the markdown variant', () => {
    expect(isPostPermalinkPath('/posts/abc123.md')).toBe(false);
  });

  it.each([
    '/posts/abc123/edit',
    '/posts/abc123/share',
    '/posts/abc123/analytics',
    '/posts/best-of/2026/08',
  ])('rejects the sub-route %s', (pathname) => {
    expect(isPostPermalinkPath(pathname)).toBe(false);
  });

  it.each(['/posts', '/posts/', '/', '/tags/react', '/squads/daily'])(
    'rejects %s',
    (pathname) => {
      expect(isPostPermalinkPath(pathname)).toBe(false);
    },
  );
});

describe('isPostDetailPath (ad navigation boundary)', () => {
  it.each(['/posts/abc123', '/posts/abc123?comment=1', '/posts/abc123/share'])(
    'keeps client-side navigation for %s',
    (url) => {
      expect(isPostDetailPath(url)).toBe(true);
    },
  );

  it.each([
    '/posts/best-of/2026/08',
    '/posts/latest',
    '/posts/discussed',
    '/posts/upvoted',
    '/posts',
    '/my-feed',
  ])('forces a hard navigation for %s', (url) => {
    expect(isPostDetailPath(url)).toBe(false);
  });
});
