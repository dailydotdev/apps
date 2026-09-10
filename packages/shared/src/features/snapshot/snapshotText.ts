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
 * Where a marked run sits inside its passage. A DOM selection already carries
 * offsets, so this is for callers that kept only the two strings.
 */
export function findHighlightRange(
  passage: string,
  marked: string,
): HighlightRange | undefined {
  const start = passage.indexOf(marked);

  return start < 0 ? undefined : { start, end: start + marked.length };
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
  const before = Math.min(highlight.start, Math.round(slack / 2));
  // Whatever the leading side does not use goes to the trailing side, so a
  // selection at the very start still fills the card with what follows it.
  const from = highlight.start - before;
  const to = Math.min(passage.length, highlight.end + (slack - before));

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
