import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Switch } from '../../components/fields/Switch';
import { RootPortal } from '../../components/tooltips/Portal';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { useSettingsBooleanFlag } from '../../hooks/useSettingsBooleanFlag';
import { RAIL_POPUP_GROUP } from '../../components/sidebar/common';
import { CoachPrimaryButton, SkipTourButton } from './CoachCard';
import { CoachPopover } from './CoachPopover';
import { useCoachAnchor } from './useCoachAnchor';
import type { SidebarTourState } from './useSidebarTourState';

const COMPACT_SWITCH_ID = 'sidebar-tour-compact';
// How long the target may stay unresolvable before the step is given up on.
// A window shrink can refold the rail into the More menu or stop the dock
// fitting at all.
const LOST_TARGET_MS = 600;

export const SidebarTourOverlay = ({
  tour,
}: {
  tour: SidebarTourState;
}): ReactElement | null => {
  const {
    isRunning,
    step,
    stepIndex,
    stepCount,
    skip,
    next,
    finish,
    interrupt,
    dropStep,
  } = tour;
  const { value: isCompact, set: setCompact } =
    useSettingsBooleanFlag('sidebarCompact');
  const anchor = useCoachAnchor(step?.target, isRunning);
  const { isOpen, onUpdate } = useInteractivePopup(RAIL_POPUP_GROUP);
  const { events } = useRouter();
  const wasGroupOpenRef = useRef(false);
  const hasFocusedRef = useRef(false);

  useEffect(() => {
    onUpdate(isRunning);
  }, [isRunning, onUpdate]);

  // Another rail popup taking the group means the user reached past the tour
  // for something else, rather than leaving a card stranded under the dropdown
  // that just opened. It is not a dismissal, so the tour is owed another run.
  useEffect(() => {
    if (isOpen) {
      wasGroupOpenRef.current = true;
      return;
    }

    if (wasGroupOpenRef.current && isRunning) {
      interrupt('popup');
    }

    wasGroupOpenRef.current = false;
  }, [interrupt, isOpen, isRunning]);

  // The rail stays clickable above the scrim, so a tab or shortcut click
  // navigates out from under the tour. Without this the scrim and card ride
  // along to the new page pointing at a ring that no longer means anything.
  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const onNavigate = () => interrupt('navigation');
    events.on('routeChangeStart', onNavigate);
    return () => events.off('routeChangeStart', onNavigate);
  }, [events, interrupt, isRunning]);

  // A step whose target went away leaves a full-screen scrim with no card and
  // no visible way out, so the step is dropped; past the last one that ends the
  // tour.
  useEffect(() => {
    if (!isRunning || anchor.rect) {
      return undefined;
    }

    const timer = setTimeout(dropStep, LOST_TARGET_MS);
    return () => clearTimeout(timer);
  }, [anchor.rect, dropStep, isRunning]);

  useEffect(() => {
    if (!isRunning) {
      hasFocusedRef.current = false;
    }
  }, [isRunning]);

  // A callback ref, because the button mounts a render after the anchor
  // resolves: an effect keyed on the tour running has already gone by, and the
  // button survives step changes, so it is only ever focused once per run.
  const focusPrimary = useCallback((node: HTMLButtonElement | null) => {
    if (!node || hasFocusedRef.current) {
      return;
    }

    hasFocusedRef.current = true;
    node.focus();
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== 'Escape') {
        return;
      }

      skip();
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
        dialogLabel="Sidebar tour"
        message={step.message}
        progress={{ total: stepCount, active: stepIndex }}
        control={
          step.extra === 'compactSwitch' && (
            <Switch
              inputId={COMPACT_SWITCH_ID}
              name={COMPACT_SWITCH_ID}
              checked={isCompact}
              onToggle={() => setCompact(!isCompact).catch(() => undefined)}
            >
              Compact mode
            </Switch>
          )
        }
        actions={
          <>
            <SkipTourButton onClick={skip} />
            <CoachPrimaryButton
              buttonRef={focusPrimary}
              onClick={isLastStep ? finish : next}
            >
              {isLastStep ? 'Got it' : 'Next'}
            </CoachPrimaryButton>
          </>
        }
      />
    </>
  );
};
