import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useSidebarDragState } from '../../components/sidebar/useSidebarDragState';
import { useSidebarShortcutItems } from '../../components/sidebar/SidebarShortcutsDock';
import { CoachPopover } from './CoachPopover';
import { DOCK_CUSTOMIZE_SELECTOR, PINNABLE_ROW_SELECTOR } from './steps';
import { useCoachAnchor } from './useCoachAnchor';
import type { SidebarTourState } from './useSidebarTourState';

const PIN_COACH_MESSAGE =
  'Drag anything from this panel to the dock, or use its pin button.';

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
  const { onSuccess } = coach;
  const isCoachActive = coach.isActive;
  const shortcutCount = shortcuts.length;
  const shortcutCountRef = useRef(shortcutCount);
  const hasCountBaselineRef = useRef(false);
  // A drop lands the new shortcut a tick after the drag ends, so the method is
  // read from whether a drag ran at all rather than from the live flag.
  const didDragRef = useRef(false);

  useEffect(() => {
    if (isDragging) {
      didDragRef.current = true;
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
    // Growth still has to be attributable to the lesson: a drag that just
    // happened, or a pin button in the open panel.
    const isAttributable = isPanelOpen || didDragRef.current;

    if (!grew || !isCoachActive || !isAttributable) {
      return;
    }

    onSuccess(didDragRef.current ? 'drag' : 'button');
    didDragRef.current = false;
  }, [
    areShortcutsLoaded,
    isCoachActive,
    isPanelOpen,
    onSuccess,
    shortcutCount,
  ]);

  const isEligible = coach.isActive && isPanelOpen && !isDragging;
  const anchor = useCoachAnchor(PINNABLE_ROW_SELECTOR, isEligible);
  const dockAnchor = useCoachAnchor(DOCK_CUSTOMIZE_SELECTOR, isEligible);
  const isVisible = isEligible && !!anchor.rect;
  const wasVisibleRef = useRef(false);
  const { onShown } = coach;

  useEffect(() => {
    if (!isVisible) {
      wasVisibleRef.current = false;
      return;
    }

    if (wasVisibleRef.current) {
      return;
    }

    wasVisibleRef.current = true;
    onShown();
  }, [isVisible, onShown]);

  return (
    <CoachPopover
      anchor={anchor}
      isOpen={isVisible}
      highlightRect={dockAnchor.rect}
      message={PIN_COACH_MESSAGE}
    />
  );
};
