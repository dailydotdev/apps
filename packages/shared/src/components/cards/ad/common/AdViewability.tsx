import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
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
import type {
  AdSlotLifecycle,
  AdSlotVisibilityMilestone,
} from '../../../../features/monetization/adSlotLifecycle';

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
  lifecycle,
}: AdViewabilityProps & { lifecycle: AdSlotLifecycle }): ReactElement => {
  const { isEnabled } = useAdLifecycle(true);
  const transition = useAdSlotActions(ad);
  const configuredViewable = isEnabled && Array.isArray(lifecycle.on.viewable);
  const viewedPixels = useMemo(
    () => (configuredViewable ? [] : getViewedPixels(ad.pixel)),
    [ad.pixel, configuredViewable],
  );
  const visibilityMilestones = useMemo(
    () =>
      isEnabled
        ? visibilityMilestoneNames.filter(
            (milestone) => !!lifecycle.on[milestone]?.length,
          )
        : [],
    [isEnabled, lifecycle],
  );
  const { ref, isViewable } = useViewability<HTMLDivElement>({
    trackingKey: ad.generationId ?? ad.link,
    onVisibility: transition,
    visibilityMilestones,
    onViewable: (data) => {
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

export const AdViewability = (props: AdViewabilityProps): ReactElement => {
  const lifecycle = getAdSlotLifecycle(props.ad);
  if (
    !lifecycle ||
    (!Array.isArray(lifecycle.on.viewable) &&
      !visibilityMilestoneNames.some(
        (milestone) => lifecycle.on[milestone]?.length,
      ))
  ) {
    return <LegacyAdViewability {...props} />;
  }

  return (
    <ConfiguredAdViewability
      key={props.ad.generationId ?? props.ad.link}
      {...props}
      lifecycle={lifecycle}
    />
  );
};
