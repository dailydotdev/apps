import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { HERO_ELIGIBLE_FEEDS } from '../../../hooks/useFeed';
import { ViewSize, useViewSizeClient } from '../../../hooks/useViewSize';
import { featureSponsorStrip } from '../../../lib/featureManagement';
import type { AllFeedPages } from '../../../lib/query';
import type { SponsorStripConfig } from '../../../types';

interface UseSponsorStripProps {
  feedName?: string;
  /** The feed's own ads switch (feed previews, squads) — never inventory. */
  disableAds?: boolean;
}

interface UseSponsorStrip {
  isEnabled: boolean;
  config: SponsorStripConfig;
}

/**
 * The strip shows on the feeds that can show a Happening Now card, and on no
 * others. Sharing one set with the card means the two can never disagree: the
 * strip cannot appear on a feed whose card it does not replace, and the card
 * cannot be suppressed on a feed the strip never reaches.
 */
const isSponsorStripFeed = (feedName?: string): boolean =>
  !!feedName && HERO_ELIGIBLE_FEEDS.has(feedName as AllFeedPages);

/**
 * The single gate for the sponsor strip. Both the strip itself and the feed's
 * Happening Now suppression read it, so "is the strip showing" and "is the
 * card hidden" are the same answer rather than two conditions that have to be
 * kept in step.
 */
export const useSponsorStrip = ({
  feedName,
  disableAds,
}: UseSponsorStripProps = {}): UseSponsorStrip => {
  const { isPlus } = usePlusSubscription();
  // `useViewSizeClient`, not `useViewSize`: the latter reads matchMedia in its
  // first client render while the server renders `false`, so the dock would
  // appear during hydration and React would throw the whole root away and
  // re-render it. This one matches the server until after mount.
  const isTablet = useViewSizeClient(ViewSize.Tablet);
  // A logo wall on a phone costs more feed than it can hold logos.
  const isEligible =
    !isPlus && !disableAds && isTablet && isSponsorStripFeed(feedName);
  const { value: config } = useConditionalFeature({
    feature: featureSponsorStrip,
    shouldEvaluate: isEligible,
  });

  return { isEnabled: isEligible && config.enabled, config };
};
