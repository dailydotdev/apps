import { looksLikeMarkdown } from './markdown';

describe('markdown helpers', () => {
  it('should detect common markdown syntax', () => {
    const cases = [
      '# Heading',
      '- Bullet item',
      '1. Ordered item',
      '[daily.dev](https://daily.dev)',
      '![alt](https://example.com/image.png)',
      '`inline`',
      '```js\nconst a = 1;\n```',
      '**bold**',
    ];

    cases.forEach((value) => {
      expect(looksLikeMarkdown(value)).toBe(true);
    });
  });

  it('should ignore plain text', () => {
    expect(looksLikeMarkdown('just a regular sentence')).toBe(false);
  });
});
