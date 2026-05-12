import {
  buildExtensionSiteEmbedFrameSrc,
  getExtensionSiteEmbedErrorMessage,
  isDailyDevEmbedAncestor,
  isEmbeddableSiteTarget,
} from './common';

describe('extension embed helpers', () => {
  it('builds the extension frame URL with the parent origin', () => {
    expect(
      buildExtensionSiteEmbedFrameSrc({
        extensionId: 'abc123',
        targetUrl: 'https://daily.dev',
        parentOrigin: 'https://app.daily.dev',
      }),
    ).toBe(
      'chrome-extension://abc123/frame.html?target=https%3A%2F%2Fdaily.dev&parentOrigin=https%3A%2F%2Fapp.daily.dev',
    );
  });

  it('only allows http and https targets', () => {
    expect(isEmbeddableSiteTarget('https://daily.dev')).toBe(true);
    expect(isEmbeddableSiteTarget('http://localhost:5002')).toBe(true);
    expect(isEmbeddableSiteTarget('chrome-extension://abc123/frame.html')).toBe(
      false,
    );
    expect(isEmbeddableSiteTarget('ftp://example.com')).toBe(false);
  });

  it('recognizes daily.dev surfaces as embed ancestors', () => {
    expect(isDailyDevEmbedAncestor('https://daily.dev')).toBe(true);
    expect(isDailyDevEmbedAncestor('https://app.daily.dev')).toBe(true);
    expect(isDailyDevEmbedAncestor('https://staging.daily.dev')).toBe(true);
    expect(isDailyDevEmbedAncestor('https://preview-1.local.fylla.dev')).toBe(
      true,
    );
    expect(
      isDailyDevEmbedAncestor('https://preview-1.local.fylla.dev:5002'),
    ).toBe(true);
    expect(isDailyDevEmbedAncestor('http://localhost:5002')).toBe(true);
    expect(isDailyDevEmbedAncestor('https://localhost:5002')).toBe(true);
    expect(isDailyDevEmbedAncestor('chrome-extension://daily.dev')).toBe(false);
    expect(isDailyDevEmbedAncestor('chrome-extension://localhost')).toBe(false);
    expect(isDailyDevEmbedAncestor('https://daily.dev.evil.com')).toBe(false);
    expect(isDailyDevEmbedAncestor('https://www.php.net')).toBe(false);
    expect(isDailyDevEmbedAncestor('')).toBe(false);
  });

  it('prefers explicit error text when formatting failures', () => {
    expect(
      getExtensionSiteEmbedErrorMessage({
        reason: 'enable-frame-embedding-failed',
        error: 'updateSessionRules failed',
      }),
    ).toBe('updateSessionRules failed');
  });
});
