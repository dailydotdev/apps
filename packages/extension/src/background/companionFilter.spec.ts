import type { Storage } from 'webextension-polyfill';
import {
  createNoPostCache,
  NO_POST_CACHE_MAX_SIZE,
  NO_POST_CACHE_TTL,
  shouldSkipCompanionUrl,
} from './companionFilter';

jest.mock('webextension-polyfill', () => ({}));

const skips = (url: string) => shouldSkipCompanionUrl(new URL(url));

describe('shouldSkipCompanionUrl', () => {
  it('allows regular http and https pages', () => {
    expect(skips('https://github.com/dailydotdev/apps')).toBe(false);
    expect(skips('http://blog.example.com/post?id=1')).toBe(false);
  });

  it.each([
    'chrome://newtab/',
    'chrome-extension://abc/index.html',
    'file:///Users/me/index.html',
    'about:blank',
  ])('skips non-http url %s', (url) => {
    expect(skips(url)).toBe(true);
  });

  it.each([
    'http://localhost:3000/',
    'http://127.0.0.1:5000/',
    'http://192.168.1.10/',
    'http://[::1]:8080/',
    'http://printer.local/',
    'http://app.localhost/',
    'https://site.test/',
    'https://grafana.internal/',
  ])('skips local host %s', (url) => {
    expect(skips(url)).toBe(true);
  });

  it('does not treat lookalike public hosts as local', () => {
    expect(skips('https://mytest.com/')).toBe(false);
    expect(skips('https://internal.example.com/')).toBe(false);
  });

  it('skips blocked hosts and their subdomains', () => {
    expect(skips('https://discord.com/channels/1')).toBe(true);
    expect(skips('https://ptb.discord.com/')).toBe(true);
    expect(skips('https://x.com/home')).toBe(true);
    expect(skips('https://www.linkedin.com/feed/')).toBe(true);
  });

  it('does not over-match hosts that only share a suffix', () => {
    expect(skips('https://notdiscord.com/')).toBe(false);
    expect(skips('https://box.com/')).toBe(false);
    expect(skips('https://discord.com.example.org/')).toBe(false);
  });

  it('keeps the existing excluded origins', () => {
    expect(skips('https://www.google.com/search?q=react')).toBe(true);
    expect(skips('https://app.daily.dev/posts/1')).toBe(true);
    expect(skips('https://stackoverflow.com/questions/1')).toBe(true);
  });
});

describe('createNoPostCache', () => {
  const url = 'https://example.com/post';

  it('remembers a url until the ttl expires', async () => {
    const cache = createNoPostCache();
    await cache.add(url, 0);

    expect(await cache.has(url, NO_POST_CACHE_TTL - 1)).toBe(true);
    expect(await cache.has(url, NO_POST_CACHE_TTL)).toBe(false);
    expect(await cache.has('https://example.com/other', 0)).toBe(false);
  });

  it('evicts the oldest entries beyond the max size', async () => {
    const cache = createNoPostCache();
    const urls = Array.from(
      { length: NO_POST_CACHE_MAX_SIZE + 1 },
      (_, i) => `https://example.com/${i}`,
    );
    await urls.reduce(
      (prev, current) => prev.then(() => cache.add(current, 0)),
      Promise.resolve(),
    );

    expect(await cache.has(urls[0], 1)).toBe(false);
    expect(await cache.has(urls[1], 1)).toBe(true);
    expect(await cache.has(urls[NO_POST_CACHE_MAX_SIZE], 1)).toBe(true);
  });

  it('restores entries from storage after a restart', async () => {
    let stored: Record<string, unknown> = {};
    const storage = {
      get: jest.fn(async () => stored),
      set: jest.fn(async (items: Record<string, unknown>) => {
        stored = { ...stored, ...items };
      }),
    } as unknown as Storage.StorageArea;

    await createNoPostCache(storage).add(url, 0);

    expect(await createNoPostCache(storage).has(url, 1)).toBe(true);
  });
});
