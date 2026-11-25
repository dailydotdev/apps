import { getPatchyContext, getPatchyContextLine } from './patchyContext';

const at = (path: string, query = {}, post = null) =>
  getPatchyContext({ path, query, post });

describe('getPatchyContext', () => {
  it('reads the page you are on', () => {
    expect(at('/')).toEqual({ kind: 'forYou' });
    expect(at('/my-feed')).toEqual({ kind: 'forYou' });
    expect(at('/popular')).toEqual({ kind: 'feed' });
    expect(at('/posts/best-of')).toEqual({ kind: 'feed' });
    expect(at('/tags/Rust')).toEqual({ kind: 'tag', tag: 'rust' });
    expect(at('/tags/rust/best-of')).toEqual({ kind: 'tag', tag: 'rust' });
    expect(at('/sources/daily_updates')).toEqual({
      kind: 'source',
      source: 'daily_updates',
    });
    expect(at('/bookmarks/later')).toEqual({ kind: 'bookmarks' });
    expect(at('/search/posts', { q: ' kafka ' })).toEqual({
      kind: 'search',
      query: 'kafka',
    });
    expect(at('/settings/appearance')).toEqual({ kind: 'other' });
  });

  it('lets an open post win over the page under it', () => {
    const post = { id: 'p1', title: 'Lifetimes', tags: ['rust', 'cli'] };
    expect(getPatchyContext({ path: '/tags/go', query: {}, post })).toEqual({
      kind: 'post',
      post,
      tag: 'rust',
    });
  });

  it('writes a short line for the panel', () => {
    expect(getPatchyContextLine({ kind: 'tag', tag: 'rust' })).toBe(
      'Looking at #rust.',
    );
    expect(getPatchyContextLine({ kind: 'search', query: 'kafka' })).toBe(
      'Looking for “kafka”?',
    );
    expect(getPatchyContextLine({ kind: 'other' })).toBeNull();
  });
});
