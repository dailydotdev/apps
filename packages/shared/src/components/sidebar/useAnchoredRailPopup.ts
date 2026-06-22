import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

export interface AnchoredRailPopupPosition {
  left: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

// Positions a portaled rail dropdown (customize tray, More menu) next to its
// trigger button: to the right of the rail, anchored to the button's top —
// unless there isn't comfortable room below, in which case it flips to open
// upward (bottom-anchored) so it's never cut off short screens. Either way it's
// capped to the available height so the content scrolls instead of overflowing.
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
        left: rect.right + 12,
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
