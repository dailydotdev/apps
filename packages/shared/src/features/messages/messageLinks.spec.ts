import { findPostIdInText, getPostIdFromUrl, splitLinks } from './messageLinks';

describe('splitLinks', () => {
  it('returns plain text untouched', () => {
    expect(splitLinks('no links here')).toEqual([
      { type: 'text', text: 'no links here' },
    ]);
  });

  it('pulls links out of the text', () => {
    expect(splitLinks('read https://daily.dev/blog and http://x.dev')).toEqual([
      { type: 'text', text: 'read ' },
      { type: 'link', url: 'https://daily.dev/blog' },
      { type: 'text', text: ' and ' },
      { type: 'link', url: 'http://x.dev' },
    ]);
  });

  it('leaves trailing punctuation and wrapping parentheses out', () => {
    expect(splitLinks('see (https://x.dev/a).')).toEqual([
      { type: 'text', text: 'see (' },
      { type: 'link', url: 'https://x.dev/a' },
      { type: 'text', text: ').' },
    ]);
  });

  it('keeps parentheses that belong to the URL', () => {
    expect(splitLinks('https://en.wikipedia.org/wiki/Rust_(language)')).toEqual(
      [
        {
          type: 'link',
          url: 'https://en.wikipedia.org/wiki/Rust_(language)',
        },
      ],
    );
  });

  it('ignores schemes other than http(s)', () => {
    // eslint-disable-next-line no-script-url
    expect(splitLinks('javascript:alert(1)')).toEqual([
      // eslint-disable-next-line no-script-url
      { type: 'text', text: 'javascript:alert(1)' },
    ]);
  });
});

describe('getPostIdFromUrl', () => {
  const host = 'app.daily.dev';

  it.each([
    ['https://app.daily.dev/posts/abc123', 'abc123'],
    [
      'https://app.daily.dev/posts/why-rust-wins-abc123/',
      'why-rust-wins-abc123',
    ],
    ['https://app.daily.dev/posts/abc123?ref=share', 'abc123'],
  ])('finds the post in %s', (url, id) => {
    expect(getPostIdFromUrl(url, host)).toBe(id);
  });

  it.each([
    'https://app.daily.dev/posts/latest',
    'https://app.daily.dev/posts/abc123/edit',
    'https://app.daily.dev/squads/abc',
    'https://evil.example/posts/abc123',
    'https://app.daily.dev.evil.example/posts/abc123',
    'not a url',
  ])('ignores %s', (url) => {
    expect(getPostIdFromUrl(url, host)).toBeUndefined();
  });
});

describe('findPostIdInText', () => {
  it('returns the first post link in the text', () => {
    expect(
      findPostIdInText(
        'look https://x.dev then https://app.daily.dev/posts/one and https://app.daily.dev/posts/two',
        'app.daily.dev',
      ),
    ).toBe('one');
  });
});
