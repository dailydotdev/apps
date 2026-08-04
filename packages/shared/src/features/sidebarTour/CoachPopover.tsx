import type { ReactElement } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { RootPortal } from '../../components/tooltips/Portal';
import { useAnchoredRailPopup } from '../../components/sidebar/useAnchoredRailPopup';
import type { CoachCardProps } from './CoachCard';
import { CoachCard } from './CoachCard';
import type { CoachAnchor } from './useCoachAnchor';

// Keeps the card off the viewport edges, and keeps its pointer inside its own
// rounded corners.
const VIEWPORT_MARGIN_PX = 16;
const POINTER_INSET_PX = 16;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max));

// The brand ring the Storybook mock drew around a rail "region". Here it is
// painted over the measured target instead, so the rail keeps its own markup.
export const CoachHighlight = ({
  rect,
}: {
  rect: DOMRect | null;
}): ReactElement | null => {
  if (!rect) {
    return null;
  }

  return (
    <span
      aria-hidden
      className="pointer-events-none fixed z-popup rounded-12 ring-2 ring-accent-cabbage-default"
      style={{
        left: rect.left - 2,
        top: rect.top - 2,
        width: rect.width + 4,
        height: rect.height + 4,
      }}
    />
  );
};

export interface CoachPopoverProps extends Omit<CoachCardProps, 'pointer'> {
  anchor: CoachAnchor;
  isOpen: boolean;
  highlightRect?: DOMRect | null;
}

export const CoachPopover = ({
  anchor,
  isOpen,
  highlightRect,
  ...card
}: CoachPopoverProps): ReactElement | null => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(0);
  // Same vertical anchoring every other rail dropdown uses: it caps the height
  // against the available space and flips to opening upward on a short
  // viewport. Only the cap is consumed here, because the card centres on its
  // target rather than hanging from its top edge.
  const position = useAnchoredRailPopup(anchor.targetRef, isOpen);

  useLayoutEffect(() => {
    setCardHeight(cardRef.current?.offsetHeight ?? 0);
  }, [card.message, card.stepKey, card.control, isOpen]);

  if (!isOpen || !anchor.rect || !position) {
    return null;
  }

  const targetCenter = anchor.rect.top + anchor.rect.height / 2;
  const viewportHeight = globalThis.window?.innerHeight ?? 0;
  const top = clamp(
    targetCenter - cardHeight / 2,
    VIEWPORT_MARGIN_PX,
    viewportHeight - cardHeight - VIEWPORT_MARGIN_PX,
  );
  const pointer = cardHeight
    ? clamp(targetCenter - top, POINTER_INSET_PX, cardHeight - POINTER_INSET_PX)
    : 'center';

  return (
    <RootPortal>
      <CoachHighlight rect={highlightRect ?? anchor.rect} />
      <div className="fixed z-popup" style={{ left: anchor.left, top }}>
        <CoachCard
          {...card}
          ref={cardRef}
          pointer={pointer}
          style={{ maxHeight: position.maxHeight }}
        />
      </div>
    </RootPortal>
  );
};
