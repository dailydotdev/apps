import {
  ASK_FOR_REVIEW_DISMISSED_KEY,
  ASK_FOR_REVIEW_SESSION_KEY,
  clearDismissedAt,
  getDismissedAt,
  getReviewDestination,
  hasShownThisSession,
  isCooldownActive,
  markShownThisSession,
  setDismissedAt,
} from './askForReview';

const ORIGINAL_USER_AGENT = window.navigator.userAgent;
const ORIGINAL_VENDOR = window.navigator.vendor;

const setUserAgent = (userAgent: string, vendor = ''): void => {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'vendor', {
    value: vendor,
    configurable: true,
  });
};

const restoreNavigator = (): void => {
  setUserAgent(ORIGINAL_USER_AGENT, ORIGINAL_VENDOR);
};

describe('getReviewDestination (webapp)', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    restoreNavigator();
  });

  it('routes iPhone Safari to App Store', () => {
    setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    );
    expect(getReviewDestination()?.id).toBe('app_store');
  });

  it('routes Android Chrome to Play Store', () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      'Google Inc.',
    );
    expect(getReviewDestination()?.id).toBe('play_store');
  });

  it('routes desktop Chrome to Chrome Web Store', () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Google Inc.',
    );
    expect(getReviewDestination()?.id).toBe('chrome_web_store');
  });

  it('routes Edge to Edge Add-ons', () => {
    setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
    );
    expect(getReviewDestination()?.id).toBe('edge_addons');
  });

  it('falls back to X share for Firefox desktop', () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0',
    );
    expect(getReviewDestination()?.id).toBe('twitter_share');
  });

  it('falls back to X share for Safari desktop', () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    );
    expect(getReviewDestination()?.id).toBe('twitter_share');
  });
});

describe('dismissed-at cooldown', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns null when no timestamp stored', () => {
    expect(getDismissedAt()).toBeNull();
    expect(isCooldownActive(14)).toBe(false);
  });

  it('round-trips a dismissal timestamp', () => {
    setDismissedAt(1_700_000_000_000);
    expect(getDismissedAt()).toBe(1_700_000_000_000);
    expect(window.localStorage.getItem(ASK_FOR_REVIEW_DISMISSED_KEY)).toBe(
      '1700000000000',
    );
  });

  it('treats the cooldown as active inside the window', () => {
    const now = Date.now();
    setDismissedAt(now - 1000);
    expect(isCooldownActive(14, now)).toBe(true);
  });

  it('treats the cooldown as expired after the window', () => {
    const now = Date.now();
    const fifteenDays = 15 * 24 * 60 * 60 * 1000;
    setDismissedAt(now - fifteenDays);
    expect(isCooldownActive(14, now)).toBe(false);
  });

  it('ignores invalid timestamps', () => {
    window.localStorage.setItem(ASK_FOR_REVIEW_DISMISSED_KEY, 'not-a-number');
    expect(getDismissedAt()).toBeNull();
  });

  it('clears the stored timestamp', () => {
    setDismissedAt();
    clearDismissedAt();
    expect(getDismissedAt()).toBeNull();
  });
});

describe('session shown flag', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('starts unset', () => {
    expect(hasShownThisSession()).toBe(false);
  });

  it('marks itself shown until session storage is cleared', () => {
    markShownThisSession();
    expect(hasShownThisSession()).toBe(true);
    expect(window.sessionStorage.getItem(ASK_FOR_REVIEW_SESSION_KEY)).toBe('1');
  });
});
