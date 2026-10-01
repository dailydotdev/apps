import { getDisplayUrl, getSquadLinkMeta, isValidSquadLink } from './links';

describe('squad links', () => {
  it.each([
    ['https://github.com/coderabbitai', 'GitHub', 'coderabbitai'],
    ['https://x.com/coderabbitai/', 'X', 'coderabbitai'],
    ['https://www.linkedin.com/company/coderabbit', 'LinkedIn', 'coderabbit'],
    ['https://discord.gg', 'Discord', 'Discord'],
    [
      'https://docs.coderabbit.ai/guides',
      'docs.coderabbit.ai',
      'docs.coderabbit.ai/guides',
    ],
  ])('labels %s', (url, name, label) => {
    expect(getSquadLinkMeta(url)).toMatchObject({ name, label });
  });

  it('only accepts http and https addresses', () => {
    expect(isValidSquadLink('https://daily.dev')).toBe(true);
    expect(isValidSquadLink('http://daily.dev')).toBe(true);
    expect(isValidSquadLink('ftp://daily.dev/file')).toBe(false);
    expect(isValidSquadLink('daily.dev')).toBe(false);
  });

  it('shows a bare domain for the website', () => {
    expect(getDisplayUrl('https://www.coderabbit.ai/')).toBe('coderabbit.ai');
  });
});
