import { findFirstHighlightedKeyword } from './brand';

describe('findFirstHighlightedKeyword', () => {
  it('returns null for empty keywords', () => {
    expect(findFirstHighlightedKeyword('hello world', [])).toBeNull();
    expect(findFirstHighlightedKeyword('hello world', undefined)).toBeNull();
  });

  it('returns null for empty text', () => {
    expect(findFirstHighlightedKeyword('', ['hello'])).toBeNull();
  });

  it('returns null when nothing matches', () => {
    expect(findFirstHighlightedKeyword('hello world', ['foo'])).toBeNull();
  });

  it('matches a single keyword case-insensitively', () => {
    const match = findFirstHighlightedKeyword('Hello World', ['hello']);
    expect(match).toEqual({ keyword: 'Hello', start: 0, end: 5 });
  });

  it('preserves the original casing of the matched slice', () => {
    const match = findFirstHighlightedKeyword('Learn AI with us', ['ai']);
    expect(match?.keyword).toBe('AI');
  });

  it('respects word boundaries', () => {
    // "airport" should not match keyword "ai"
    expect(findFirstHighlightedKeyword('airport news', ['ai'])).toBeNull();
  });

  it('returns the earliest match by position, not by keyword order', () => {
    const match = findFirstHighlightedKeyword('foo bar baz', ['baz', 'bar']);
    expect(match).toEqual({ keyword: 'bar', start: 4, end: 7 });
  });

  it('escapes regex metacharacters in keywords', () => {
    // `.` in `node.js` is a regex wildcard if unescaped; the match must be literal.
    const match = findFirstHighlightedKeyword('I love node.js here', [
      'node.js',
    ]);
    expect(match).toEqual({ keyword: 'node.js', start: 7, end: 14 });
  });
});
