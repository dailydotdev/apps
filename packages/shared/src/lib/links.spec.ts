import { withHttps } from './links';

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
