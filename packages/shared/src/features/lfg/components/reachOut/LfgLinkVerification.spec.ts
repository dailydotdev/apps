import { isHttpUrl, isOwnGithubRepo } from './LfgLinkVerification';

describe('isOwnGithubRepo', () => {
  it("matches a repo on the sender's connected GitHub, whatever the casing", () => {
    expect(isOwnGithubRepo('https://github.com/Ada/engine', 'ada')).toBe(true);
    expect(
      isOwnGithubRepo('https://www.github.com/ada/engine/tree/main', 'ada'),
    ).toBe(true);
  });

  it.each([
    ['without a connected GitHub', 'https://github.com/ada/engine', null],
    ["someone else's repo", 'https://github.com/grace/compiler', 'ada'],
    ['a profile, not a repo', 'https://github.com/ada', 'ada'],
    ['another host', 'https://gitlab.com/ada/engine', 'ada'],
    ['a look-alike host', 'https://github.com.evil.dev/ada/engine', 'ada'],
    ['text', 'my repo', 'ada'],
  ])('rejects %s', (_, url, github) => {
    expect(isOwnGithubRepo(url, github)).toBe(false);
  });
});

describe('isHttpUrl', () => {
  it('accepts web links only', () => {
    expect(isHttpUrl('https://daily.dev')).toBe(true);
    expect(isHttpUrl('http://localhost:3000/x')).toBe(true);
    expect(isHttpUrl('ftp://daily.dev/file')).toBe(false);
    expect(isHttpUrl('daily.dev')).toBe(false);
  });
});
