import { shouldEnableNavigationPreload } from '../../lib/serviceWorker';

describe('shouldEnableNavigationPreload', () => {
  it('disables navigation preload for Safari on macOS', () => {
    expect(
      shouldEnableNavigationPreload(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
      ),
    ).toBe(false);
  });

  it('keeps navigation preload enabled for Chrome on macOS', () => {
    expect(
      shouldEnableNavigationPreload(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      ),
    ).toBe(true);
  });

  it('keeps navigation preload enabled for Firefox on macOS', () => {
    expect(
      shouldEnableNavigationPreload(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0',
      ),
    ).toBe(true);
  });
});
