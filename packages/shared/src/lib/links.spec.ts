import { getPathnameWithQuery, withHttps } from './links';

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
});

describe('getPathnameWithQuery', () => {
  it('returns pathname unchanged when params are empty', () => {
    expect(getPathnameWithQuery('/foo', new URLSearchParams())).toBe('/foo');
  });

  it('appends params to a clean pathname', () => {
    const params = new URLSearchParams({ a: '1', b: '2' });
    expect(getPathnameWithQuery('/foo', params)).toBe('/foo?a=1&b=2');
  });

  it('preserves existing query params on the pathname', () => {
    expect(getPathnameWithQuery('/foo?a=1', new URLSearchParams())).toBe(
      '/foo?a=1',
    );
  });

  it('merges existing pathname query with new params', () => {
    const params = new URLSearchParams({ b: '2' });
    expect(getPathnameWithQuery('/foo?a=1', params)).toBe('/foo?a=1&b=2');
  });

  it('lets new params override pathname query on key conflicts', () => {
    const params = new URLSearchParams({ a: '2', b: '3' });
    expect(getPathnameWithQuery('/foo?a=1', params)).toBe('/foo?a=2&b=3');
  });

  it('accepts a string params argument', () => {
    expect(getPathnameWithQuery('/foo?a=1', 'b=2')).toBe('/foo?a=1&b=2');
  });

  it('ignores whitespace-only existing query', () => {
    expect(getPathnameWithQuery('/foo? ', new URLSearchParams())).toBe('/foo');
    expect(getPathnameWithQuery('/foo?   ', 'a=1')).toBe('/foo?a=1');
  });
});
