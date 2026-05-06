/**
 * Strict, predictable Spotlight ranker. Replaces cmdk's default fuzzy
 * `command-score` filter, which over-matches generic action commands
 * (e.g. typing "react" pulled in "Open reading history" because it
 * accepts non-contiguous character matches).
 *
 * Inspired by Linear / Raycast: word-prefix > prefix > substring; nothing
 * else makes the cut. API-backed entity rows opt out via the
 * {@link SPOTLIGHT_PASSTHROUGH_KEYWORD} marker so the backend's relevance
 * is never second-guessed locally.
 */

export const SPOTLIGHT_PASSTHROUGH_KEYWORD = '__spotlight_passthrough__';

const WORD_BOUNDARY = /[\s/_\-:]+/;

/**
 * Standalone match scorer reusable outside cmdk (e.g. to count how many
 * actions a query matches when deciding whether to highlight the
 * "Actions" scope chip).
 */
export const scoreActionMatch = (value: string, search: string): number => {
  const target = value.toLowerCase();
  const query = search.toLowerCase().trim();

  if (!query) {
    return 1;
  }

  if (target.startsWith(query)) {
    return 1;
  }

  const words = target.split(WORD_BOUNDARY).filter(Boolean);
  if (words.some((word) => word.startsWith(query))) {
    return 0.9;
  }

  if (target.includes(query)) {
    return 0.7;
  }

  const queryTokens = query.split(WORD_BOUNDARY).filter(Boolean);
  if (
    queryTokens.length > 1 &&
    queryTokens.every((token) => target.includes(token))
  ) {
    return 0.5;
  }

  return 0;
};

/**
 * cmdk filter signature: `(value, search, keywords?) => number`.
 * Returns 0 to hide the row, > 0 to include it (higher = better match).
 */
export const spotlightCommandFilter = (
  value: string,
  search: string,
  keywords?: string[],
): number => {
  if (keywords?.includes(SPOTLIGHT_PASSTHROUGH_KEYWORD)) {
    return 1;
  }

  return scoreActionMatch(value, search);
};
