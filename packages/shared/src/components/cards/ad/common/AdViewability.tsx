import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { Ad } from '../../../../graphql/posts';
import type { ViewabilityData } from '../../../../features/monetization/viewability';
import { useViewability } from '../../../../features/monetization/useViewability';
import { AdPixel } from './AdPixel';
import { getViewedPixels } from './getViewedPixels';

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
  const { ref, isViewable } = useViewability<HTMLDivElement>({
    onViewable,
    trackingKey: ad.generationId ?? ad.link,
  });
  const viewedPixels = useMemo(() => getViewedPixels(ad.pixel), [ad.pixel]);

  // The viewed pixel rides inside the tracker so it stays out of flow: cards
  // that space their children with `gap-*` would otherwise grow by one gap.
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
