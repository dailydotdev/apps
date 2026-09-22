import {
  detectPlatformFromUrl,
  ORG_PLATFORMS,
  USER_PLATFORMS,
} from './platforms';

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

  it('should detect substack.com as substack, not mastodon', () => {
    expect(
      detectPlatformFromUrl('https://substack.com/@devnp2007', USER_PLATFORMS),
    ).toBe('substack');
    expect(
      detectPlatformFromUrl('https://www.substack.com/@user', USER_PLATFORMS),
    ).toBe('substack');
  });

  it('should detect discord profile and invite URLs', () => {
    expect(
      detectPlatformFromUrl(
        'https://discord.com/users/123456789012345678',
        USER_PLATFORMS,
      ),
    ).toBe('discord');
    expect(
      detectPlatformFromUrl('https://discord.gg/inviteCode', USER_PLATFORMS),
    ).toBe('discord');
    expect(
      detectPlatformFromUrl(
        'https://discordapp.com/users/123456789012345678',
        USER_PLATFORMS,
      ),
    ).toBe('discord');
  });

  it('should detect exact domains and subdomains only', () => {
    expect(detectPlatformFromUrl('https://x.com/handle', USER_PLATFORMS)).toBe(
      'twitter',
    );
    expect(
      detectPlatformFromUrl('https://www.x.com/handle', USER_PLATFORMS),
    ).toBe('twitter');
    expect(detectPlatformFromUrl('https://dev.to/user', ORG_PLATFORMS)).toBe(
      'devto',
    );
    expect(
      detectPlatformFromUrl('https://m.youtube.com/@channel', USER_PLATFORMS),
    ).toBe('youtube');
    expect(
      detectPlatformFromUrl('https://youtu.be/video123', USER_PLATFORMS),
    ).toBe('youtube');
    expect(
      detectPlatformFromUrl('https://blog.hashnode.dev/post', USER_PLATFORMS),
    ).toBe('hashnode');
  });

  it.each([
    ['https://dabworx.com', USER_PLATFORMS],
    ['https://netflix.com', USER_PLATFORMS],
    ['https://linux.com', USER_PLATFORMS],
    ['https://mygithub.com', USER_PLATFORMS],
    ['https://dev.tools', ORG_PLATFORMS],
    ['https://github.com.attacker.example/foo', USER_PLATFORMS],
  ])('should not detect platform domains inside %s', (url, platforms) => {
    expect(detectPlatformFromUrl(url, platforms)).toBeNull();
  });

  it('should not match invalid raw input by substring after URL parsing fails', () => {
    expect(detectPlatformFromUrl('x.com bad', USER_PLATFORMS)).toBeNull();
  });

  it('should detect Mastodon instances whose hostnames contain a known domain substring', () => {
    expect(
      detectPlatformFromUrl('https://socialx.com/@user', {
        mastodon: USER_PLATFORMS.mastodon,
      }),
    ).toBe('mastodon');
  });

  it('should return null for unknown URLs', () => {
    expect(
      detectPlatformFromUrl('https://example.com/profile', USER_PLATFORMS),
    ).toBeNull();
  });
});
