import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
import usePersistentContext from '../../hooks/usePersistentContext';
import { featureSidebarTour } from '../../lib/featureManagement';
import { LogEvent } from '../../lib/log';
import { resolveSidebarTourSteps } from './steps';
import type {
  SidebarPinCoachMethod,
  SidebarTourInterruptReason,
  SidebarTourStep,
  SidebarTourTrigger,
} from './types';

// Device-local, on purpose. The idiomatic cross-device home for flags of
// exactly this kind is `useActions` / `ActionType` (src/graphql/actions.ts),
// which already carries ExistingUserSeenStreaks, CollectionsIntro and
// FirstShortcutsSession. That needs a new ActionType on daily-api; adding an
// undeclared key to SettingsFlags instead makes updateUserSettings fail
// validation and takes every other setting in the payload down with it. Until
// the backend field lands, everything here rides idb-keyval, so the whole swap
// is this one file.
export const SIDEBAR_TOUR_SEEN_KEY = 'sidebar_tour_seen';
export const SIDEBAR_PIN_COACH_KEY = 'sidebar_pin_coach';
export const SIDEBAR_DOTS_COACH_KEY = 'sidebar_dots_coach';

// Both ambient coaches retire on success or after this many exposures,
// whichever comes first. Success writes the cap so one counter says both.
export const COACH_MAX_EXPOSURES = 3;

// A card that flashed past under a travelling pointer taught nobody anything,
// so both ambient coaches only charge an exposure once one has sat there.
export const COACH_EXPOSURE_DWELL_MS = 700;

// Users who joined before the v2 rail shipped are the only ones whose muscle
// memory it broke, so they are the only ones the tour runs for on its own.
// This is the fixed date v2 shipped, standing in for "when this user actually
// got the v2 rail", which the layout rollout is what really decides. If that
// ramp ever runs gradually, the cutoff belongs in the GrowthBook flag payload
// so it can be tuned mid-ramp instead of waiting on a release.
export const SIDEBAR_V2_ROLLOUT_DATE = new Date('2026-08-01T00:00:00.000Z');

export interface SidebarCoachState {
  isActive: boolean;
  onShown: () => void;
  onRetire: () => void;
}

interface CoachCounter {
  count: number;
  isFetched: boolean;
  increment: () => void;
  retire: () => void;
}

// usePersistentContext has no functional updater, so two exposures landing
// before the cache catches up would both write `stored + 1` and one would be
// lost. The ref keeps the running count authoritative in between.
const useCoachCounter = (key: string): CoachCounter => {
  const [stored, setStored, isFetched] = usePersistentContext<number>(key, 0);
  const countRef = useRef(0);
  const count = Math.max(countRef.current, stored ?? 0);
  countRef.current = count;

  const write = useCallback(
    (next: number) => {
      countRef.current = next;
      setStored(next).catch(() => undefined);
    },
    [setStored],
  );

  const increment = useCallback(() => write(countRef.current + 1), [write]);
  const retire = useCallback(() => write(COACH_MAX_EXPOSURES), [write]);

  return useMemo(
    () => ({ count, isFetched, increment, retire }),
    [count, increment, isFetched, retire],
  );
};

export interface SidebarTourState {
  // Flag on, v2 rail, signed in, and the persisted flags have loaded.
  isEnabled: boolean;
  isRunning: boolean;
  step: SidebarTourStep | null;
  stepIndex: number;
  stepCount: number;
  canAutoStart: boolean;
  start: (trigger: SidebarTourTrigger) => void;
  next: () => void;
  skip: () => void;
  finish: () => void;
  interrupt: (reason: SidebarTourInterruptReason) => void;
  dropStep: () => void;
  pinCoach: SidebarCoachState & {
    // At least one exposure was actually counted, so the lesson had a chance to
    // be the reason for whatever happens next.
    hasBeenShown: boolean;
    onSuccess: (method: SidebarPinCoachMethod) => void;
  };
  dotsCoach: SidebarCoachState;
}

export const useSidebarTourState = (): SidebarTourState => {
  const { isAuthReady, user } = useAuthContext();
  const { isV2 } = useLayoutVariant();
  const { logEvent } = useLogContext();

  const shouldEvaluate = isV2 && isAuthReady && !!user;
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: featureSidebarTour,
    shouldEvaluate,
  });

  const [isTourSeen, setTourSeen, isTourSeenFetched] =
    usePersistentContext<boolean>(SIDEBAR_TOUR_SEEN_KEY, false);
  const pinCounter = useCoachCounter(SIDEBAR_PIN_COACH_KEY);
  const dotsCounter = useCoachCounter(SIDEBAR_DOTS_COACH_KEY);

  // Nothing renders until every flag has come back from storage, so a tour that
  // was already seen never flashes on the way to being read.
  const isFetched =
    isTourSeenFetched && pinCounter.isFetched && dotsCounter.isFetched;
  const isEnabled = shouldEvaluate && isFeatureEnabled && isFetched;

  const [steps, setSteps] = useState<SidebarTourStep[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Logging out or losing the flag mid-tour must not leave a run parked and
  // ready to resume the moment eligibility comes back. The seen flag stays
  // untouched: the user never acted on it.
  useEffect(() => {
    if (isEnabled || !steps) {
      return;
    }

    setSteps(null);
    setStepIndex(0);
  }, [isEnabled, steps]);

  const isExistingUser =
    !!user?.createdAt && new Date(user.createdAt) < SIDEBAR_V2_ROLLOUT_DATE;

  const step = steps?.[stepIndex] ?? null;
  const isRunning = isEnabled && !!step;

  // Belt and braces alongside the stored flag: if the write fails, react-query
  // rolls the flag back, and without this the auto-start timer would bring the
  // tour straight back after the user dismissed it.
  const [hasEndedThisSession, setHasEndedThisSession] = useState(false);

  const clearRun = useCallback(() => {
    setSteps(null);
    setStepIndex(0);
    setHasEndedThisSession(true);
  }, []);

  const end = useCallback(() => {
    clearRun();
    setTourSeen(true).catch(() => undefined);
  }, [clearRun, setTourSeen]);

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
    if (!steps || advance()) {
      return;
    }

    logEvent({ event_name: LogEvent.CompleteSidebarTour });
    end();
  }, [advance, end, logEvent, steps]);

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

  // A modal, a navigation or another rail popup took the screen. The seen flag
  // stays unwritten so the tour comes back on a later load, and the session flag
  // is what stops the auto-start timer re-firing under whatever just took over:
  // SidebarDesktopV2 lives in MainLayout and does not unmount on navigation.
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

  // The ambient lessons are for people who never used the old sidebar: nothing
  // moved for them, so there is nothing to un-learn, only something to discover.
  const isAmbientAudience = isEnabled && !isExistingUser && !isRunning;

  const pinCoach = useMemo(
    () => ({
      isActive: isAmbientAudience && pinCounter.count < COACH_MAX_EXPOSURES,
      hasBeenShown: pinCounter.count > 0,
      onShown: () => {
        pinCounter.increment();
        logEvent({ event_name: LogEvent.ViewSidebarPinCoach });
      },
      onRetire: pinCounter.retire,
      onSuccess: (method: SidebarPinCoachMethod) => {
        pinCounter.retire();
        logEvent({
          event_name: LogEvent.SidebarPinCoachSuccess,
          extra: JSON.stringify({ method }),
        });
      },
    }),
    [isAmbientAudience, logEvent, pinCounter],
  );

  const dotsCoach = useMemo(
    () => ({
      isActive: isAmbientAudience && dotsCounter.count < COACH_MAX_EXPOSURES,
      onShown: () => {
        dotsCounter.increment();
        logEvent({ event_name: LogEvent.ViewSidebarDotsCoach });
      },
      onRetire: dotsCounter.retire,
    }),
    [dotsCounter, isAmbientAudience, logEvent],
  );

  return {
    isEnabled,
    isRunning,
    step: isRunning ? step : null,
    stepIndex,
    stepCount: steps?.length ?? 0,
    canAutoStart:
      isEnabled &&
      isExistingUser &&
      !isTourSeen &&
      !hasEndedThisSession &&
      !steps,
    start,
    next,
    skip,
    finish,
    interrupt,
    dropStep,
    pinCoach,
    dotsCoach,
  };
};
