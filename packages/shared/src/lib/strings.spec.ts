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
        markdown:
          'Bring questions about [standups](https://daily.dev/standups) today.',
      }),
    ).toBe('Bring questions about standups today.');
  });

  it('keeps plain text markdown fallbacks intact', () => {
    expect(
      getPlainTextFromRichContent({
        markdown: 'No formatting here',
      }),
    ).toBe('No formatting here');
  });
});
