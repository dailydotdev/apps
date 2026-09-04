import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useSidebarDragState } from '../../components/sidebar/useSidebarDragState';
import { useSidebarShortcutItems } from '../../components/sidebar/SidebarShortcutsDock';
import { CoachPopover } from './CoachPopover';
import { DOCK_CUSTOMIZE_SELECTOR, PINNABLE_ROW_SELECTOR } from './steps';
import { useCoachAnchor } from './useCoachAnchor';
import type { SidebarTourState } from './useSidebarTourState';
import { COACH_EXPOSURE_DWELL_MS } from './useSidebarTourState';

const PIN_COACH_MESSAGE =
  'Drag anything from this panel to the dock, or use its pin button.';

// A drop lands the new shortcut a tick after the drag ends. Beyond this the
// growth belongs to something else the user did later, not to that drag.
const DRAG_ATTRIBUTION_MS = 1000;

// Taught at the moment it can be acted on: the first times a panel is open, the
// card sits on its first pinnable row and the dock lights up as the
// destination. Retires on the first pin or after three panel opens.
export const PinCoach = ({
  coach,
  isPanelOpen,
}: {
  coach: SidebarTourState['pinCoach'];
  isPanelOpen: boolean;
}): ReactElement | null => {
  const { isDragging } = useSidebarDragState();
  const { resolved: shortcuts, isFetched: areShortcutsLoaded } =
    useSidebarShortcutItems();
  const { onSuccess, hasBeenShown } = coach;
  const isCoachActive = coach.isActive;
  const shortcutCount = shortcuts.length;
  const shortcutCountRef = useRef(shortcutCount);
  const hasCountBaselineRef = useRef(false);
  // When the last drag ended, so the method can be read after the drag flag has
  // already gone back down. A remove-then-Undo minutes later must not inherit it.
  const dragEndedAtRef = useRef(0);
  const wasDraggingRef = useRef(false);

  useEffect(() => {
    if (isDragging) {
      wasDraggingRef.current = true;
      return;
    }

    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      dragEndedAtRef.current = Date.now();
    }
  }, [isDragging]);

  useEffect(() => {
    // The dock's store starts empty and fills in from storage, so the count
    // climbing is only a pin once storage has answered. The first reading after
    // that is the baseline, never a success, otherwise hydrating an existing
    // dock while a panel happens to be open would retire the lesson unearned.
    if (!areShortcutsLoaded) {
      return;
    }

    if (!hasCountBaselineRef.current) {
      hasCountBaselineRef.current = true;
      shortcutCountRef.current = shortcutCount;
      return;
    }

    const grew = shortcutCount > shortcutCountRef.current;
    shortcutCountRef.current = shortcutCount;
    const isFromDrag =
      Date.now() - dragEndedAtRef.current < DRAG_ATTRIBUTION_MS;
    // Growth still has to be attributable to the lesson: a drag that just
    // happened, or a pin button in the open panel. And an active coach only
    // means the budget is unspent, so the card also has to have been counted as
    // shown at least once, or a pin the user was always going to make would
    // retire a lesson that never appeared.
    const isAttributable = isPanelOpen || isFromDrag;

    if (!grew || !isCoachActive || !hasBeenShown || !isAttributable) {
      return;
    }

    onSuccess(isFromDrag ? 'drag' : 'button');
    dragEndedAtRef.current = 0;
  }, [
    areShortcutsLoaded,
    hasBeenShown,
    isCoachActive,
    isPanelOpen,
    onSuccess,
    shortcutCount,
  ]);

  const isEligible = coach.isActive && isPanelOpen && !isDragging;
  const anchor = useCoachAnchor(PINNABLE_ROW_SELECTOR, isEligible);
  const dockAnchor = useCoachAnchor(DOCK_CUSTOMIZE_SELECTOR, isEligible);
  const isVisible = isEligible && !!anchor.rect;
  const { onShown } = coach;
  const onShownRef = useRef(onShown);
  onShownRef.current = onShown;

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const timer = setTimeout(
      () => onShownRef.current(),
      COACH_EXPOSURE_DWELL_MS,
    );
    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <CoachPopover
      anchor={anchor}
      isOpen={isVisible}
      highlightRect={dockAnchor.rect}
      message={PIN_COACH_MESSAGE}
    />
  );
};
