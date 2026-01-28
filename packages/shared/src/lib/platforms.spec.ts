import {
  detectPlatformFromUrl,
  CORE_PLATFORMS,
  USER_PLATFORMS,
  ORG_PLATFORMS,
} from './platforms';

describe('detectPlatformFromUrl', () => {
  describe('with USER_PLATFORMS', () => {
    it('should detect medium.com as medium', () => {
      expect(
        detectPlatformFromUrl('https://medium.com/@user', USER_PLATFORMS),
      ).toBe('medium');
      expect(
        detectPlatformFromUrl('https://medium.com/@redvelvetx', USER_PLATFORMS),
      ).toBe('medium');
      expect(
        detectPlatformFromUrl(
          'https://www.medium.com/@testuser',
          USER_PLATFORMS,
        ),
      ).toBe('medium');
    });

    it('should NOT detect medium.com as mastodon', () => {
      const result = detectPlatformFromUrl(
        'https://medium.com/@redvelvetx',
        USER_PLATFORMS,
      );
      expect(result).toBe('medium');
      expect(result).not.toBe('mastodon');
    });

    it('should detect mastodon.social as mastodon', () => {
      expect(
        detectPlatformFromUrl('https://mastodon.social/@user', USER_PLATFORMS),
      ).toBe('mastodon');
    });

    it('should detect hachyderm.io as mastodon', () => {
      expect(
        detectPlatformFromUrl('https://hachyderm.io/@user', USER_PLATFORMS),
      ).toBe('mastodon');
    });

    it('should detect unknown mastodon instances as mastodon', () => {
      expect(
        detectPlatformFromUrl(
          'https://unknown-mastodon.xyz/@user',
          USER_PLATFORMS,
        ),
      ).toBe('mastodon');
    });

    it('should detect threads.net as threads', () => {
      expect(
        detectPlatformFromUrl('https://threads.net/@user', USER_PLATFORMS),
      ).toBe('threads');
    });

    it('should detect github.com as github', () => {
      expect(
        detectPlatformFromUrl('https://github.com/user', USER_PLATFORMS),
      ).toBe('github');
    });

    it('should return null for unknown domains without /@ pattern', () => {
      expect(
        detectPlatformFromUrl('https://example.com/profile', USER_PLATFORMS),
      ).toBeNull();
    });
  });

  describe('with ORG_PLATFORMS', () => {
    it('should detect medium.com as medium', () => {
      expect(
        detectPlatformFromUrl('https://medium.com/@company', ORG_PLATFORMS),
      ).toBe('medium');
    });

    it('should detect mastodon instances', () => {
      expect(
        detectPlatformFromUrl('https://mastodon.social/@org', ORG_PLATFORMS),
      ).toBe('mastodon');
    });
  });
});

describe('CORE_PLATFORMS', () => {
  it('should include medium platform', () => {
    expect(CORE_PLATFORMS.medium).toBeDefined();
    expect(CORE_PLATFORMS.medium.id).toBe('medium');
    expect(CORE_PLATFORMS.medium.domains).toContain('medium.com');
  });

  it('should have urlBuilder for medium', () => {
    expect(CORE_PLATFORMS.medium.urlBuilder).toBeDefined();
    expect(CORE_PLATFORMS.medium.urlBuilder?.('testuser')).toBe(
      'https://medium.com/@testuser',
    );
  });
});
