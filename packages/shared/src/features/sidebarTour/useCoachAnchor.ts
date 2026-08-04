import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { RAIL_ANCHOR_ATTRIBUTE } from '../giveback/components/GivebackGiftDock';

// Gap between the sidebar's visible right edge and the card, matching the
// `ml-2` every other rail dropdown uses.
const COACH_GAP_PX = 8;
// The panel animates its width over 300ms, so a card placed on the same tick as
// a step that opens it would sit against a zero-width panel. Re-measuring once
// the transition has settled is the same trick the rail's selected pill uses.
const SETTLE_MS = 350;

export interface CoachAnchor {
  // A ref-shaped object so it can be handed straight to `useAnchoredRailPopup`.
  // Its identity changes with the resolved element, which is what makes that
  // hook re-run between tour steps.
  targetRef: RefObject<HTMLElement>;
  rect: DOMRect | null;
  // Viewport X the card starts at: clear of the rail, and clear of the context
  // panel whenever that panel is open (the Game Center step opens it).
  left: number;
}

const measureLeft = (): number => {
  const rail = document.querySelector(`[${RAIL_ANCHOR_ATTRIBUTE}]`);
  const panel = document.getElementById('sidebar-context-panel');
  const railRight = rail?.getBoundingClientRect().right ?? 0;
  const panelRect = panel?.getBoundingClientRect();
  const panelRight =
    panelRect && panelRect.width > 8 ? panelRect.right : railRight;

  return Math.max(railRight, panelRight) + COACH_GAP_PX;
};

// Resolves a coach target from the live DOM and keeps its geometry current.
// Selectors are the rail's own stable hooks (tab ids, ARIA labels, the
// draggable panel rows), never fixed pixel anchors: tabs are reorderable, any
// of them can fold into the More menu, and the dock disappears when it does not
// fit.
export const useCoachAnchor = (
  selector: string | undefined,
  isOpen: boolean,
): CoachAnchor => {
  const [anchor, setAnchor] = useState<CoachAnchor>({
    targetRef: { current: null },
    rect: null,
    left: 0,
  });

  useEffect(() => {
    if (!isOpen || !selector) {
      setAnchor({ targetRef: { current: null }, rect: null, left: 0 });
      return undefined;
    }

    const update = () => {
      const target = document.querySelector(selector);

      if (!(target instanceof HTMLElement)) {
        setAnchor({ targetRef: { current: null }, rect: null, left: 0 });
        return;
      }

      setAnchor({
        targetRef: { current: target },
        rect: target.getBoundingClientRect(),
        left: measureLeft(),
      });
    };

    update();
    const settle = setTimeout(update, SETTLE_MS);
    const frame = requestAnimationFrame(update);
    window.addEventListener('resize', update);

    return () => {
      clearTimeout(settle);
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, selector]);

  return anchor;
};
