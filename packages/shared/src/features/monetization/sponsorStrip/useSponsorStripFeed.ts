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
}

/**
 * Everything a feed layout needs from the sponsor strip, in one place: whether
 * to mount it and the headlines it carries. One evaluation of the flag and one
 * headlines query, so the strip and the feed can never be told different
 * things.
 *
 * The feed keeps its own Happening Now card either way — the ticker is a
 * separate row with its own content, not a replacement for the card.
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
  };
};
