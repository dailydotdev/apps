import type { StatuslineItem } from '../../../graphql/statusline';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureSponsorStripBreakingNews } from '../../../lib/featureManagement';
import { useSponsorStrip } from './useSponsorStrip';
import { useStripHeadlines } from './useStripHeadlines';

interface UseSponsorStripFeedProps {
  feedName?: string;
  disableAds?: boolean;
  suppressed?: boolean;
}

interface UseSponsorStripFeed {
  isEnabled: boolean;
  headlines: StatuslineItem[];
  /** Whether the headlines query has answered; the dock reserves until it has. */
  headlinesSettled: boolean;
}

/**
 * Everything a feed layout needs from the sponsor strip, in one place: whether
 * to mount it and the headlines it carries. One strip gate and one
 * headlines query, so the strip and the feed can never be told different
 * things.
 *
 * The breaking-news experiment is only evaluated for feeds showing the strip.
 */
export const useSponsorStripFeed = ({
  feedName,
  disableAds,
  suppressed,
}: UseSponsorStripFeedProps): UseSponsorStripFeed => {
  const isEnabled = useSponsorStrip({ feedName, disableAds, suppressed });
  const { value: isBreakingNewsEnabled } = useConditionalFeature({
    feature: featureSponsorStripBreakingNews,
    shouldEvaluate: isEnabled,
  });
  const { headlines, isSettled } = useStripHeadlines(
    isEnabled && isBreakingNewsEnabled,
  );

  return {
    isEnabled,
    headlines,
    headlinesSettled: isSettled,
  };
};
