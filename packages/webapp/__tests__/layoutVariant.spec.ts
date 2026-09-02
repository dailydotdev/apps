import { isLayoutVariantEligiblePath } from '../lib/layoutVariant';

describe('isLayoutVariantEligiblePath', () => {
  it('accepts a post permalink', () => {
    expect(
      isLayoutVariantEligiblePath('/posts/why-react-rerenders-abc123'),
    ).toBe(true);
  });

  it.each([
    '/posts/best-of',
    '/posts/discussed',
    '/posts/latest',
    '/posts/upvoted',
  ])('rejects the feed page %s', (pathname) => {
    expect(isLayoutVariantEligiblePath(pathname)).toBe(false);
  });

  it('rejects the markdown variant', () => {
    expect(isLayoutVariantEligiblePath('/posts/abc123.md')).toBe(false);
  });

  it.each([
    '/posts/abc123/edit',
    '/posts/abc123/share',
    '/posts/abc123/analytics',
  ])('rejects the sub-route %s', (pathname) => {
    expect(isLayoutVariantEligiblePath(pathname)).toBe(false);
  });

  it.each(['/posts', '/posts/', '/', '/tags/react', '/squads/daily'])(
    'rejects %s',
    (pathname) => {
      expect(isLayoutVariantEligiblePath(pathname)).toBe(false);
    },
  );
});
