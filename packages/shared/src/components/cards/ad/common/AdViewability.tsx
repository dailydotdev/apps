import type { ReactElement } from 'react';
import React from 'react';
import type { Ad } from '../../../../graphql/posts';
import type { ViewabilityData } from '../../../../features/monetization/viewability';
import { useViewability } from '../../../../features/monetization/useViewability';

interface AdViewabilityProps {
  ad: Ad;
  onViewable: (data: ViewabilityData) => void;
}

/**
 * Reports the IAB viewable impression of an ad. The tracker stretches over the
 * card's `relative` root so the observer measures the creative's own box, and
 * stays non-interactive so the card keeps ownership of clicks.
 */
export const AdViewability = ({
  ad,
  onViewable,
}: AdViewabilityProps): ReactElement => {
  const { ref } = useViewability<HTMLDivElement>({
    onViewable,
    trackingKey: ad.generationId ?? ad.link,
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
