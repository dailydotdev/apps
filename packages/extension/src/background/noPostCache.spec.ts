import {
  createNoPostCache,
  NO_POST_CACHE_MAX_SIZE,
  NO_POST_CACHE_TTL,
} from './noPostCache';

describe('createNoPostCache', () => {
  const url = 'https://example.com/post';

  it('remembers a url until the ttl expires', () => {
    const cache = createNoPostCache();
    cache.add(url, 0);

    expect(cache.has(url, NO_POST_CACHE_TTL - 1)).toBe(true);
    expect(cache.has(url, NO_POST_CACHE_TTL)).toBe(false);
    expect(cache.has('https://example.com/other', 0)).toBe(false);
  });

  it('evicts the oldest entries beyond the max size', () => {
    const cache = createNoPostCache();
    const urls = Array.from(
      { length: NO_POST_CACHE_MAX_SIZE + 1 },
      (_, i) => `https://example.com/${i}`,
    );
    urls.forEach((current) => cache.add(current, 0));

    expect(cache.has(urls[0], 1)).toBe(false);
    expect(cache.has(urls[1], 1)).toBe(true);
    expect(cache.has(urls[NO_POST_CACHE_MAX_SIZE], 1)).toBe(true);
  });
});
