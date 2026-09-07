import type { PostHighlight } from '../../../graphql/highlights';
import { useSponsorStrip } from './useSponsorStrip';
import { useStripHeadlines } from './useStripHeadlines';

interface UseSponsorStripFeedProps {
  feedName?: string;
  disableAds?: boolean;
}

interface UseSponsorStripFeed {
  isEnabled: boolean;
  headlines: PostHighlight[];
  /** Whether the headlines query has answered; the dock reserves until it has. */
  headlinesSettled: boolean;
  /**
   * Drop the feed's Happening Now card, because the strip carries those
   * headlines in its place.
   *
   * Decided from the strip being up rather than from the headlines having
   * arrived. The headlines are their own round trip and land after the feed
   * has painted, so reading them here flipped this mid-scroll and pulled the
   * card out of the middle of the feed, jumping everything below it. The one
   * case that gives the card back is the query settling with nothing at all:
   * breaking news must never fall out of the product entirely just because
   * the experiment is on.
   */
  disableHighlightItems: boolean;
}

/**
 * Everything a feed layout needs from the sponsor strip, in one place: whether
 * to mount it, the headlines it carries, and whether the feed underneath
 * should give up its Happening Now card. One evaluation of the flag and one
 * headlines query, so the strip and the feed can never be told different
 * things.
 */
export const useSponsorStripFeed = ({
  feedName,
  disableAds,
}: UseSponsorStripFeedProps): UseSponsorStripFeed => {
  const isEnabled = useSponsorStrip({ feedName, disableAds });
  const { headlines, isSettled } = useStripHeadlines(isEnabled);

  return {
    isEnabled,
    headlines,
    headlinesSettled: isSettled,
    disableHighlightItems: isEnabled && (!isSettled || headlines.length > 0),
  };
};
