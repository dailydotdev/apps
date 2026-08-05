import type { RefObject } from 'react';
import { useLayoutEffect, useState } from 'react';
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

const isSameGeometry = (
  current: CoachAnchor,
  target: HTMLElement,
  rect: DOMRect,
  left: number,
): boolean =>
  current.targetRef.current === target &&
  current.left === left &&
  !!current.rect &&
  current.rect.top === rect.top &&
  current.rect.left === rect.left &&
  current.rect.width === rect.width &&
  current.rect.height === rect.height;

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

  // Layout, not passive: a step change measures before the browser paints, so
  // the card never shows one frame at the previous step's position.
  useLayoutEffect(() => {
    const clear = () =>
      setAnchor((current) =>
        current.rect || current.targetRef.current
          ? { targetRef: { current: null }, rect: null, left: 0 }
          : current,
      );

    if (!isOpen || !selector) {
      clear();
      return undefined;
    }

    const update = () => {
      const target = document.querySelector(selector);

      if (!(target instanceof HTMLElement)) {
        clear();
        return;
      }

      const rect = target.getBoundingClientRect();
      const left = measureLeft();

      // Most of the triggers below re-measure something that did not move, and
      // a fresh `targetRef` identity re-runs the whole positioning chain, so an
      // unchanged measurement has to stop here rather than in a re-render.
      setAnchor((current) =>
        isSameGeometry(current, target, rect, left)
          ? current
          : { targetRef: { current: target }, rect, left },
      );
    };

    update();
    const settle = setTimeout(update, SETTLE_MS);
    const frame = requestAnimationFrame(update);
    window.addEventListener('resize', update);

    // Compact mode, the panel opening or closing and the rail hover-expanding
    // all move the target without resizing the window, and the two timed
    // measures above have long since run by then.
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    [
      document.querySelector(`[${RAIL_ANCHOR_ATTRIBUTE}]`),
      document.getElementById('sidebar-context-panel'),
      document.querySelector(selector),
    ].forEach((element) => {
      if (element) {
        observer?.observe(element);
      }
    });

    return () => {
      clearTimeout(settle);
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [isOpen, selector]);

  return anchor;
};
