import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { Ad } from '../../../../graphql/posts';
import type { ViewabilityData } from '../../../../features/monetization/viewability';
import { useViewability } from '../../../../features/monetization/useViewability';
import { AdPixel } from './AdPixel';
import { getViewedPixels } from './ownPixels';
import { getAdSlotLifecycle } from '../../../../features/monetization/adSlotLifecycle';
import { useAdSlotActions } from '../../../../features/monetization/useAdSlotActions';
import { viewabilityLogExtra } from '../../../../features/monetization/viewability';
import { AdActions } from '../../../../lib/ads';
import type { AdSlotVisibilityMilestone } from '../../../../features/monetization/adSlotLifecycle';

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
const LegacyAdViewability = ({
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

const ConfiguredAdViewability = ({
  ad,
  onViewable,
}: AdViewabilityProps): ReactElement => {
  const transition = useAdSlotActions(ad);
  const lifecycle = getAdSlotLifecycle(ad);
  const visibilityMilestones = useMemo(
    (): AdSlotVisibilityMilestone[] =>
      (['visible', 'half-visible', 'visible-for-1s'] as const).filter(
        (milestone) => !!lifecycle?.on[milestone]?.length,
      ),
    [lifecycle],
  );
  const { ref } = useViewability<HTMLDivElement>({
    onVisibility: transition,
    visibilityMilestones,
    onViewable: (data) => {
      transition('viewable', viewabilityLogExtra(data), (name) => {
        if (name === AdActions.Viewable) {
          onViewable(data);
          return true;
        }
        return false;
      });
    },
  });

  return (
    <div
      ref={ref}
      aria-hidden
      data-testid="adViewability"
      className="pointer-events-none absolute inset-0"
    />
  );
};

export const AdViewability = (props: AdViewabilityProps): ReactElement =>
  getAdSlotLifecycle(props.ad) ? (
    <ConfiguredAdViewability
      key={props.ad.generationId ?? props.ad.link}
      {...props}
    />
  ) : (
    <LegacyAdViewability {...props} />
  );
