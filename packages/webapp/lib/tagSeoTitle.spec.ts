import { getPageSeoTitles } from '../components/layouts/utils';
import { getTagSeoTitle } from './tagSeoTitle';

describe('getTagSeoTitle', () => {
  it('should use the news and updates template by default', () => {
    expect(getTagSeoTitle('javascript', 'JavaScript')).toEqual(
      'JavaScript News & Updates',
    );
  });

  it('should scope company tags to developer news', () => {
    expect(getTagSeoTitle('google', 'Google')).toEqual(
      'Google Developer News & Updates',
    );
    expect(getTagSeoTitle('nvidia', 'NVIDIA')).toEqual(
      'NVIDIA Developer News & Updates',
    );
  });

  it('should apply variant rules to a mixed case route param', () => {
    expect(getTagSeoTitle('Google', 'Google')).toEqual(
      'Google Developer News & Updates',
    );
    expect(getTagSeoTitle('Tech-News', 'Tech News')).toEqual(
      'Tech News: Latest Technology Updates',
    );
  });

  it('should use a hand-set title for tech-news', () => {
    expect(getTagSeoTitle('tech-news', 'Tech News')).toEqual(
      'Tech News: Latest Technology Updates',
    );
  });

  it('should not repeat news when the tag name already contains it', () => {
    expect(getTagSeoTitle('ai-news', 'AI News')).toEqual(
      'AI News: Latest Updates & Discussions',
    );
  });

  it('should keep the daily.dev suffix for the longest tag names', () => {
    const longestTitles = [
      getTagSeoTitle(
        'internal-developer-platform',
        'Internal Developer Platform',
      ),
      getTagSeoTitle('anthropic', 'Anthropic'),
      getTagSeoTitle('tech-news', 'Tech News'),
      getTagSeoTitle('ai-news', 'AI News'),
    ];

    longestTitles.forEach((title) => {
      expect(getPageSeoTitles(title).title).toEqual(`${title} | daily.dev`);
    });
  });
});
