/**
 * cmdk's `filter` prop. We use plain substring matching because the
 * catalog is small and the user expectation is predictable: if a title
 * contains the query, it shows up. Backend-ranked rows (post / source /
 * user / tag search results) opt out via {@link SPOTLIGHT_PASSTHROUGH_KEYWORD}
 * so we don't second-guess the API's relevance.
 */
export const SPOTLIGHT_PASSTHROUGH_KEYWORD = '__spotlight_passthrough__';

export const spotlightCommandFilter = (
  value: string,
  search: string,
  keywords?: string[],
): number => {
  if (keywords?.includes(SPOTLIGHT_PASSTHROUGH_KEYWORD)) {
    return 1;
  }
  const query = search.trim().toLowerCase();
  if (!query) {
    return 1;
  }
  return value.toLowerCase().includes(query) ? 1 : 0;
};
