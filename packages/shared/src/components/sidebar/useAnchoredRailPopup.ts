import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

export interface AnchoredRailPopupPosition {
  top?: number;
  bottom?: number;
  maxHeight: number;
}

// Vertical placement for a portaled rail dropdown (customize tray, More menu).
// Horizontal X is fixed via the `left-20 ml-2` class — the exact same X the
// Support/Settings popups use — so all rail dropdowns sit the same distance
// from the rail. Vertically it anchors to the trigger's top, flipping to open
// upward (bottom-anchored) when there isn't room below, so it's never cut off
// short screens. Capped to the available height so the content scrolls.
// Recomputed on open and on viewport resize (not on rail scroll — it stays put
// like the Support/Settings popups, avoiding a jittery shift).
export const useAnchoredRailPopup = (
  triggerRef: RefObject<HTMLElement>,
  isOpen: boolean,
): AnchoredRailPopupPosition | null => {
  const [position, setPosition] = useState<AnchoredRailPopupPosition | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return undefined;
    }
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const margin = 12;
      const vh = window.innerHeight;
      const spaceBelow = vh - rect.top - margin;
      const spaceAbove = rect.bottom - margin;
      const openUp = spaceBelow < 320 && spaceAbove > spaceBelow;
      setPosition({
        maxHeight: Math.max(160, openUp ? spaceAbove : spaceBelow),
        ...(openUp ? { bottom: vh - rect.bottom } : { top: rect.top }),
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, [isOpen, triggerRef]);

  return position;
};
