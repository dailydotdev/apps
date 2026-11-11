import { getPlainTextFromRichContent, stripEmojis } from './strings';

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

describe('stripEmojis', () => {
  it('removes single, joined, skin-toned, flag and keycap emojis', () => {
    expect(stripEmojis("🏆 Weekly Wins #45: What's your win this week?")).toBe(
      "Weekly Wins #45: What's your win this week?",
    );
    expect(stripEmojis('Dev 👩🏽‍💻 life 🏳️‍🌈 🇺🇸 and 🏴󠁧󠁢󠁳󠁣󠁴󠁿')).toBe('Dev life and ');
    expect(stripEmojis('Top 5️⃣ tips, I❤️JS')).toBe('Top 5 tips, IJS');
  });

  it('keeps regular text, digits, punctuation and non-latin scripts', () => {
    const text = 'C# 12 & .NET 8: 速い — क्‍ष, naïve #1 (50%)';
    expect(stripEmojis(text)).toBe(text);
  });
});
