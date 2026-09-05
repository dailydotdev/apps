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
  /**
   * Drop the feed's Happening Now card — true only when the strip is actually
   * carrying the headlines in its place. With the strip up but no headline
   * inside the freshness window there is nothing to replace the card with, so
   * the card stays: breaking news must never fall out of the product entirely
   * just because the experiment is on.
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
  const headlines = useStripHeadlines(isEnabled);

  return {
    isEnabled,
    headlines,
    disableHighlightItems: isEnabled && !!headlines.length,
  };
};
