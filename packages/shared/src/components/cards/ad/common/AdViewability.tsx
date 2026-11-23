import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { Ad } from '../../../../graphql/posts';
import type { ViewabilityData } from '../../../../features/monetization/viewability';
import { useViewability } from '../../../../features/monetization/useViewability';
import { AdPixel } from './AdPixel';
import { getViewedPixels } from './ownPixels';
import { getAdSlotLifecycle } from '../../../../features/monetization/adSlotLifecycle';
import { useAdSlotActions } from '../../../../features/monetization/useAdSlotActions';
import { useAdLifecycle } from '../../../../features/monetization/useAdLifecycle';
import { viewabilityLogExtra } from '../../../../features/monetization/viewability';
import { AdActions } from '../../../../lib/ads';
import type { AdSlotVisibilityMilestone } from '../../../../features/monetization/adSlotLifecycle';

const visibilityMilestoneNames: AdSlotVisibilityMilestone[] = [
  'visible',
  'half-visible',
  'visible-for-1s',
];

interface AdViewabilityProps {
  ad: Ad;
  onViewable: (data: ViewabilityData) => void;
}

/**
 * Reports the IAB viewable impression of an ad. The tracker stretches over the
 * card's `relative` root so the observer measures the creative's own box, and
 * stays non-interactive so the card keeps ownership of clicks.
 *
 * Our own pixels fire a second time with `viewed=true` once the criteria are
 * met, so the ad server counts the viewable impression from the same tracker
 * it already counts the render with.
 */
export const AdViewability = ({
  ad,
  onViewable,
}: AdViewabilityProps): ReactElement => {
  const { isEnabled } = useAdLifecycle(!!ad.lifecycle);
  const lifecycle = isEnabled ? getAdSlotLifecycle(ad) : undefined;
  const transition = useAdSlotActions(ad);
  const configuredViewable = Array.isArray(lifecycle?.on.viewable);
  const legacyViewedPixels = useMemo(
    () => getViewedPixels(ad.pixel),
    [ad.pixel],
  );
  const trackingKey = ad.generationId ?? ad.link;
  const [deliveredPixels, setDeliveredPixels] = useState<{
    trackingKey: string;
    pixels: string[];
  }>();
  const visibilityMilestones = useMemo(
    () =>
      visibilityMilestoneNames.filter(
        (milestone) => !!lifecycle?.on[milestone]?.length,
      ),
    [lifecycle],
  );
  const { ref, isViewable } = useViewability<HTMLDivElement>({
    trackingKey,
    onVisibility: transition,
    visibilityMilestones,
    onViewable: (data) => {
      setDeliveredPixels({
        trackingKey,
        pixels: configuredViewable ? [] : legacyViewedPixels,
      });
      if (!configuredViewable) {
        onViewable(data);
        return;
      }
      transition('viewable', viewabilityLogExtra(data), (name) => {
        if (name === AdActions.Viewable) {
          onViewable(data);
          return true;
        }
        return false;
      });
    },
  });
  const viewedPixels =
    deliveredPixels && deliveredPixels.trackingKey === trackingKey
      ? deliveredPixels.pixels
      : [];

  // Keep the pixel out of flow so it cannot add a gap to the card's layout.
  return (
    <div
      ref={ref}
      aria-hidden
      data-testid="adViewability"
      className="pointer-events-none absolute inset-0"
    >
      {isViewable && !!viewedPixels.length && (
        <AdPixel pixel={viewedPixels} fireOnMount />
      )}
    </div>
  );
};
