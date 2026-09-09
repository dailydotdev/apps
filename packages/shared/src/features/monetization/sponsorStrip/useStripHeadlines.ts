import { useQuery } from '@tanstack/react-query';
import type { StatuslineItem } from '../../../graphql/statusline';
import { statuslineFeedQueryOptions } from '../../../graphql/statusline';
import { FIVE_MINUTES } from '../../../lib/time';

const HEADLINE_LIMIT = 12;

interface StripHeadlines {
  headlines: StatuslineItem[];
  /** Whether the query has answered; the dock reserves the row until it has. */
  isSettled: boolean;
}

export const useStripHeadlines = (enabled: boolean): StripHeadlines => {
  const { data, isPending } = useQuery({
    ...statuslineFeedQueryOptions({ first: HEADLINE_LIMIT }),
    enabled,
    // Matched to the 5-minute Redis TTL the resolver serves off: polling faster
    // returns a byte-identical payload, for every reader with a feed open.
    refetchInterval: FIVE_MINUTES,
  });

  if (!enabled) {
    return { headlines: [], isSettled: true };
  }

  return {
    headlines: data?.statuslineFeed ?? [],
    isSettled: !isPending,
  };
};
