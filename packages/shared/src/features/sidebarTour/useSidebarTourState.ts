import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { LogEvent } from '../../lib/log';
import { resolveSidebarTourSteps } from './steps';
import type {
  SidebarTourInterruptReason,
  SidebarTourStep,
  SidebarTourTrigger,
} from './types';

export const SIDEBAR_TOUR_EXISTING_USER_CUTOFF = Date.UTC(2026, 8, 8);

export interface SidebarTourState {
  // v2 rail, signed in, and the seen flag has loaded.
  isEnabled: boolean;
  // Joined after the rail shipped, so nothing moved for them: the tour speaks
  // to a first visit rather than to a change.
  isNewUser: boolean;
  isRunning: boolean;
  step: SidebarTourStep | null;
  stepIndex: number;
  stepCount: number;
  // Not seen yet, so the first hover on the rail starts it.
  canAutoStart: boolean;
  start: (trigger: SidebarTourTrigger) => void;
  next: () => void;
  skip: () => void;
  finish: () => void;
  interrupt: (reason: SidebarTourInterruptReason) => void;
  dropStep: () => void;
}

export const useSidebarTourState = (): SidebarTourState => {
  const { isAuthReady, user } = useAuthContext();
  const { isV2 } = useLayoutVariant();
  const { logEvent } = useLogContext();

  const isEligible = isV2 && isAuthReady && !!user;

  // The tour runs once per person, not once per browser, so its seen-flag is a
  // user action like every other one-shot of this kind in the house:
  // ExistingUserSeenStreaks, HasSeenTags, ViewedIntroQuests. SettingsFlags is
  // the wrong home — `flags` is a structured GraphQL input, so a key the API has
  // not declared fails validation and takes every other setting in the same
  // payload down with it.
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const isTourSeen = checkHasCompleted(ActionType.SidebarTourSeen);

  // Nothing renders until the seen flag has come back, so a tour that was
  // already seen never flashes on the way to being read.
  const isEnabled = isEligible && isActionsFetched;

  const [steps, setSteps] = useState<SidebarTourStep[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Logging out or losing eligibility mid-tour must not leave a run parked and
  // ready to resume the moment eligibility comes back. The seen flag stays
  // untouched: the user never acted on it.
  useEffect(() => {
    if (isEnabled || !steps) {
      return;
    }

    setSteps(null);
    setStepIndex(0);
  }, [isEnabled, steps]);

  // Everyone who signed up before September 8, 2026 came from the old sidebar.
  const isExistingUser =
    !!user?.createdAt &&
    new Date(user.createdAt).getTime() < SIDEBAR_TOUR_EXISTING_USER_CUTOFF;

  const step = steps?.[stepIndex] ?? null;
  const isRunning = isEnabled && !!step;

  // Belt and braces alongside the stored flag: if the write fails, react-query
  // rolls the flag back, and without this the next rail hover would bring the
  // tour straight back after the user dismissed it.
  const [hasEndedThisSession, setHasEndedThisSession] = useState(false);

  const clearRun = useCallback(() => {
    setSteps(null);
    setStepIndex(0);
    setHasEndedThisSession(true);
  }, []);

  // Shown once: any answer to the card, a single Next included, means it was
  // read, so it never comes back on its own.
  const markSeen = useCallback(() => {
    completeAction(ActionType.SidebarTourSeen).catch(() => undefined);
  }, [completeAction]);

  const end = useCallback(() => {
    clearRun();
    markSeen();
  }, [clearRun, markSeen]);

  const start = useCallback(
    (trigger: SidebarTourTrigger) => {
      if (!isEnabled) {
        return;
      }

      const resolved = resolveSidebarTourSteps();

      if (!resolved.length) {
        return;
      }

      setSteps(resolved);
      setStepIndex(0);
      setHasEndedThisSession(false);
      logEvent({
        event_name: LogEvent.StartSidebarTour,
        extra: JSON.stringify({ trigger }),
      });
      logEvent({
        event_name: LogEvent.ViewSidebarTourStep,
        extra: JSON.stringify({ step: resolved[0].id }),
      });
    },
    [isEnabled, logEvent],
  );

  const advance = useCallback((): boolean => {
    const nextIndex = stepIndex + 1;

    if (!steps || nextIndex >= steps.length) {
      return false;
    }

    setStepIndex(nextIndex);
    logEvent({
      event_name: LogEvent.ViewSidebarTourStep,
      extra: JSON.stringify({ step: steps[nextIndex].id }),
    });
    return true;
  }, [logEvent, stepIndex, steps]);

  const next = useCallback(() => {
    if (!steps) {
      return;
    }

    if (advance()) {
      markSeen();
      return;
    }

    logEvent({ event_name: LogEvent.CompleteSidebarTour });
    end();
  }, [advance, end, logEvent, markSeen, steps]);

  // A step whose target went away is dropped, not ended on: the tour still has
  // something to say. Past the last one it has run its course, so this is the
  // one unchosen ending that does retire the tour.
  const dropStep = useCallback(() => {
    if (!step || advance()) {
      return;
    }

    logEvent({
      event_name: LogEvent.EndSidebarTour,
      extra: JSON.stringify({ step: step.id, reason: 'target_lost' }),
    });
    end();
  }, [advance, end, logEvent, step]);

  // A modal, a navigation or another rail popup took the screen. Unless the
  // user already answered the card, the seen flag stays unwritten so the tour
  // comes back on a later load, and the session flag is what stops the next
  // rail hover restarting it under whatever just took over: SidebarDesktopV2
  // lives in MainLayout and does not unmount on navigation.
  const interrupt = useCallback(
    (reason: SidebarTourInterruptReason) => {
      if (!step) {
        return;
      }

      logEvent({
        event_name: LogEvent.EndSidebarTour,
        extra: JSON.stringify({ step: step.id, reason }),
      });
      clearRun();
    },
    [clearRun, logEvent, step],
  );

  const skip = useCallback(() => {
    if (!step) {
      return;
    }

    logEvent({
      event_name: LogEvent.SkipSidebarTour,
      extra: JSON.stringify({ step: step.id }),
    });
    end();
  }, [end, logEvent, step]);

  const finish = useCallback(() => {
    logEvent({ event_name: LogEvent.CompleteSidebarTour });
    end();
  }, [end, logEvent]);

  return {
    isEnabled,
    isNewUser: !isExistingUser,
    isRunning,
    step: isRunning ? step : null,
    stepIndex,
    stepCount: steps?.length ?? 0,
    canAutoStart: isEnabled && !isTourSeen && !hasEndedThisSession && !steps,
    start,
    next,
    skip,
    finish,
    interrupt,
    dropStep,
  };
};
