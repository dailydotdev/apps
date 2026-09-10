import type { HighlightRange } from './snapshotText';
import { findHighlightRange, windowAroundHighlight } from './snapshotText';

const marked = 'the marked run';
/** The range of a run the test just placed in its passage. */
const rangeOf = (passage: string, run: string): HighlightRange =>
  findHighlightRange(passage, run) as HighlightRange;

const filler = (word: string, count: number) =>
  Array(count).fill(word).join(' ');

describe('findHighlightRange', () => {
  it('locates the marked run inside its passage', () => {
    expect(findHighlightRange(`lead ${marked} trail`, marked)).toEqual({
      start: 5,
      end: 5 + marked.length,
    });
  });

  it('returns nothing when the run is not in the passage', () => {
    expect(findHighlightRange('lead trail', marked)).toBeUndefined();
  });
});

describe('windowAroundHighlight', () => {
  it('keeps a short passage whole', () => {
    const passage = `lead ${marked} trail`;
    const highlight = rangeOf(passage, marked);

    expect(windowAroundHighlight(passage, highlight)).toEqual({
      text: passage,
      highlight,
    });
  });

  it('centres the window on a run near the end of a long passage', () => {
    const passage = `${filler('before', 200)} ${marked} tail`;
    const windowed = windowAroundHighlight(passage, rangeOf(passage, marked));

    expect(
      windowed.text.slice(windowed.highlight.start, windowed.highlight.end),
    ).toBe(marked);
    expect(windowed.text.startsWith('…')).toBe(true);
    expect(windowed.text.endsWith('tail')).toBe(true);
  });

  it('gives the trailing side the slack a leading edge does not use', () => {
    const passage = `${marked} ${filler('after', 200)}`;
    const windowed = windowAroundHighlight(passage, rangeOf(passage, marked));

    expect(windowed.highlight).toEqual({ start: 0, end: marked.length });
    expect(windowed.text.endsWith('…')).toBe(true);
  });

  it('truncates a run with no room for context, marking all of it', () => {
    const long = filler('word', 200);
    const windowed = windowAroundHighlight(long, {
      start: 0,
      end: long.length,
    });

    expect(windowed.text.endsWith('…')).toBe(true);
    expect(windowed.highlight).toEqual({
      start: 0,
      end: windowed.text.length,
    });
  });
});
