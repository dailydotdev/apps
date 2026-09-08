/** The most that still sets legibly inside the square. */
const SNAPSHOT_TEXT_LIMIT = 280;

/**
 * The frame grows to fit, so the ceiling on a shared passage is about
 * legibility at 1080 wide rather than about the square.
 */
export const SNAPSHOT_PASSAGE_LIMIT = 900;

/**
 * One size for the copy, not a scale. The frames grow to fit, so type no
 * longer has to shrink to reach the bottom of a fixed square — and a shared
 * image that changes size with its length reads as two different cards.
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
