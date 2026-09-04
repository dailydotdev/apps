import { useCallback, useEffect, useRef } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import { AdActions } from '../../../lib/ads';
import type { ViewabilityData } from '../viewability';
import { viewabilityLogExtra } from '../viewability';
import { useViewability } from '../useViewability';
import type { ResolvedSponsor } from './sponsorStripCreative';
import { airTimeKey, sponsorStripLogEvent } from './sponsorStripLog';

interface UseSponsorSlotLogProps {
  sponsor: ResolvedSponsor;
  slotIndex: number;
}

interface UseSponsorSlotLog<T extends HTMLElement> {
  ref: (node: T | null) => void;
  isViewable: boolean;
  onClick: () => void;
}

/**
 * The four signals for one logo in one slot: an impression when it takes the
 * slot, an IAB viewable impression when it has actually been seen, air time
 * for as long as it holds the slot, and a click.
 */
export const useSponsorSlotLog = <T extends HTMLElement = HTMLElement>({
  sponsor,
  slotIndex,
}: UseSponsorSlotLogProps): UseSponsorSlotLog<T> => {
  const { logEvent, logEventStart, logEventEnd } = useLogContext();
  const sponsorRef = useRef(sponsor);
  sponsorRef.current = sponsor;
  const { genId } = sponsor;

  useEffect(() => {
    const key = airTimeKey(slotIndex, genId);
    const startAirTime = () =>
      logEventStart(
        key,
        sponsorStripLogEvent(AdActions.AirTime, sponsorRef.current, slotIndex),
      );

    logEvent(
      sponsorStripLogEvent(AdActions.Impression, sponsorRef.current, slotIndex),
    );
    startAirTime();

    // Going inactive ends every open duration event and beacons it, so a logo
    // still holding its slot when the reader comes back needs its air time
    // reopened — `useLogPageView` reopens the page view for the same reason.
    const onLifecycle = (event: Event) => {
      const { newState } =
        (event as CustomEvent<{ newState?: string }>).detail ?? {};

      if (newState === 'active') {
        startAirTime();
      }
    };

    globalThis.addEventListener('statechange', onLifecycle);

    return () => {
      globalThis.removeEventListener('statechange', onLifecycle);
      logEventEnd(key);
    };
  }, [genId, slotIndex, logEvent, logEventStart, logEventEnd]);

  const onViewable = useCallback(
    (data: ViewabilityData) =>
      logEvent(
        sponsorStripLogEvent(
          AdActions.Viewable,
          sponsorRef.current,
          slotIndex,
          viewabilityLogExtra(data),
        ),
      ),
    [logEvent, slotIndex],
  );

  const { ref, isViewable } = useViewability<T>({
    onViewable,
    trackingKey: genId,
  });

  const onClick = useCallback(
    () =>
      logEvent(
        sponsorStripLogEvent(AdActions.Click, sponsorRef.current, slotIndex),
      ),
    [logEvent, slotIndex],
  );

  return { ref, isViewable, onClick };
};
