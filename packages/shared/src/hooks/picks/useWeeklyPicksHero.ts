import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Picks, PicksWeekSignals } from '../../graphql/picks';
import {
  myCurrentPicksQueryOptions,
  picksViewCountQueryOptions,
  picksWeekSignalsQueryOptions,
} from '../../graphql/picks';
import {
  getCurrentWeekStart,
  isPicksNudgeDay,
  PICKS_HERO_MIN_SIGNALS,
} from '../../lib/picks';
import { featureWeeklyPicks } from '../../lib/featureManagement';
import { LogEvent, Origin } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useFeature } from '../../components/GrowthBookProvider';
import useLogEventOnce from '../log/useLogEventOnce';
import usePersistentContext, {
  PersistentContextKeys,
} from '../usePersistentContext';

/**
 * nudge: the week's reading is worth turning into picks, none published yet.
 * live: this week's picks are published; show how far they went.
 */
export type WeeklyPicksHeroState = 'nudge' | 'live';

interface UseWeeklyPicksHeroProps {
  /** Off on every page but the home feed, where the card is mounted. */
  enabled?: boolean;
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
  picks: Picks | null;
  viewCount: number | null;
  onCta: () => void;
  onDismiss: () => Promise<void>;
}

const countSignals = (signals: PicksWeekSignals): number =>
  signals.upvotes + signals.bookmarks + signals.reads;

/**
 * The home feed's weekly picks card. Members in the rollout see it from
 * Thursday while their week's reading clears the bar and no picks are out,
 * and all week once this week's picks are published. Closing it hides it
 * until the next week.
 */
export const useWeeklyPicksHero = ({
  enabled = true,
}: UseWeeklyPicksHeroProps = {}): UseWeeklyPicksHero => {
  const { user, isLoggedIn, isAuthReadyOrCached } = useAuthContext();
  const { logEvent } = useLogContext();
  const isEnabled = useFeature(featureWeeklyPicks);
  const weekStart = getCurrentWeekStart();
  const [dismissedWeek, setDismissedWeek, isDismissFetched] =
    usePersistentContext<string>(
      PersistentContextKeys.WeeklyPicksHeroDismissedWeek,
      '',
    );
  const isDismissed = dismissedWeek === weekStart;
  const canEvaluate =
    enabled && isLoggedIn && !!isEnabled && isDismissFetched && !isDismissed;

  // Best effort, no retries: the feed is waiting on these, and a failed
  // request just means no card this visit.
  const { data: picks, isFetched: isPicksFetched } = useQuery({
    ...myCurrentPicksQueryOptions(user),
    enabled: canEvaluate,
    retry: false,
  });
  const isNudgeDay = isPicksNudgeDay();
  // Alongside the picks rather than after them, so the verdict takes one
  // round trip, not two.
  const { data: signals, isFetched: isSignalsFetched } = useQuery({
    ...picksWeekSignalsQueryOptions(user),
    enabled: canEvaluate && isNudgeDay && !picks,
    retry: false,
  });
  const { data: viewCount } = useQuery({
    ...picksViewCountQueryOptions(picks?.id ?? '', user),
    enabled: canEvaluate && !!picks,
  });

  let state: WeeklyPicksHeroState | null = null;
  if (picks) {
    state = 'live';
  } else if (
    isNudgeDay &&
    signals &&
    countSignals(signals) >= PICKS_HERO_MIN_SIGNALS
  ) {
    state = 'nudge';
  }
  const shouldShow = canEvaluate && !!state;
  const isSettled =
    !enabled ||
    !isEnabled ||
    isDismissed ||
    (isAuthReadyOrCached && !isLoggedIn) ||
    (isPicksFetched && (!!picks || !isNudgeDay || isSignalsFetched));

  const extra = JSON.stringify({
    week: weekStart,
    state,
    ...(signals ?? {}),
    picks_id: picks?.id,
    view_count: viewCount,
  });

  useLogEventOnce(
    () => ({
      event_name: LogEvent.ImpressionPicksHero,
      origin: Origin.HomePage,
      extra,
    }),
    { condition: shouldShow },
  );

  const onCta = useCallback(() => {
    logEvent({
      event_name: LogEvent.ClickPicksHero,
      origin: Origin.HomePage,
      extra,
    });
  }, [logEvent, extra]);

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
    signals: signals ?? null,
    picks: picks ?? null,
    viewCount: typeof viewCount === 'number' ? viewCount : null,
    onCta,
    onDismiss,
  };
};
