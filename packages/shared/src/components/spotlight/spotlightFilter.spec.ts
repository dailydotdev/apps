import {
  scoreActionMatch,
  spotlightCommandFilter,
  SPOTLIGHT_PASSTHROUGH_KEYWORD,
} from './spotlightFilter';

describe('scoreActionMatch', () => {
  it('returns 1 for an empty query (every row visible while idle)', () => {
    expect(scoreActionMatch('go to bookmarks saved', '')).toBe(1);
  });

  it('scores a full prefix match the highest', () => {
    expect(scoreActionMatch('go to bookmarks', 'go')).toBe(1);
  });

  it('scores a word-prefix match below a full prefix', () => {
    expect(scoreActionMatch('go to bookmarks saved', 'book')).toBe(0.9);
  });

  it('scores a substring match below a word-prefix', () => {
    expect(scoreActionMatch('switch to list layout', 'ist')).toBe(0.7);
  });

  it('matches multi-word queries when every token is a substring', () => {
    expect(scoreActionMatch('go to settings preferences account', 'set acc'))
      .toBeGreaterThan(0);
  });

  it('rejects fuzzy false-positives that the cmdk default would accept', () => {
    expect(scoreActionMatch('go to history reading history visited', 'react'))
      .toBe(0);
    expect(scoreActionMatch('switch to list layout view density', 'react'))
      .toBe(0);
    expect(scoreActionMatch('open profile details settings preferences', 'react'))
      .toBe(0);
  });

  it('still matches a real "react" query against a real "react" target', () => {
    expect(scoreActionMatch('react typescript javascript', 'react')).toBe(1);
  });
});

describe('spotlightCommandFilter', () => {
  it('lets passthrough rows (entity hits) through unconditionally', () => {
    expect(
      spotlightCommandFilter(
        'tomer aberbach @tomer',
        'react',
        [SPOTLIGHT_PASSTHROUGH_KEYWORD],
      ),
    ).toBe(1);
  });

  it('still applies strict matching to non-passthrough rows', () => {
    expect(
      spotlightCommandFilter('go to history reading history', 'react'),
    ).toBe(0);
    expect(
      spotlightCommandFilter('go to bookmarks saved', 'book'),
    ).toBeGreaterThan(0);
  });
});
