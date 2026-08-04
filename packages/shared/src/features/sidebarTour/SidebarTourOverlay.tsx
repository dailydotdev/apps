import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { Switch } from '../../components/fields/Switch';
import { RootPortal } from '../../components/tooltips/Portal';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { useSettingsBooleanFlag } from '../../hooks/useSettingsBooleanFlag';
import { CoachPrimaryButton, SkipTourButton } from './CoachCard';
import { CoachPopover } from './CoachPopover';
import { useCoachAnchor } from './useCoachAnchor';
import type { SidebarTourState } from './useSidebarTourState';

// The rail's shared popup group. Joining it makes the tour mutually exclusive
// with Support, Settings, the customize tray and the More menu, so a coach card
// can never sit under one of those dropdowns.
export const RAIL_POPUP_GROUP = 'sidebar-rail';

const COMPACT_SWITCH_ID = 'sidebar-tour-compact';

export const SidebarTourOverlay = ({
  tour,
}: {
  tour: SidebarTourState;
}): ReactElement | null => {
  const { isRunning, step, stepIndex, stepCount, skip, next, finish } = tour;
  const { value: isCompact, set: setCompact } =
    useSettingsBooleanFlag('sidebarCompact');
  const anchor = useCoachAnchor(step?.target, isRunning);
  const { isOpen, onUpdate } = useInteractivePopup(RAIL_POPUP_GROUP);
  const wasGroupOpenRef = useRef(false);

  useEffect(() => {
    onUpdate(isRunning);
  }, [isRunning, onUpdate]);

  // Another rail popup taking the group means the user reached past the tour
  // for something else; treat that as skipping rather than leaving a card
  // stranded under the dropdown that just opened.
  useEffect(() => {
    if (isOpen) {
      wasGroupOpenRef.current = true;
      return;
    }

    if (wasGroupOpenRef.current && isRunning) {
      skip();
    }

    wasGroupOpenRef.current = false;
  }, [isOpen, isRunning, skip]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        skip();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRunning, skip]);

  if (!isRunning || !step) {
    return null;
  }

  const isLastStep = stepIndex === stepCount - 1;

  return (
    <>
      <RootPortal>
        {/* The spotlight. It sits above the page chrome and below the rail,
          which the sidebar lifts for the duration of the tour. Clicking it does
          nothing: only Skip tour, the primary button and Escape end the tour. */}
        <div
          aria-hidden
          data-testid="sidebar-tour-scrim"
          className="fixed inset-0 z-sidebarOverlay bg-overlay-primary-pepper"
        />
      </RootPortal>
      <CoachPopover
        anchor={anchor}
        isOpen
        stepKey={step.id}
        message={step.message}
        progress={{ total: stepCount, active: stepIndex }}
        control={
          step.extra === 'compactSwitch' && (
            <Switch
              inputId={COMPACT_SWITCH_ID}
              name={COMPACT_SWITCH_ID}
              checked={isCompact}
              onToggle={() => setCompact(!isCompact)}
            >
              Compact mode
            </Switch>
          )
        }
        actions={
          <>
            <SkipTourButton onClick={skip} />
            <CoachPrimaryButton onClick={isLastStep ? finish : next}>
              {isLastStep ? 'Got it' : 'Next'}
            </CoachPrimaryButton>
          </>
        }
      />
    </>
  );
};
