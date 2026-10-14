import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Switch } from '../../components/fields/Switch';
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
    isNewUser,
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
  const { onUpdate } = useInteractivePopup(RAIL_POPUP_GROUP);
  const { events } = useRouter();

  // Claiming the group closes whatever rail popup was already open when the
  // tour started — a Support menu opened just before the hover that started it
  // would otherwise sit stranded under the card. Held for the whole run rather
  // than released for the dock step: the rail is inert for the duration, so no
  // trigger in the group is reachable and the dock step teaches the pinning
  // gesture for later instead of inviting the tray open now.
  useEffect(() => {
    onUpdate(isRunning);
  }, [isRunning, onUpdate]);

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

  // A step whose target went away leaves an inert rail with no card and no
  // visible way out, so the step is dropped; past the last one that ends the
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
    <CoachPopover
      anchor={anchor}
      isOpen
      stepKey={step.id}
      highlight={step.highlight}
      align={step.align}
      dialogLabel="Sidebar tour"
      message={(isNewUser && step.newUserMessage) || step.message}
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
          <CoachPrimaryButton onClick={isLastStep ? finish : next}>
            {isLastStep ? 'Got it' : 'Next'}
          </CoachPrimaryButton>
        </>
      }
    />
  );
};
