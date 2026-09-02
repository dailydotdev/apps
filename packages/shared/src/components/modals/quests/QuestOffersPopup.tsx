import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MODAL_KEY, useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { isTodayStamp } from '../../../lib/dateFormat';
import { LogEvent, TargetType } from '../../../lib/log';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../../hooks/usePersistentContext';
import {
  getDailyQuestSummary,
  useQuestDashboard,
} from '../../../hooks/useQuestDashboard';
import { getQuestLevelProgress } from '../../quest/QuestLevelProgressCircle';
import {
  OfferPlacement,
  userOffersQueryOptions,
} from '../../../graphql/offers';
import { featureQuestOffers } from '../../../lib/featureManagement';

/**
 * Standalone daily quest reward modal trigger.
 *
 * Like `StreakMilestonePopup`, this sits outside BootPopups so it is NOT
 * subject to the one-per-day boot popup queue.
 *
 * It fires on a claim that happens while the app is open, not on the standing
 * fact of having claimed today. A state check read as a bug: the reward
 * arrived on a later visit, detached from the action that earned it. Claiming
 * always routes through `useClaimQuestReward`, which writes the dashboard
 * cache this listener reads, and the listener is mounted for the whole
 * session — so the increase is always observed. The persisted day stamp still
 * caps it at one showing, which is what keeps a three-quest run to one popup.
 */
const QuestOffersTrigger = (): null => {
  const { openModal, modal } = useLazyModal();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { data: dashboard } = useQuestDashboard();
  const { logEvent } = useLogContext();
  const [lastSeen, setLastSeen, isLastSeenFetched] = usePersistentContext<
    string | null
  >(PersistentContextKeys.QuestOffersLastSeen, null);
  const [eligibleLoggedAt, setEligibleLoggedAt, isEligibleLogFetched] =
    usePersistentContext<string | null>(
      PersistentContextKeys.QuestOffersEligibleLogged,
      null,
    );
  const hasOpened = useRef(false);
  const hasLoggedEligible = useRef(false);

  const summary = useMemo(() => getDailyQuestSummary(dashboard), [dashboard]);

  // Whatever was already claimed when the dashboard first loaded is history,
  // not a moment — only a rise above it is a claim the user just made. Null
  // until the first load, so an app entry can never be mistaken for a claim.
  const claimedOnLoad = useRef<number | null>(null);
  const [hasClaimedThisSession, setHasClaimedThisSession] = useState(false);

  useEffect(() => {
    if (!dashboard) {
      return;
    }

    const previous = claimedOnLoad.current;
    // A quest rotation resets the count, so the baseline tracks downwards too
    // rather than leaving a stale high-water mark that swallows the next claim.
    claimedOnLoad.current = summary.claimed;

    if (previous !== null && summary.claimed > previous) {
      setHasClaimedThisSession(true);
    }
  }, [dashboard, summary.claimed]);

  // Both day stamps are independent idb reads. Gating on both means the
  // eligibility effect below can never be short-circuited on an unresolved
  // stamp while this one has already opened the modal and flipped `shouldShow`
  // false for the rest of the day — which would drop the event only for
  // treatment-with-inventory, under-counting the denominator exactly where the
  // numerator lives.
  const shouldShow = ![
    !dashboard,
    !isLastSeenFetched,
    !isEligibleLogFetched,
    isTodayStamp(lastSeen),
    !hasClaimedThisSession,
    !!modal,
  ].some(Boolean);

  // Enrollment only happens when the popup would actually show, so users who
  // never finish their daily quests don't dilute the experiment split.
  const { value: offersEnabled, isLoading: isOffersFeatureLoading } =
    useConditionalFeature({
      feature: featureQuestOffers,
      shouldEvaluate: shouldShow,
    });

  const {
    data: offers,
    isPending: areOffersPending,
    isError: didOffersFail,
  } = useQuery({
    ...userOffersQueryOptions({
      user,
      placement: OfferPlacement.QuestCompletion,
    }),
    enabled: shouldShow && !isOffersFeatureLoading && offersEnabled,
  });

  // The experiment's denominator. Control renders nothing, and so does a
  // treatment that found no inventory — without this both arms are invisible
  // in analytics and a dud experiment can't be told apart from missing Encore
  // stock. Its own day stamp keeps it to one event per user per day in every
  // arm, so the arms stay comparable by event count and not just by user.
  useEffect(() => {
    if (
      hasLoggedEligible.current ||
      !shouldShow ||
      isOffersFeatureLoading ||
      !isEligibleLogFetched ||
      isTodayStamp(eligibleLoggedAt)
    ) {
      return;
    }

    // Control never enables the query, and a disabled query stays pending
    // forever, so only the treatment arm has a fetch to wait on.
    if (offersEnabled && areOffersPending) {
      return;
    }

    hasLoggedEligible.current = true;
    setEligibleLoggedAt(new Date().toISOString());

    logEvent({
      event_name: LogEvent.QuestOffersEligible,
      target_type: TargetType.QuestOffer,
      target_id: summary.claimed.toString(),
      extra: JSON.stringify({
        enabled: offersEnabled,
        offers: offers?.length ?? 0,
        // `retry: false` means a 5xx or a dropped connection settles the query
        // with no offers, which is otherwise indistinguishable from healthy
        // but empty inventory — the third state worth telling apart.
        failed: didOffersFail,
      }),
    });
  }, [
    areOffersPending,
    didOffersFail,
    eligibleLoggedAt,
    isEligibleLogFetched,
    isOffersFeatureLoading,
    logEvent,
    offers,
    offersEnabled,
    setEligibleLoggedAt,
    shouldShow,
    summary.claimed,
  ]);

  useEffect(() => {
    if (hasOpened.current || !shouldShow || isOffersFeatureLoading) {
      return;
    }

    // Control has no popup of its own to fall back to, and treatment with no
    // inventory shows nothing — neither stamps the day, so a later visit can
    // still catch offers once they exist.
    if (!offersEnabled || areOffersPending || !offers?.length || !dashboard) {
      return;
    }

    // `modal` is a react-query snapshot from render, and MainLayout mounts
    // three independent writers to this key (BootPopups, StreakMilestonePopup,
    // this) whose effects all run in the same commit. Read the live value so
    // we don't overwrite a sibling's popup that landed microseconds earlier.
    if (queryClient.getQueryData(MODAL_KEY)) {
      return;
    }

    hasOpened.current = true;

    openModal({
      type: LazyModal.QuestOffers,
      props: {
        level: dashboard.level.level,
        levelProgress: getQuestLevelProgress(dashboard.level),
        summary,
        offers,
        // The day is stamped by the modal on mount, not here: a write that
        // loses a same-commit race is dropped silently, and stamping up front
        // would burn the day for offers that were never shown, never logged an
        // impression, and never confirmed back to Encore.
        onShown: () => setLastSeen(new Date().toISOString()),
      },
    });
  }, [
    areOffersPending,
    dashboard,
    isOffersFeatureLoading,
    offers,
    offersEnabled,
    openModal,
    queryClient,
    setLastSeen,
    shouldShow,
    summary,
  ]);

  return null;
};

/**
 * Gating mirrors `QuestUpdatesListener`: the trigger only mounts for logged-in
 * users who haven't opted out of the quest system, so the dashboard query and
 * the experiment enrollment never fire for anyone else.
 */
export const QuestOffersPopup = (): ReactElement | null => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { loadedSettings, optOutQuestSystem } = useSettingsContext();

  if (!isAuthReady || !loadedSettings || !isLoggedIn || optOutQuestSystem) {
    return null;
  }

  return <QuestOffersTrigger />;
};
