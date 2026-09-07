import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { RootPortal } from '../../components/tooltips/Portal';
import { useAnchoredRailPopup } from '../../components/sidebar/useAnchoredRailPopup';
import type { CoachCardProps } from './CoachCard';
import { CoachCard } from './CoachCard';
import type { CoachAnchor } from './useCoachAnchor';

// Keeps the card off the viewport edges, and keeps its pointer inside its own
// rounded corners.
const VIEWPORT_MARGIN_PX = 16;
const POINTER_INSET_PX = 16;
// The context panel animates its width over 300ms; the card lines up against
// where it settles, not where it started.
const PANEL_SETTLE_MS = 350;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max));

// Painted over the measured target rather than as a class on the rail, so the
// rail keeps its own markup.
export const CoachHighlight = ({
  rect,
  variant = 'default',
}: {
  rect: DOMRect | null;
  variant?: 'default' | 'tight';
}): ReactElement | null => {
  if (!rect) {
    return null;
  }

  const outset = variant === 'tight' ? 0 : 2;

  return (
    <span
      aria-hidden
      className={classNames(
        'pointer-events-none fixed z-coach ring-2 ring-accent-cabbage-default',
        variant === 'tight' ? 'rounded-14' : 'rounded-12',
      )}
      style={{
        left: rect.left - outset,
        top: rect.top - outset,
        width: rect.width + outset * 2,
        height: rect.height + outset * 2,
      }}
    />
  );
};

export interface CoachPopoverProps extends Omit<CoachCardProps, 'pointer'> {
  anchor: CoachAnchor;
  isOpen: boolean;
  highlightRect?: DOMRect | null;
  highlight?: 'default' | 'tight';
  align?: 'center' | 'top' | 'panelTop';
  containerRef?: RefObject<HTMLDivElement>;
}

export const CoachPopover = ({
  anchor,
  isOpen,
  highlightRect,
  highlight = 'default',
  align = 'center',
  containerRef,
  ...card
}: CoachPopoverProps): ReactElement | null => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState(0);
  // A callback ref, because the card mounts on the render AFTER the anchor
  // resolves: a layout effect keyed on the card's content never fires again for
  // that mount, so the height would stay 0 and the pointer would sit mid-card
  // aiming at nothing.
  const measure = useCallback((node: HTMLDivElement | null) => {
    cardRef.current = node;
    setCardHeight(node?.offsetHeight ?? 0);
  }, []);
  // Same vertical anchoring every other rail dropdown uses: it caps the height
  // against the available space and flips to opening upward on a short
  // viewport. Only the cap is consumed here, because the card centres on its
  // target rather than hanging from its top edge.
  const position = useAnchoredRailPopup(anchor.targetRef, isOpen);

  useLayoutEffect(() => {
    setCardHeight(cardRef.current?.offsetHeight ?? 0);
  }, [card.message, card.stepKey, card.control, isOpen]);

  // The panel opens on the same tick as the step, so its box is only readable
  // after layout. Re-measured per step rather than once: the panel animates its
  // width, and a step that does not open one leaves this null.
  const [panelTop, setPanelTop] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!isOpen || align !== 'panelTop') {
      setPanelTop(null);
      return undefined;
    }

    const read = () => {
      const panel = document.getElementById('sidebar-context-panel');
      setPanelTop(panel ? panel.getBoundingClientRect().top : null);
    };

    read();
    const frame = requestAnimationFrame(read);
    const settle = setTimeout(read, PANEL_SETTLE_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [align, card.stepKey, isOpen]);

  if (!isOpen || !anchor.rect || !position) {
    return null;
  }

  const targetCenter = anchor.rect.top + anchor.rect.height / 2;
  const viewportHeight = globalThis.window?.innerHeight ?? 0;
  // 'top' lines the card up with the top of its target rather than its middle,
  // so a single tab's card sits beside that tab's label and count.
  const alignedTop = align === 'panelTop' ? panelTop : null;
  const preferredTop =
    alignedTop ??
    (align === 'center' ? targetCenter - cardHeight / 2 : anchor.rect.top);
  const top = clamp(
    preferredTop,
    VIEWPORT_MARGIN_PX,
    viewportHeight - cardHeight - VIEWPORT_MARGIN_PX,
  );
  const pointer = cardHeight
    ? clamp(targetCenter - top, POINTER_INSET_PX, cardHeight - POINTER_INSET_PX)
    : 'center';

  return (
    <RootPortal>
      <CoachHighlight rect={highlightRect ?? anchor.rect} variant={highlight} />
      <div
        ref={containerRef}
        className="fixed z-coach"
        style={{ left: anchor.left, top }}
      >
        <CoachCard
          {...card}
          ref={measure}
          pointer={pointer}
          style={{ maxHeight: position.maxHeight }}
        />
      </div>
    </RootPortal>
  );
};
