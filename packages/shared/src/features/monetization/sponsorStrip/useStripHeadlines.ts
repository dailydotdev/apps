import { useQuery } from '@tanstack/react-query';
import type { PostHighlight } from '../../../graphql/highlights';
import { majorHeadlinesQueryOptions } from '../../../graphql/highlights';
import { ONE_MINUTE } from '../../../lib/time';

const HEADLINE_LIMIT = 12;

/**
 * The headlines the strip carries. Same `majorHeadlines` field the /highlights
 * page and the post-page widget read, and the same query document as the
 * widget — the strip is a third view of one set of headlines, not a new source
 * of them. /highlights wraps the field in its own document only because its
 * cards need the post bodies, which cost 147KB at its page size and would put
 * all of it on the feed for four fields this row renders.
 *
 * No client-side freshness filter, because the row stands in for the feed's
 * Happening Now card and has to behave like it: that card renders whatever the
 * backend serves it, and so does /highlights. Deciding what still counts as a
 * major headline is the backend's call, and a second opinion held only by this
 * row emptied it on any day `majorHeadlines` went quiet — which it routinely
 * does for 36 hours or more — dropping the dock from two rows to one for no
 * reason the reader could see. The API already returns newest first, and every
 * row renders its own relative timestamp.
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

  return (data?.majorHeadlines?.edges ?? []).map(({ node }) => node);
};
