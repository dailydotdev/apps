import { shouldSkipCompanionUrl } from './companionUrlFilter';

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
