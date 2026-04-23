import { canonicalShortcutUrl, withHttps } from './links';

describe('lib/links tests', () => {
  it('should return links as https links', () => {
    const urls = {
      'www.google.com': 'https://www.google.com',
      'google.com': 'https://google.com',
      '//google.com': 'https://google.com',
      'http://www.google.com': 'http://www.google.com',
      'https://www.google.com': 'https://www.google.com',
      'ftp://www.google.com': 'https://www.google.com',
    };
    Object.entries(urls).forEach(([input, expected]) => {
      expect(withHttps(input)).toEqual(expected);
    });
  });

  describe('canonicalShortcutUrl', () => {
    it('lowercases the host and strips trailing slashes', () => {
      expect(canonicalShortcutUrl('HTTPS://Example.COM/Foo/')).toEqual(
        'https://example.com/Foo',
      );
    });

    it('collapses www. so www.example.com and example.com dedup', () => {
      expect(canonicalShortcutUrl('https://www.example.com/')).toEqual(
        'https://example.com',
      );
      expect(canonicalShortcutUrl('https://example.com')).toEqual(
        'https://example.com',
      );
    });

    it('preserves non-www subdomains', () => {
      expect(canonicalShortcutUrl('https://blog.example.com')).toEqual(
        'https://blog.example.com',
      );
    });

    it('preserves non-default ports', () => {
      expect(canonicalShortcutUrl('https://www.example.com:8443/path')).toEqual(
        'https://example.com:8443/path',
      );
    });

    it('preserves search params and hash so distinct pages dedup separately', () => {
      expect(canonicalShortcutUrl('https://example.com/search?q=foo')).toEqual(
        'https://example.com/search?q=foo',
      );
      expect(canonicalShortcutUrl('https://example.com/app#/route')).toEqual(
        'https://example.com/app#/route',
      );
      expect(
        canonicalShortcutUrl('https://example.com/search?q=foo'),
      ).not.toEqual(canonicalShortcutUrl('https://example.com/search?q=bar'));
    });

    it('returns null for invalid input', () => {
      expect(canonicalShortcutUrl('not a url')).toBeNull();
    });
  });
});
