import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  Picks,
  PicksWeekPost,
  PicksWeekSignals,
} from '../../graphql/picks';
import {
  myCurrentPicksQueryOptions,
  picksViewCountQueryOptions,
  picksWeekSignalsQueryOptions,
} from '../../graphql/picks';
import {
  getCurrentWeekStart,
  isPicksNudgeDay,
  PICKS_HERO_MIN_SIGNALS,
  PICKS_HERO_WAIT_MS,
} from '../../lib/picks';
import {
  featureWeeklyPicks,
  featureWeeklyPicksChecks,
} from '../../lib/featureManagement';
import { LogEvent, Origin } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useConditionalFeature } from '../useConditionalFeature';
import useLogEventOnce from '../log/useLogEventOnce';
import { useReadingReminderHeroSettled } from '../notifications/useReadingReminderHero';
import usePersistentContext, {
  PersistentContextKeys,
} from '../usePersistentContext';
import { useWeeklyPicksEnrolled } from './useWeeklyPicksEntry';

/**
 * nudge: the week's reading is worth turning into picks, none published yet.
 * live: this week's picks are published; show how far they went.
 */
export type WeeklyPicksHeroState = 'nudge' | 'live';

/** What the card's primary action was, in the click event. */
export type WeeklyPicksHeroAction = 'pick' | 'share' | 'copy';

/** How many of the week's posts the card shows as thumbnails. */
export const PICKS_HERO_THUMBNAILS = 3;

interface UseWeeklyPicksHeroProps {
  /** Off on every page but the home feed, where the card is mounted. */
  enabled?: boolean;
  /** The feed's budget for the verdict; past it, no card this visit. */
  waitMs?: number;
}

export interface UseWeeklyPicksHero {
  shouldShow: boolean;
  /**
   * The verdict is in, one way or the other. The layout holds the feed's
   * paint until then, so the card never lands on top of posts already drawn.
   */
  isSettled: boolean;
  state: WeeklyPicksHeroState | null;
  signals: PicksWeekSignals | null;
  /** Posts from the reader's week to show on the nudge, up to three. */
  weekPosts: PicksWeekPost[];
  picks: Picks | null;
  viewCount: number | null;
  /**
   * Logs the click. Picking also closes the card for the week: the editor
   * takes over from here, and coming back to the same prompt is nagging.
   */
  onCta: (action: WeeklyPicksHeroAction) => void;
  onDismiss: () => Promise<void>;
}

/**
 * The verdict from the reader's last visit and what the card needs to paint
 * it, so the next visit shows it straight from the device.
 */
export interface WeeklyPicksHeroSnapshot {
  userId: string;
  week: string;
  state: WeeklyPicksHeroState;
  signals: PicksWeekSignals | null;
  picks: Picks | null;
  viewCount: number | null;
}

export const countSignals = (signals: PicksWeekSignals): number =>
  signals.upvotes + signals.bookmarks + signals.reads;

/**
 * The home feed's weekly picks card. Members in the rollout see it from
 * Thursday while their week's reading clears the bar and no picks are out,
 * and all week once this week's picks are published. Closing it hides it
 * until the next week.
 *
 * The verdict is worked out in the background and saved on the device; the
 * card paints from the saved one on the reader's next visit. The feed never
 * waits on the network for it, and the flag is evaluated, enrolling the
 * reader, only when the nudge is about to paint. The live card follows that
 * enrollment, like the other entry points: a reader who published from a
 * shared picks page is outside the nudge and does not enter the experiment
 * from here.
 */
export const useWeeklyPicksHero = ({
  enabled = true,
  waitMs = PICKS_HERO_WAIT_MS,
}: UseWeeklyPicksHeroProps = {}): UseWeeklyPicksHero => {
  const { user, isLoggedIn, isAuthReadyOrCached } = useAuthContext();
  const { logEvent } = useLogContext();
  const weekStart = getCurrentWeekStart();
  const isNudgeDay = isPicksNudgeDay();
  const [dismissedWeek, setDismissedWeek, isDismissFetched] =
    usePersistentContext<string>(
      PersistentContextKeys.WeeklyPicksHeroDismissedWeek,
      '',
    );
  const [snapshot, setSnapshot, isSnapshotFetched] =
    usePersistentContext<WeeklyPicksHeroSnapshot | null>(
      PersistentContextKeys.WeeklyPicksHeroSnapshot,
      null,
    );
  const [isEnrolled, enroll, isEnrolledFetched] = useWeeklyPicksEnrolled();
  const isDismissed = dismissedWeek === weekStart;
  // A plain rollout flag, not the experiment: the switch for the checks.
  const { value: isChecksEnabled, isLoading: isChecksLoading } =
    useConditionalFeature({
      feature: featureWeeklyPicksChecks,
      shouldEvaluate: enabled && isLoggedIn,
    });
  const canEvaluate =
    enabled &&
    isLoggedIn &&
    isDismissFetched &&
    !isDismissed &&
    !!isChecksEnabled;

  // Best effort, no retries, and nothing waits on these: they only refresh
  // the saved verdict for the next visit. A picks query that fails is not
  // "no picks": the reader may well have published, so no nudge either.
  const {
    data: picks,
    isFetched: isPicksFetched,
    isError: isPicksError,
  } = useQuery({
    ...myCurrentPicksQueryOptions(user),
    enabled: canEvaluate,
    retry: false,
  });
  const isNudgeCandidate = canEvaluate && isNudgeDay && !picks && !isPicksError;
  const { data: signals, isFetched: isSignalsFetched } = useQuery({
    ...picksWeekSignalsQueryOptions(user),
    enabled: isNudgeCandidate,
    retry: false,
  });
  const { data: viewCount, isFetched: isViewCountFetched } = useQuery({
    ...picksViewCountQueryOptions(picks?.id ?? '', user),
    enabled: canEvaluate && !!picks,
    retry: false,
  });

  let freshState: WeeklyPicksHeroState | null = null;
  if (picks) {
    freshState = 'live';
  } else if (
    isNudgeDay &&
    !!signals &&
    countSignals(signals) >= PICKS_HERO_MIN_SIGNALS
  ) {
    freshState = 'nudge';
  }
  const isFreshDecided =
    isPicksFetched &&
    !isPicksError &&
    (picks ? isViewCountFetched : !isNudgeDay || isSignalsFetched);

  const hasSnapshot = !!snapshot;
  useEffect(() => {
    if (!isFreshDecided || !user) {
      return;
    }
    if (!freshState) {
      if (hasSnapshot) {
        setSnapshot(null);
      }
      return;
    }
    setSnapshot({
      userId: user.id,
      week: weekStart,
      state: freshState,
      signals: signals ?? null,
      picks: picks ?? null,
      viewCount: typeof viewCount === 'number' ? viewCount : null,
    });
    // Saved once per verdict; the snapshot itself is not an input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFreshDecided, freshState, user?.id, weekStart]);

  // The card is decided once per home visit from the saved verdict, and
  // kept, so answers arriving later never move what is already on screen.
  // Fresh data already in the cache still wins: no nudge once picks are out.
  const [savedState, setSavedState] = useState<
    WeeklyPicksHeroState | null | undefined
  >(undefined);
  const [isOutOfTime, setIsOutOfTime] = useState(false);
  const canDecide =
    enabled &&
    ((isAuthReadyOrCached && !isLoggedIn) ||
      (isLoggedIn &&
        isDismissFetched &&
        isSnapshotFetched &&
        isEnrolledFetched &&
        !isChecksLoading));
  useEffect(() => {
    if (savedState !== undefined || !canDecide) {
      return;
    }
    const saved =
      canEvaluate &&
      snapshot?.userId === user?.id &&
      snapshot?.week === weekStart
        ? snapshot.state
        : null;
    const isReachable =
      (saved === 'nudge' && isNudgeDay && !picks) ||
      (saved === 'live' && picks !== null && isEnrolled);
    setSavedState(isReachable ? saved : null);
    // Decided once, from what is in hand when the device read lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canDecide, savedState]);

  // The layout stays mounted across the main feeds, so the decision is let
  // go on leaving the home feed and made again on the next return, when the
  // feed paints fresh anyway. A reader who landed on another feed first, or
  // whose verdict was saved this session, gets the card without a reload.
  useEffect(() => {
    if (!enabled) {
      setSavedState(undefined);
      setIsOutOfTime(false);
    }
  }, [enabled]);

  // The reading reminder shares the strip and splits it in two when both
  // show, so this card lands only once that one has decided too.
  const isStripSettled = useReadingReminderHeroSettled();

  const isEligible =
    canEvaluate && !isOutOfTime && !!savedState && isStripSettled;
  const { value: isEnabled, isLoading: isFlagLoading } = useConditionalFeature({
    feature: featureWeeklyPicks,
    shouldEvaluate: isEligible,
  });
  const isDecided =
    savedState !== undefined &&
    (!savedState || (isStripSettled && !isFlagLoading));

  // Holding the feed now waits on the device and the strip only, but still
  // not forever.
  const isWaiting = enabled && isLoggedIn && !isDecided && !isOutOfTime;
  useEffect(() => {
    if (!isWaiting) {
      return undefined;
    }
    const timer = setTimeout(() => setIsOutOfTime(true), waitMs);
    return () => clearTimeout(timer);
  }, [isWaiting, waitMs]);

  // The other entry points evaluate the flag only for readers the card has
  // enrolled, so they never widen the experiment.
  const hasEvaluatedFlag = isEligible && !isFlagLoading;
  useEffect(() => {
    if (hasEvaluatedFlag && !isEnrolled) {
      enroll();
    }
  }, [hasEvaluatedFlag, isEnrolled, enroll]);

  const shouldShow = isEligible && !isFlagLoading && !!isEnabled;
  const isSettled =
    !enabled ||
    isDismissed ||
    (isAuthReadyOrCached && !isLoggedIn) ||
    isOutOfTime ||
    isDecided;

  // Fresh numbers replace the saved ones in place once they arrive.
  const saved = savedState ? snapshot : null;
  const state = savedState ?? null;
  const shownSignals = signals ?? saved?.signals ?? null;
  const shownPicks = picks ?? saved?.picks ?? null;
  const shownViewCount =
    typeof viewCount === 'number' ? viewCount : (saved?.viewCount ?? null);

  const extra = JSON.stringify({
    week: weekStart,
    state,
    upvotes: shownSignals?.upvotes,
    bookmarks: shownSignals?.bookmarks,
    reads: shownSignals?.reads,
    picks_id: shownPicks?.id,
    view_count: shownViewCount,
  });

  useLogEventOnce(
    () => ({
      event_name: LogEvent.ImpressionPicksHero,
      origin: Origin.HomePage,
      extra,
    }),
    { condition: shouldShow },
  );

  const onCta = useCallback(
    (action: WeeklyPicksHeroAction) => {
      logEvent({
        event_name: LogEvent.ClickPicksHero,
        origin: Origin.HomePage,
        extra: JSON.stringify({ ...JSON.parse(extra), action }),
      });
      if (action === 'pick') {
        setDismissedWeek(weekStart);
      }
    },
    [logEvent, extra, setDismissedWeek, weekStart],
  );

  const onDismiss = useCallback(async () => {
    logEvent({
      event_name: LogEvent.DismissPicksHero,
      origin: Origin.HomePage,
      extra,
    });
    await setDismissedWeek(weekStart);
  }, [logEvent, extra, setDismissedWeek, weekStart]);

  return {
    shouldShow,
    isSettled,
    state,
    signals: shownSignals,
    weekPosts: shownSignals?.posts.slice(0, PICKS_HERO_THUMBNAILS) ?? [],
    picks: shownPicks,
    viewCount: shownViewCount,
    onCta,
    onDismiss,
  };
};
