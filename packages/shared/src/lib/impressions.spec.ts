import { getPostImpressions } from './impressions';
import type { Post } from '../graphql/posts';

describe('function getPostImpressions', () => {
  const make = (data: Partial<Post>): Pick<Post, 'views' | 'analytics'> =>
    data as Pick<Post, 'views' | 'analytics'>;

  it('prefers analytics.impressions over views', () => {
    expect(
      getPostImpressions(make({ analytics: { impressions: 42 }, views: 7 })),
    ).toBe(42);
  });

  it('falls back to views when analytics is absent', () => {
    expect(getPostImpressions(make({ views: 7 }))).toBe(7);
  });

  it('returns null when neither is present (no mock)', () => {
    expect(getPostImpressions(make({}))).toBeNull();
  });

  it('keeps a real zero rather than inventing a number', () => {
    expect(getPostImpressions(make({ views: 0 }))).toBe(0);
  });
});
