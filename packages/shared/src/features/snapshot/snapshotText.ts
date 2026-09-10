/**
 * A shared quote reads as one thought, and 280 characters still sets legibly
 * inside the square. Longer selections are cut rather than refused: the reader
 * gets the opening of what was marked, and the link carries the rest.
 */
export const SNAPSHOT_TEXT_LIMIT = 280;

/**
 * The frame grows to fit, so the ceiling on a shared passage is about
 * legibility at 1080 wide rather than about the square.
 */
export const SNAPSHOT_PASSAGE_LIMIT = 900;

/**
 * One size for the copy on the post and highlight cards, not a scale. Those
 * frames grow to fit now, so type no longer has to shrink to reach the bottom
 * of a fixed square — and a shared image that changes size with its length
 * reads as two different cards.
 */
export const SNAPSHOT_COPY_SIZE = 38;

export function truncateAtWord(
  text: string,
  limit = SNAPSHOT_TEXT_LIMIT,
): string {
  const trimmed = text.trim();

  if (trimmed.length <= limit) {
    return trimmed;
  }

  const cut = trimmed.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');

  // A single unbroken run longer than the limit has no word to fall back to.
  return `${(lastSpace > limit * 0.6
    ? cut.slice(0, lastSpace)
    : cut
  ).trimEnd()}…`;
}

export interface HighlightRange {
  start: number;
  end: number;
}

/**
 * Folds every run of whitespace to one space. A block's `textContent` keeps
 * the source's line breaks — markdown soft breaks arrive as a literal `\n`
 * inside the paragraph — while the browser's selection string renders them as
 * the space they display as, so the two only line up once both are folded.
 * The card sets its copy with `white-space: normal`, so folding the passage
 * itself changes nothing that is drawn.
 */
export const collapseWhitespace = (text: string): string =>
  text.replace(/\s+/g, ' ').trim();

/**
 * Where a marked run sits inside its passage. When the run occurs more than
 * once, the occurrence nearest `near` wins, so a caller that knows roughly
 * where the selection started picks the one the reader actually marked.
 */
export function findHighlightRange(
  passage: string,
  marked: string,
  near = 0,
): HighlightRange | undefined {
  let best: number | undefined;

  for (
    let from = passage.indexOf(marked);
    from >= 0;
    from = passage.indexOf(marked, from + 1)
  ) {
    if (best === undefined || Math.abs(from - near) < Math.abs(best - near)) {
      best = from;
    }
  }

  return best === undefined
    ? undefined
    : { start: best, end: best + marked.length };
}

export interface WindowedPassage {
  text: string;
  highlight: HighlightRange;
}

/**
 * Fits a passage to the card without dropping what the reader marked. The
 * window is centred on the marked run rather than taken from the top, so a
 * selection near the end of a long paragraph still arrives with its context
 * either side; each cut end is moved to a word boundary and ellipsed.
 *
 * A marked run longer than the limit has no context to keep, so it is
 * truncated like any other over-long quote.
 */
export function windowAroundHighlight(
  passage: string,
  highlight: HighlightRange,
  limit = SNAPSHOT_PASSAGE_LIMIT,
): WindowedPassage {
  const marked = passage.slice(highlight.start, highlight.end);

  if (marked.length >= limit) {
    const text = truncateAtWord(marked, limit);

    return { text, highlight: { start: 0, end: text.length } };
  }

  if (passage.length <= limit) {
    return { text: passage, highlight };
  }

  const slack = limit - marked.length;
  const room = passage.length - highlight.end;
  // Split the slack evenly, then hand whatever one side cannot use to the
  // other: a run at the very start fills the card with what follows it, and a
  // run at the very end with what precedes it.
  const half = Math.round(slack / 2);
  const after = Math.min(room, Math.max(half, slack - highlight.start));
  const before = Math.min(highlight.start, slack - after);
  const from = highlight.start - before;
  const to = highlight.end + after;

  const head = passage.slice(from, highlight.start);
  const tail = passage.slice(highlight.end, to);
  // Only a cut end is moved to a word boundary and ellipsed; an end that
  // reached the passage's own start or finish is already whole.
  const isHeadCut = from > 0;
  const isTailCut = to < passage.length;
  const headFrom = isHeadCut ? head.indexOf(' ') + 1 : 0;
  const tailTo = isTailCut ? tail.lastIndexOf(' ') : tail.length;

  const lead = `${isHeadCut ? '…' : ''}${head.slice(headFrom)}`;
  const trail = `${tail.slice(0, tailTo < 0 ? 0 : tailTo)}${
    isTailCut ? '…' : ''
  }`;

  return {
    text: `${lead}${marked}${trail}`,
    highlight: { start: lead.length, end: lead.length + marked.length },
  };
}
