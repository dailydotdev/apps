import { useCallback, useEffect, useRef } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import { getVisiblePixels } from '../../../components/cards/ad/common/ownPixels';
import { AdActions } from '../../../lib/ads';
import { substituteMacros } from '../adMacros';
import { firePixel } from '../firePixel';
import { useAdMacroContext } from '../useAdMacroContext';
import { useViewability } from '../useViewability';
import { useVisibleTime } from '../useVisibleTime';
import type { ResolvedSponsor } from './sponsorStripCreative';
import { sponsorStripLogEvent } from './sponsorStripLog';

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
 * The signals for one logo in one slot. The warehouse gets an impression when
 * it takes the slot and a click; the ad server's pixel gets the rest — the IAB
 * viewable impression (`viewed=true`, fired by the slot once `isViewable`) and
 * the air time, reported here as `visible=<seconds>` increments.
 */
export const useSponsorSlotLog = <T extends HTMLElement = HTMLElement>({
  sponsor,
  slotIndex,
}: UseSponsorSlotLogProps): UseSponsorSlotLog<T> => {
  const { logEvent } = useLogContext();
  const sponsorRef = useRef(sponsor);
  sponsorRef.current = sponsor;
  const { genId } = sponsor;
  const macroContext = useAdMacroContext(true);
  const macroContextRef = useRef(macroContext);
  macroContextRef.current = macroContext;

  useEffect(() => {
    logEvent(
      sponsorStripLogEvent(AdActions.Impression, sponsorRef.current, slotIndex),
    );
  }, [genId, slotIndex, logEvent]);

  const { ref: viewabilityRef, isViewable } = useViewability<T>({
    trackingKey: genId,
  });

  const onReport = useCallback((seconds: number) => {
    getVisiblePixels(sponsorRef.current.pixel, seconds).forEach((pixel) =>
      firePixel(substituteMacros(pixel, macroContextRef.current ?? {})),
    );
  }, []);

  const { ref: visibleTimeRef } = useVisibleTime<T>({
    onReport,
    trackingKey: genId,
  });

  const ref = useCallback(
    (node: T | null) => {
      viewabilityRef(node);
      visibleTimeRef(node);
    },
    [viewabilityRef, visibleTimeRef],
  );

  const onClick = useCallback(
    () =>
      logEvent(
        sponsorStripLogEvent(AdActions.Click, sponsorRef.current, slotIndex),
      ),
    [logEvent, slotIndex],
  );

  return { ref, isViewable, onClick };
};
