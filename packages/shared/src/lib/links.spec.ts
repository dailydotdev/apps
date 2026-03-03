import {
  addSettingsBackPath,
  resolveSettingsBackPath,
  settingsBackPathQueryParam,
  withHttps,
} from './links';

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

  it('should resolve a valid settings back path', () => {
    expect(resolveSettingsBackPath('/')).toEqual('/');
    expect(resolveSettingsBackPath('/my-feed?tab=popular')).toEqual(
      '/my-feed?tab=popular',
    );
  });

  it('should ignore invalid settings back paths', () => {
    expect(resolveSettingsBackPath(undefined)).toBeUndefined();
    expect(resolveSettingsBackPath('//evil.com')).toBeUndefined();
    expect(resolveSettingsBackPath('/settings/feed/general')).toBeUndefined();
  });

  it('should append settings back path only to settings links', () => {
    const settingsHref = '/settings/feed/general';
    const linkWithBack = addSettingsBackPath(settingsHref, '/');
    const settingsUrl = new URL(linkWithBack, 'http://localhost');

    expect(settingsUrl.pathname).toEqual('/settings/feed/general');
    expect(settingsUrl.searchParams.get(settingsBackPathQueryParam)).toEqual(
      '/',
    );
    expect(addSettingsBackPath('/wallet', '/')).toEqual('/wallet');
    expect(addSettingsBackPath(settingsHref, '/settings')).toEqual(
      settingsHref,
    );
  });
});
