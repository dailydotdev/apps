import { useQuery } from '@tanstack/react-query';
import type { PostHighlight } from '../../../graphql/highlights';
import { majorHeadlinesQueryOptions } from '../../../graphql/highlights';
import { mockStripHeadlines } from '../../../hooks/feed/mockFeedHighlights';
import { ONE_HOUR, ONE_MINUTE } from '../../../lib/time';

const HEADLINE_LIMIT = 12;

/**
 * Same 24 hour window the post-page widget uses. A ticker is a claim that
 * something is happening now, so a day-old headline in it is worse than a
 * shorter row.
 */
const MAX_HEADLINE_AGE_MS = 24 * ONE_HOUR;

/**
 * The headlines the strip carries, from the same `majorHeadlines` query behind
 * the Happening Now card and the post-page widget — the strip is a third view
 * of one set of headlines, not a new source of them.
 */
export const useStripHeadlines = (enabled: boolean): PostHighlight[] => {
  const { data } = useQuery({
    ...majorHeadlinesQueryOptions({ first: HEADLINE_LIMIT }),
    enabled,
    refetchInterval: ONE_MINUTE,
  });

  if (!enabled) {
    return [];
  }

  const cutoff = Date.now() - MAX_HEADLINE_AGE_MS;
  const headlines = (data?.majorHeadlines?.edges ?? [])
    .map(({ node }) => node)
    .filter(({ highlightedAt }) => new Date(highlightedAt).getTime() >= cutoff);

  if (headlines.length) {
    return headlines;
  }

  // TEMPORARY: a local session gets no headlines inside the window, which
  // leaves the row this experiment is built around empty and the strip looking
  // broken. No query param to remember here — the experiment flag is already
  // the opt-in, and the fixture cannot reach a real reader because it is
  // development only. Remove with the rest of `mockFeedHighlights`.
  return mockStripHeadlines(true);
};
