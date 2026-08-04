import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { CoachPopover } from './CoachPopover';
import { DOCK_CUSTOMIZE_SELECTOR } from './steps';
import { useCoachAnchor } from './useCoachAnchor';
import type { SidebarTourState } from './useSidebarTourState';

const DOTS_COACH_MESSAGE = 'Add, reorder and remove your shortcuts from here.';

export type DockCustomizeInteraction = 'hover' | 'open';

export interface DotsCoachState {
  isOpen: boolean;
  // Whether the dock must keep its ••• button painted: it is hover-only while
  // the dock is empty, and reading the card means moving the pointer off the
  // rail, which would otherwise fade the thing the card points at.
  isCustomizeForcedVisible: boolean;
  onCustomizeInteraction: (interaction: DockCustomizeInteraction) => void;
  onDismiss: () => void;
}

export const useDotsCoach = (
  coach: SidebarTourState['dotsCoach'],
): DotsCoachState => {
  const [isOpen, setIsOpen] = useState(false);
  const { isActive, onShown, onRetire } = coach;

  useEffect(() => {
    if (!isActive) {
      setIsOpen(false);
    }
  }, [isActive]);

  const onCustomizeInteraction = useCallback(
    (interaction: DockCustomizeInteraction) => {
      // Opening the tray IS the lesson, so it retires the card for good.
      if (interaction === 'open') {
        setIsOpen(false);
        onRetire();
        return;
      }

      if (!isActive || isOpen) {
        return;
      }

      setIsOpen(true);
      onShown();
    },
    [isActive, isOpen, onRetire, onShown],
  );

  return {
    isOpen: isOpen && isActive,
    isCustomizeForcedVisible: isOpen && isActive,
    onCustomizeInteraction,
    onDismiss: () => setIsOpen(false),
  };
};

export const DotsCoach = ({
  state,
}: {
  state: DotsCoachState;
}): ReactElement | null => {
  const anchor = useCoachAnchor(DOCK_CUSTOMIZE_SELECTOR, state.isOpen);

  return (
    <CoachPopover
      anchor={anchor}
      isOpen={state.isOpen}
      message={DOTS_COACH_MESSAGE}
      actions={
        <Button
          type="button"
          className="active:scale-95"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={state.onDismiss}
        >
          Got it
        </Button>
      }
    />
  );
};
