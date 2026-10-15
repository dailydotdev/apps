import { getRepoLink } from './useLfgRepoLinkWarning';

const linkTo = (href: string): Element => {
  const anchor = document.createElement('a');
  anchor.setAttribute('href', href);
  const label = document.createElement('span');
  anchor.append(label);
  return label;
};

describe('getRepoLink', () => {
  it('catches GitHub and GitLab links, from anywhere inside the anchor', () => {
    expect(getRepoLink(linkTo('https://github.com/acme/tool'))).toBe(
      'https://github.com/acme/tool',
    );
    expect(getRepoLink(linkTo('https://www.gitlab.com/acme/tool'))).toBe(
      'https://www.gitlab.com/acme/tool',
    );
  });

  it('lets other links through', () => {
    expect(getRepoLink(linkTo('https://github.com.evil.dev/x'))).toBe(
      undefined,
    );
    expect(getRepoLink(linkTo('https://daily.dev/posts/1'))).toBe(undefined);
    expect(getRepoLink(document.createElement('span'))).toBe(undefined);
  });
});
