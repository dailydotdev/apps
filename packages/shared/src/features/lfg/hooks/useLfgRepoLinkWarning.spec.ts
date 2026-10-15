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

  it('catches gists, raw files and archive downloads', () => {
    [
      'https://gist.github.com/acme/1',
      'https://raw.githubusercontent.com/acme/tool/main/install.sh',
      'https://codeload.github.com/acme/tool/zip/main',
    ].forEach((href) => expect(getRepoLink(linkTo(href))).toBe(href));
  });

  it('lets other links through', () => {
    expect(getRepoLink(linkTo('https://github.com.evil.dev/x'))).toBe(
      undefined,
    );
    expect(getRepoLink(linkTo('https://daily.dev/posts/1'))).toBe(undefined);
    expect(getRepoLink(document.createElement('span'))).toBe(undefined);
  });
});
