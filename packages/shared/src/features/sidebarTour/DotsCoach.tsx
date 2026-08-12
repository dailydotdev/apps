import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { useOutsideClick } from '../../hooks/utils/useOutsideClick';
import { CoachPopover } from './CoachPopover';
import { DOCK_CUSTOMIZE_SELECTOR } from './steps';
import { useCoachAnchor } from './useCoachAnchor';
import type { SidebarTourState } from './useSidebarTourState';
import { COACH_EXPOSURE_DWELL_MS } from './useSidebarTourState';

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
  onClose: () => void;
}

export const useDotsCoach = (
  coach: SidebarTourState['dotsCoach'],
): DotsCoachState => {
  const [isOpen, setIsOpen] = useState(false);
  const { isActive, onShown, onRetire } = coach;
  const onShownRef = useRef(onShown);
  onShownRef.current = onShown;

  useEffect(() => {
    if (!isActive) {
      setIsOpen(false);
    }
  }, [isActive]);

  // The card opens the moment the pointer arrives, but the dock sits under the
  // rail's scroll path: a pointer on its way to the Support button would burn a
  // third of the budget on a sentence nobody read.
  useEffect(() => {
    if (!isOpen || !isActive) {
      return undefined;
    }

    const timer = setTimeout(
      () => onShownRef.current(),
      COACH_EXPOSURE_DWELL_MS,
    );
    return () => clearTimeout(timer);
  }, [isActive, isOpen]);

  const onCustomizeInteraction = useCallback(
    (interaction: DockCustomizeInteraction) => {
      if (!isActive) {
        return;
      }

      // Opening the tray IS the lesson, so it retires the card for good.
      if (interaction === 'open') {
        setIsOpen(false);
        onRetire();
        return;
      }

      if (isOpen) {
        return;
      }

      setIsOpen(true);
    },
    [isActive, isOpen, onRetire],
  );

  // "Got it" is the strongest comprehension signal there is, so it retires the
  // lesson. An outside click only means the pointer moved on, and the exposure
  // it already counted is the whole cost of that.
  const onDismiss = useCallback(() => {
    setIsOpen(false);
    onRetire();
  }, [onRetire]);

  const onClose = useCallback(() => setIsOpen(false), []);

  return {
    isOpen: isOpen && isActive,
    isCustomizeForcedVisible: isOpen && isActive,
    onCustomizeInteraction,
    onDismiss,
    onClose,
  };
};

export const DotsCoach = ({
  state,
}: {
  state: DotsCoachState;
}): ReactElement | null => {
  const anchor = useCoachAnchor(DOCK_CUSTOMIZE_SELECTOR, state.isOpen);
  const cardRef = useRef<HTMLDivElement>(null);

  useOutsideClick(cardRef, state.onClose, state.isOpen);

  return (
    <CoachPopover
      anchor={anchor}
      containerRef={cardRef}
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
