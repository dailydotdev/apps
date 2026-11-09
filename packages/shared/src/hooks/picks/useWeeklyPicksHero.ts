import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Picks, PicksPost, PicksWeekSignals } from '../../graphql/picks';
import {
  myCurrentPicksQueryOptions,
  picksSuggestionsQueryOptions,
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
import { useReadingReminderHeroSettled } from '../notifications/useReadingReminderHero';
import usePersistentContext, {
  PersistentContextKeys,
} from '../usePersistentContext';

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
  suggestions: PicksPost[];
  picks: Picks | null;
  viewCount: number | null;
  /**
   * Logs the click. Picking also closes the card for the week: the editor
   * takes over from here, and coming back to the same prompt is nagging.
   */
  onCta: (action: WeeklyPicksHeroAction) => void;
  onDismiss: () => Promise<void>;
}

export const countSignals = (signals: PicksWeekSignals): number =>
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
  const isNudgeCandidate = canEvaluate && isNudgeDay && !picks;
  const { data: signals, isFetched: isSignalsFetched } = useQuery({
    ...picksWeekSignalsQueryOptions(user),
    enabled: isNudgeCandidate,
    retry: false,
  });
  const isNudge = !!signals && countSignals(signals) >= PICKS_HERO_MIN_SIGNALS;
  // The reader's own posts, for the nudge's thumbnails. Decoration, so the
  // card does not wait for them.
  const { data: suggestions } = useQuery({
    ...picksSuggestionsQueryOptions(user),
    enabled: isNudgeCandidate && isNudge,
    retry: false,
  });
  // The live card is about the count, so it waits for it rather than
  // painting a number in late.
  const { data: viewCount, isFetched: isViewCountFetched } = useQuery({
    ...picksViewCountQueryOptions(picks?.id ?? '', user),
    enabled: canEvaluate && !!picks,
    retry: false,
  });

  // The reading reminder shares the strip and splits it in two when both
  // show, so this card lands only once that one has decided too.
  const isStripSettled = useReadingReminderHeroSettled();

  let state: WeeklyPicksHeroState | null = null;
  if (picks) {
    state = isViewCountFetched ? 'live' : null;
  } else if (isNudgeDay && isNudge) {
    state = 'nudge';
  }
  const shouldShow = canEvaluate && !!state && isStripSettled;
  const isSettled =
    !enabled ||
    !isEnabled ||
    isDismissed ||
    (isAuthReadyOrCached && !isLoggedIn) ||
    (isPicksFetched &&
      (picks ? isViewCountFetched : !isNudgeDay || isSignalsFetched) &&
      (!state || isStripSettled));

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
    signals: signals ?? null,
    suggestions: (suggestions ?? [])
      .filter((entry) => entry.upvoted || entry.bookmarked || entry.read)
      .slice(0, PICKS_HERO_THUMBNAILS)
      .map((entry) => entry.post),
    picks: picks ?? null,
    viewCount: typeof viewCount === 'number' ? viewCount : null,
    onCta,
    onDismiss,
  };
};
