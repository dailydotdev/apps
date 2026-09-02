import { acceptsMarkdown } from '../lib/contentNegotiation';

describe('acceptsMarkdown', () => {
  it('returns false without an Accept header', () => {
    expect(acceptsMarkdown(undefined)).toBe(false);
    expect(acceptsMarkdown(null)).toBe(false);
    expect(acceptsMarkdown('')).toBe(false);
  });

  it('ignores the wildcards browsers and curl send', () => {
    expect(acceptsMarkdown('*/*')).toBe(false);
    expect(acceptsMarkdown('text/*')).toBe(false);
    expect(
      acceptsMarkdown(
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      ),
    ).toBe(false);
  });

  it('matches an explicit markdown request', () => {
    expect(acceptsMarkdown('text/markdown')).toBe(true);
    expect(acceptsMarkdown('text/x-markdown')).toBe(true);
    expect(acceptsMarkdown('TEXT/MARKDOWN')).toBe(true);
    expect(acceptsMarkdown('text/markdown; charset=utf-8')).toBe(true);
  });

  it('respects quality ordering against html', () => {
    expect(acceptsMarkdown('text/markdown, text/html;q=0.9')).toBe(true);
    expect(acceptsMarkdown('text/markdown;q=0.5, text/html;q=0.9')).toBe(false);
    expect(acceptsMarkdown('text/markdown;q=0.9, text/html;q=0.9')).toBe(true);
    expect(acceptsMarkdown('text/markdown;q=0, text/html')).toBe(false);
  });

  it('matches markdown alongside a wildcard fallback', () => {
    expect(acceptsMarkdown('text/markdown, */*;q=0.1')).toBe(true);
  });
});
