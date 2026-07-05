import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GivebackGiftDockHandle } from './GivebackGiftDock';
import { buildGivebackMilestonePrompt } from '../givebackInvitePrompts';
import type {
  ContributionActionCompleted,
  ContributionMilestone,
} from '../types';
import {
  CONTRIBUTION_ACTION_COMPLETED_SUBSCRIPTION,
  CONTRIBUTION_LAST_MILESTONE_QUERY,
} from '../graphql';
import useSubscription from '../../../hooks/useSubscription';
import { useLogContext } from '../../../contexts/LogContext';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { LogEvent } from '../../../lib/log';
import { APP_KEY_PREFIX } from '../../../lib/storage';

// Poll the cached milestone endpoint on a relaxed cadence. Milestones are rare,
// so we only need to catch a crossing within a minute or so.
const MILESTONE_POLL_MS = 60_000;
// The community stream is global, so events can arrive in bursts. Pop at most
// one money numeral per window and sum the amounts landing in between, so the
// gift shows a single "+$<total>" jump instead of a flood of stacked labels.
const POP_THROTTLE_MS = 1500;
// A crossed milestone only celebrates once per browser, so a reload never
// re-pops one the visitor already saw.
const LAST_MILESTONE_STORAGE_KEY = `${APP_KEY_PREFIX}:giveback:last-milestone`;

const readLastCelebratedMilestone = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(LAST_MILESTONE_STORAGE_KEY);
};

interface ContributionActionCompletedPayload {
  contributionActionCompleted: ContributionActionCompleted | null;
}

interface ContributionLastMilestonePayload {
  contributionLastReachedMilestone: ContributionMilestone | null;
}

interface GivebackLiveActivityListenerProps {
  dock: RefObject<GivebackGiftDockHandle>;
}

// Drives the gift dock from remote events instead of a local timer:
// - each approved action (real-time subscription) pops a live "+$" jump
// - crossing a new global milestone (cached poll) fires the celebratory popover
// Mounted once (only the owning gift entry renders it), so the two surfaces
// never double-subscribe or double-pop.
export function GivebackLiveActivityListener({
  dock,
}: GivebackLiveActivityListenerProps): null {
  const { logEvent } = useLogContext();
  const lastCelebratedRef = useRef<string | null>(
    readLastCelebratedMilestone(),
  );

  // Throttle state for the money pops (see POP_THROTTLE_MS).
  const pendingPointsRef = useRef(0);
  const throttleTimerRef = useRef<number | null>(null);
  const flushRef = useRef<() => void>();
  flushRef.current = () => {
    const total = pendingPointsRef.current;
    pendingPointsRef.current = 0;
    if (total <= 0) {
      throttleTimerRef.current = null;
      return;
    }
    dock.current?.pulseActivity(`+$${total.toString()}`);
    throttleTimerRef.current = window.setTimeout(
      () => flushRef.current?.(),
      POP_THROTTLE_MS,
    );
  };

  useEffect(() => {
    return () => {
      if (throttleTimerRef.current !== null) {
        window.clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  const onActionCompleted = useCallback(
    ({ contributionActionCompleted }: ContributionActionCompletedPayload) => {
      const awardedPoints = contributionActionCompleted?.awardedPoints ?? 0;
      if (awardedPoints <= 0) {
        return;
      }
      // Leading edge: pop the first event immediately, then coalesce the rest
      // of the burst into the trailing flush.
      if (throttleTimerRef.current === null) {
        dock.current?.pulseActivity(`+$${awardedPoints.toString()}`);
        throttleTimerRef.current = window.setTimeout(
          () => flushRef.current?.(),
          POP_THROTTLE_MS,
        );
      } else {
        pendingPointsRef.current += awardedPoints;
      }
    },
    [dock],
  );

  useSubscription<ContributionActionCompletedPayload>(
    () => ({ query: CONTRIBUTION_ACTION_COMPLETED_SUBSCRIPTION }),
    { next: onActionCompleted },
  );

  const { data } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionLastMilestone),
    queryFn: () =>
      gqlClient.request<ContributionLastMilestonePayload>(
        CONTRIBUTION_LAST_MILESTONE_QUERY,
      ),
    refetchInterval: MILESTONE_POLL_MS,
    ...disabledRefetch,
  });

  const milestone = data?.contributionLastReachedMilestone;

  useEffect(() => {
    if (!milestone) {
      return;
    }

    // Seed on first sight without popping (the milestone may already be old);
    // only a genuinely new crossing this session celebrates.
    if (!lastCelebratedRef.current) {
      lastCelebratedRef.current = milestone.id;
      window.localStorage.setItem(LAST_MILESTONE_STORAGE_KEY, milestone.id);
      return;
    }

    if (lastCelebratedRef.current === milestone.id) {
      return;
    }

    lastCelebratedRef.current = milestone.id;
    window.localStorage.setItem(LAST_MILESTONE_STORAGE_KEY, milestone.id);
    dock.current?.showPrompt(buildGivebackMilestonePrompt(milestone));
    logEvent({
      event_name: LogEvent.ViewGivebackPrompt,
      extra: JSON.stringify({ milestone: milestone.id }),
    });
  }, [milestone, dock, logEvent]);

  return null;
}

export default GivebackLiveActivityListener;
