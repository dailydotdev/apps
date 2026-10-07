import {
  getMessagePreview,
  isTrustedImageUrl,
  parseMessageBody,
  toImageMarkdown,
} from './media';

const upload = 'https://media.daily.dev/image/upload/s--abc--/content_1';
const gif = 'https://static.klipy.com/ii/abc/dance.gif';

describe('isTrustedImageUrl', () => {
  it('accepts our CDN and the GIF providers, including subdomains', () => {
    expect(isTrustedImageUrl(upload)).toBe(true);
    expect(isTrustedImageUrl(gif)).toBe(true);
    expect(isTrustedImageUrl('https://media2.giphy.com/a.gif')).toBe(true);
  });

  it('rejects other hosts, lookalikes and plain http', () => {
    expect(isTrustedImageUrl('https://evil.com/pixel.png')).toBe(false);
    expect(isTrustedImageUrl('https://evilklipy.com/a.gif')).toBe(false);
    expect(isTrustedImageUrl('https://media.daily.dev.evil.com/a')).toBe(false);
    expect(isTrustedImageUrl('https://res.cloudinary.com/other/a.png')).toBe(
      false,
    );
    expect(isTrustedImageUrl('not a url')).toBe(false);
  });
});

describe('parseMessageBody', () => {
  it('keeps a plain message as a single text part', () => {
    expect(parseMessageBody('hey there')).toEqual([
      { type: 'text', text: 'hey there' },
    ]);
  });

  it('splits text and trusted images in order', () => {
    expect(
      parseMessageBody(`look\n\n${toImageMarkdown(upload, 'shot')}`),
    ).toEqual([
      { type: 'text', text: 'look' },
      { type: 'image', url: upload, alt: 'shot', isGif: false },
    ]);
  });

  it('marks provider images as GIFs', () => {
    expect(parseMessageBody(toImageMarkdown(gif, 'GIF'))).toEqual([
      { type: 'image', url: gif, alt: 'GIF', isGif: true },
    ]);
  });

  it('leaves untrusted images as text', () => {
    const body = '![x](https://evil.com/pixel.png)';

    expect(parseMessageBody(body)).toEqual([{ type: 'text', text: body }]);
  });
});

describe('getMessagePreview', () => {
  it('summarises media instead of showing markdown', () => {
    expect(getMessagePreview(toImageMarkdown(gif, 'GIF'))).toBe('GIF');
    expect(getMessagePreview(`look\n\n${toImageMarkdown(upload, 'a')}`)).toBe(
      'look Image',
    );
  });
});

describe('toImageMarkdown', () => {
  it('strips characters that would break the markdown', () => {
    expect(toImageMarkdown(upload, 'a]b[c\nd')).toBe(`![a b c d](${upload})`);
  });
});
