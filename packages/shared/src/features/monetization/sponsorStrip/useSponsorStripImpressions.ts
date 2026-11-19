import { useEffect, useRef } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import { sponsorStripImpressionLogEvent } from './sponsorStripLog';
import type { SponsorSlot } from './sponsorStripSlots';

const slotKey = ({ sponsor, slotIndex }: SponsorSlot): string =>
  `${sponsor.genId}:${slotIndex}`;

/**
 * Logs one impression per strip render for the marks that just took a slot.
 * A mark already on the row is not logged again; one that left (a narrower
 * window) and came back is, the same as the per-logo event it replaces.
 */
export const useSponsorStripImpressions = (slots: SponsorSlot[]): void => {
  const { logEvent } = useLogContext();
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const shownRef = useRef(new Set<string>());
  const slotsKey = slots.map(slotKey).join(',');

  useEffect(() => {
    const { current } = slotsRef;
    const entered = current.filter(
      (slot) => !shownRef.current.has(slotKey(slot)),
    );
    shownRef.current = new Set(current.map(slotKey));

    if (entered.length) {
      logEvent(sponsorStripImpressionLogEvent(entered));
    }
  }, [slotsKey, logEvent]);
};
