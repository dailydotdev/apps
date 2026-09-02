import { getPlainTextFromRichContent } from './strings';

describe('getPlainTextFromRichContent', () => {
  it('prefers html content when available', () => {
    expect(
      getPlainTextFromRichContent({
        html: '<p>Review <a href="https://daily.dev">launch notes</a></p>',
        markdown: 'Review [old notes](https://example.com)',
      }),
    ).toBe('Review launch notes');
  });

  it('converts markdown links into plain text labels', () => {
    expect(
      getPlainTextFromRichContent({
        markdown: 'Read the [docs](https://docs.daily.dev) today.',
      }),
    ).toBe('Read the docs today.');
  });

  it('keeps plain text markdown fallbacks intact', () => {
    expect(
      getPlainTextFromRichContent({
        markdown: 'No formatting here',
      }),
    ).toBe('No formatting here');
  });
});
