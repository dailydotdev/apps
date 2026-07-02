import { formatImpressions, getPostImpressions } from './impressions';
import type { Post } from '../graphql/posts';

describe('function formatImpressions', () => {
  it('renders raw numbers below 1000', () => {
    expect(formatImpressions(0)).toBe('0');
    expect(formatImpressions(1)).toBe('1');
    expect(formatImpressions(999)).toBe('999');
  });

  it('shows one decimal only while the abbreviated value is under 10', () => {
    expect(formatImpressions(1200)).toBe('1.2K');
    expect(formatImpressions(9900)).toBe('9.9K');
    expect(formatImpressions(1_800_000)).toBe('1.8M');
  });

  it('drops the decimal once the abbreviated value reaches double digits', () => {
    expect(formatImpressions(12_000)).toBe('12K');
    expect(formatImpressions(137_000)).toBe('137K');
    expect(formatImpressions(45_000_000)).toBe('45M');
  });

  it('carries to the next unit when rounding lands on 1000', () => {
    expect(formatImpressions(999_500)).toBe('1M');
    expect(formatImpressions(999_999)).toBe('1M');
    expect(formatImpressions(999_999_999)).toBe('1B');
  });

  it('handles null and non-finite input', () => {
    expect(formatImpressions(null)).toBe('0');
    expect(formatImpressions(NaN)).toBe('0');
    expect(formatImpressions(Infinity)).toBe('0');
  });
});

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
