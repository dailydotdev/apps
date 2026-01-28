import { detectPlatformFromUrl, USER_PLATFORMS } from './platforms';

describe('detectPlatformFromUrl', () => {
  it('should detect medium.com as medium, not mastodon', () => {
    expect(
      detectPlatformFromUrl('https://medium.com/@user', USER_PLATFORMS),
    ).toBe('medium');
  });

  it('should detect known mastodon instances', () => {
    expect(
      detectPlatformFromUrl('https://mastodon.social/@user', USER_PLATFORMS),
    ).toBe('mastodon');
    expect(
      detectPlatformFromUrl('https://hachyderm.io/@user', USER_PLATFORMS),
    ).toBe('mastodon');
  });

  it('should detect unknown mastodon instances by /@ pattern', () => {
    expect(
      detectPlatformFromUrl(
        'https://unknown-mastodon.xyz/@user',
        USER_PLATFORMS,
      ),
    ).toBe('mastodon');
  });

  it('should return null for unknown URLs', () => {
    expect(
      detectPlatformFromUrl('https://example.com/profile', USER_PLATFORMS),
    ).toBeNull();
  });
});
