import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Switch } from '../../components/fields/Switch';
import { RootPortal } from '../../components/tooltips/Portal';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { useSidebarCompact } from '../../hooks/useSidebarCompact';
import { RAIL_POPUP_GROUP } from '../../components/sidebar/common';
import { cloudinarySidebarTourDockDrag } from '../../lib/image';
import {
  CoachDemoVideo,
  CoachPrimaryButton,
  SkipTourButton,
} from './CoachCard';
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
  const { value: isCompact, toggle: toggleCompact } = useSidebarCompact();
  const anchor = useCoachAnchor(step?.target, isRunning);
  const { isOpen, isGroupOpen, onUpdate } =
    useInteractivePopup(RAIL_POPUP_GROUP);
  const { events } = useRouter();
  const wasGroupOpenRef = useRef(false);
  const hasFocusedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // The dock step's whole sentence is "or add one from the 3-dot menu", so opening
  // that menu is the lesson being followed, not the user reaching past the
  // tour. The tour leaves the rail's popup group for that one step: the tray
  // then opens beside the card instead of evicting it, and the run survives.
  const shouldHoldPopupGroup = isRunning && step?.id !== 'dock';

  useEffect(() => {
    onUpdate(shouldHoldPopupGroup);
  }, [onUpdate, shouldHoldPopupGroup]);

  // Another rail popup taking the group means the user reached past the tour
  // for something else, rather than leaving a card stranded under the dropdown
  // that just opened. It is not a dismissal, so the tour is owed another run.
  // Gated on wanting the group rather than on the tour running: stepping onto
  // the dock step releases it deliberately, and that must not read as an
  // eviction.
  useEffect(() => {
    if (isOpen) {
      wasGroupOpenRef.current = true;
      return;
    }

    if (wasGroupOpenRef.current && shouldHoldPopupGroup) {
      interrupt('popup');
    }

    wasGroupOpenRef.current = false;
  }, [interrupt, isOpen, shouldHoldPopupGroup]);

  // A real navigation takes the page the rail was pointing at away, so the tour
  // goes with it rather than riding along to a ring that no longer means
  // anything. Only a real one, though: `routeChangeStart` also fires for
  // rewrites the user never asked for — useNotificationParams replaces the URL
  // to strip notification params on mount, useSquadNavigation strips its own
  // query, and the feed's post modal pushes shallow. Each of those would end a
  // run and log a user reaching past the tour when nobody reached anywhere.
  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const onNavigate = (url?: string, options?: { shallow?: boolean }) => {
      if (options?.shallow) {
        return;
      }

      const [nextPath] = url?.split(/[?#]/) ?? [];

      if (nextPath && nextPath === globalThis.window?.location.pathname) {
        return;
      }

      interrupt('navigation');
    };

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

      // The dock step invites the ••• tray open beside the card, and the tray
      // has no Escape handler of its own to mark the key as handled. Without
      // this, the natural way to close the tray also skips the tour, which is
      // the one ending meant to be final.
      if (isGroupOpen) {
        return;
      }

      skip();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isGroupOpen, isRunning, skip]);

  // The card claims `aria-modal`, and the rail behind it is inert, but the page
  // behind the scrim is still tabbable. Wrapping Tab at the card's own edges is
  // what makes that claim true for a keyboard.
  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current;

      if (event.key !== 'Tab' || !container) {
        return;
      }

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isLeavingBackwards = event.shiftKey && active === first;
      const isLeavingForwards = !event.shiftKey && active === last;

      if (!container.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (isLeavingBackwards || isLeavingForwards) {
        event.preventDefault();
        (isLeavingBackwards ? last : first).focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRunning]);

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
        containerRef={containerRef}
        isOpen
        stepKey={step.id}
        highlight={step.highlight}
        align={step.align}
        dialogLabel="Sidebar tour"
        isModal
        message={step.message}
        media={
          step.media === 'dockDrag' && (
            <CoachDemoVideo src={cloudinarySidebarTourDockDrag} />
          )
        }
        progress={{ total: stepCount, active: stepIndex }}
        control={
          step.extra === 'compactSwitch' && (
            <Switch
              inputId={COMPACT_SWITCH_ID}
              name={COMPACT_SWITCH_ID}
              checked={isCompact}
              onToggle={() => toggleCompact().catch(() => undefined)}
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
