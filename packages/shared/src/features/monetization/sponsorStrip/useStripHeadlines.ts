import { useQuery } from '@tanstack/react-query';
import type { StatuslineItem } from '../../../graphql/statusline';
import { statuslineFeedQueryOptions } from '../../../graphql/statusline';
import { FIVE_MINUTES } from '../../../lib/time';

/** How many rows the ticker draws. */
const DISPLAY_LIMIT = 12;
/**
 * Over-fetched because the curated half is dropped below: the mix interleaves
 * up to ten headlines with the popular feed, so asking for the display count
 * alone would leave the row half empty.
 */
const FETCH_LIMIT = 30;

interface StripHeadlines {
  headlines: StatuslineItem[];
  /** Whether the query has answered; the dock reserves the row until it has. */
  isSettled: boolean;
}

/**
 * The popular half of the statusline mix. The curated half is dropped on
 * purpose: those are the same major headlines the feed's own Happening Now
 * card renders, off the same table, so carrying them here would show a reader
 * one story twice on one screen. The card owns headlines, the ticker owns
 * what the community is reading, and the two cannot overlap — the server has
 * already deduped a post that is both, into the headline it filters out.
 */
export const useStripHeadlines = (enabled: boolean): StripHeadlines => {
  const { data, isPending } = useQuery({
    ...statuslineFeedQueryOptions({ first: FETCH_LIMIT }),
    enabled,
    // Matched to the 5-minute Redis TTL the resolver serves off: polling faster
    // returns a byte-identical payload, for every reader with a feed open.
    refetchInterval: FIVE_MINUTES,
  });

  if (!enabled) {
    return { headlines: [], isSettled: true };
  }

  return {
    headlines: (data?.statuslineFeed ?? [])
      .filter(({ kind }) => kind === 'POST')
      .slice(0, DISPLAY_LIMIT),
    isSettled: !isPending,
  };
};
