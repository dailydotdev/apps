import { roundRobinMerge } from './roundRobinMerge';

describe('roundRobinMerge', () => {
  it('returns an empty array for no streams', () => {
    expect(roundRobinMerge([])).toEqual([]);
  });

  it('returns the single stream verbatim when only one is supplied', () => {
    expect(roundRobinMerge([['a', 'b', 'c']])).toEqual(['a', 'b', 'c']);
  });

  it('interleaves equal-length streams in round-robin order', () => {
    expect(
      roundRobinMerge([
        ['a1', 'a2'],
        ['b1', 'b2'],
        ['c1', 'c2'],
      ]),
    ).toEqual(['a1', 'b1', 'c1', 'a2', 'b2', 'c2']);
  });

  it('keeps interleaving past the shorter streams', () => {
    expect(roundRobinMerge([['a1', 'a2', 'a3'], ['b1']])).toEqual([
      'a1',
      'b1',
      'a2',
      'a3',
    ]);
  });

  it('drops duplicates on first occurrence, preserving round-robin ordering', () => {
    expect(
      roundRobinMerge([
        ['react', 'typescript'],
        ['typescript', 'node'],
      ]),
    ).toEqual(['react', 'typescript', 'node']);
  });
});
