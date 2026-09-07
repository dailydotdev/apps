/**
 * A shared quote reads as one thought, and 280 characters still sets legibly
 * inside the square. Longer selections are cut rather than refused: the reader
 * gets the opening of what was marked, and the link carries the rest.
 */
export const SNAPSHOT_TEXT_LIMIT = 280;

/**
 * A passage carries the marked run plus the text around it, so the image beats
 * a screenshot instead of matching it. The frame grows to fit, so the ceiling
 * is about legibility at 1080 wide, not about the square.
 */
export const SNAPSHOT_PASSAGE_LIMIT = 900;

/**
 * The copy is the payload on these cards, so it takes as much size as it can
 * carry: a short passage gets set large, a long one steps down rather than
 * clip. Shared by the post and highlight cards, which sit side by side in
 * review and would otherwise drift apart.
 */
export const snapshotCopyFontSize = (length: number): number => {
  if (length <= 140) {
    return 54;
  }

  if (length <= 280) {
    return 46;
  }

  if (length <= 480) {
    return 38;
  }

  return 33;
};

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

/** Keeps the end of the run-up rather than its start: context reads backwards. */
const keepTail = (text: string, limit: number): string => {
  if (limit <= 0 || !text.trim()) {
    return '';
  }

  if (text.length <= limit) {
    return text.trimStart();
  }

  const cut = text.slice(text.length - limit);
  const firstSpace = cut.indexOf(' ');

  return `…${firstSpace >= 0 ? cut.slice(firstSpace) : ` ${cut}`}`;
};

const keepHead = (text: string, limit: number): string => {
  if (limit <= 0 || !text.trim()) {
    return '';
  }

  if (text.length <= limit) {
    return text.trimEnd();
  }

  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');

  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
};

export interface SnapshotPassage {
  /** The run-up, already windowed. Empty when the passage starts at the mark. */
  before: string;
  /** What the reader actually selected, rendered marked. */
  marked: string;
  after: string;
}

/**
 * Windows a passage around what the reader marked. The selection is never cut
 * to make room for its surroundings, and the run-up gets a third of what is
 * left: a marked sentence usually continues, while the lead-in is only there
 * to orient.
 */
export function windowPassage(
  passage: string,
  highlight?: string,
  limit = SNAPSHOT_PASSAGE_LIMIT,
): SnapshotPassage {
  const text = passage.trim();
  const selection = highlight?.trim();
  const at = selection ? text.indexOf(selection) : -1;

  // No selection, or one that is not in this passage: the passage is the
  // subject and there is nothing to set apart.
  if (!selection || at < 0) {
    return { before: '', marked: truncateAtWord(text, limit), after: '' };
  }

  const marked = truncateAtWord(selection, limit);
  const budget = limit - marked.length;
  const before = keepTail(text.slice(0, at), Math.round(budget / 3));
  const after = keepHead(
    text.slice(at + selection.length),
    budget - before.length,
  );

  return { before, marked, after };
}
