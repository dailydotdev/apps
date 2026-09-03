/**
 * A shared quote reads as one thought, and 280 characters still sets legibly
 * inside the square. Longer selections are cut rather than refused: the reader
 * gets the opening of what was marked, and the link carries the rest.
 */
export const SNAPSHOT_TEXT_LIMIT = 280;

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
