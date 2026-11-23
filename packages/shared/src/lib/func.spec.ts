import {
  getChromeIntentUrl,
  getDailyClientPlatform,
  isAndroidMetaInAppBrowser,
} from './func';

// In the test environment `TARGET_BROWSER` is unset, so `isExtension` is false
// and these cases exercise the web (non-extension) branches.
describe('getDailyClientPlatform', () => {
  it('reports the native platform from the app version', () => {
    expect(getDailyClientPlatform('ios')).toBe('ios');
    expect(getDailyClientPlatform('android')).toBe('android');
  });

  it('falls back to webapp for any other or missing version', () => {
    expect(getDailyClientPlatform('pwa')).toBe('webapp');
    expect(getDailyClientPlatform()).toBe('webapp');
  });
});

describe('isAndroidMetaInAppBrowser', () => {
  const setUserAgent = (userAgent: string) =>
    jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent);

  afterEach(() => jest.restoreAllMocks());

  it('matches Facebook and Instagram on Android', () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 14; wv) Chrome/131.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.48.80;]',
    );
    expect(isAndroidMetaInAppBrowser()).toBe(true);
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 14; wv) Chrome/131.0 Mobile Safari/537.36 Instagram 350.0.0.0 Android',
    );
    expect(isAndroidMetaInAppBrowser()).toBe(true);
  });

  it('ignores Facebook on iOS and plain Android Chrome', () => {
    setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148 [FBAN/FBIOS;FBAV/490.0]',
    );
    expect(isAndroidMetaInAppBrowser()).toBe(false);
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 14) Chrome/131.0 Mobile Safari/537.36',
    );
    expect(isAndroidMetaInAppBrowser()).toBe(false);
  });
});

describe('getChromeIntentUrl', () => {
  it('opens the same page and query in Chrome', () => {
    expect(
      getChromeIntentUrl(
        'https://daily.dev/squads/new?company=1&utm_source=meta#top',
      ),
    ).toBe(
      'intent://daily.dev/squads/new?company=1&utm_source=meta#Intent;scheme=https;package=com.android.chrome;end',
    );
  });
});
