import { useQuery } from '@tanstack/react-query';
import type { StatuslineItem } from '../../../graphql/statusline';
import { statuslineFeedQueryOptions } from '../../../graphql/statusline';
import { ONE_MINUTE } from '../../../lib/time';

const HEADLINE_LIMIT = 12;

interface StripHeadlines {
  headlines: StatuslineItem[];
  /**
   * Whether the query has answered. The dock reserves the row's height until
   * it has, rather than popping a second row in after the feed has painted.
   */
  isSettled: boolean;
}

/**
 * The items the ticker carries: the same `statuslineFeed` mix the Claude Code
 * statusline renders as terminal lines — curated major headlines interleaved
 * with the most-upvoted posts of the day, deduped. One resolver and one cache
 * sit behind both, so the terminal and the web can never disagree about what
 * is worth showing; they differ only in how they draw it.
 *
 * No client-side freshness filter. Which headlines still count as major, and
 * which posts count as popular, is the backend's call — a second opinion held
 * only by this row emptied it on any day the curated set went quiet, dropping
 * the dock from two rows to one for no reason the reader could see. The API
 * already returns the mix in the order it wants shown.
 */
export const useStripHeadlines = (enabled: boolean): StripHeadlines => {
  const { data, isPending } = useQuery({
    ...statuslineFeedQueryOptions({ first: HEADLINE_LIMIT }),
    enabled,
    refetchInterval: ONE_MINUTE,
  });

  if (!enabled) {
    return { headlines: [], isSettled: true };
  }

  return {
    headlines: data?.statuslineFeed ?? [],
    isSettled: !isPending,
  };
};
