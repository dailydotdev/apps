import { getShortcutDedupKey } from './getShortcutDedupKey';

describe('getShortcutDedupKey', () => {
  it('lowercases the host and strips trailing slashes', () => {
    expect(getShortcutDedupKey('HTTPS://Example.COM/Foo/')).toEqual(
      'https://example.com/Foo',
    );
  });

  it('collapses www. so www.example.com and example.com dedup', () => {
    expect(getShortcutDedupKey('https://www.example.com/')).toEqual(
      'https://example.com',
    );
    expect(getShortcutDedupKey('https://example.com')).toEqual(
      'https://example.com',
    );
  });

  it('preserves non-www subdomains', () => {
    expect(getShortcutDedupKey('https://blog.example.com')).toEqual(
      'https://blog.example.com',
    );
  });

  it('preserves non-default ports', () => {
    expect(getShortcutDedupKey('https://www.example.com:8443/path')).toEqual(
      'https://example.com:8443/path',
    );
  });

  it('preserves search params and hash so distinct pages dedup separately', () => {
    expect(getShortcutDedupKey('https://example.com/search?q=foo')).toEqual(
      'https://example.com/search?q=foo',
    );
    expect(getShortcutDedupKey('https://example.com/app#/route')).toEqual(
      'https://example.com/app#/route',
    );
    expect(getShortcutDedupKey('https://example.com/search?q=foo')).not.toEqual(
      getShortcutDedupKey('https://example.com/search?q=bar'),
    );
  });

  it('returns null for invalid input', () => {
    expect(getShortcutDedupKey('not a url')).toBeNull();
  });
});
