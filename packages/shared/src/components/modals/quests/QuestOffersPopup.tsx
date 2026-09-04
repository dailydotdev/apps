import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MODAL_KEY, useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { isTodayStamp } from '../../../lib/dateFormat';
import { LogEvent, TargetType } from '../../../lib/log';
import { QuestType } from '../../../graphql/quests';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../../hooks/usePersistentContext';
import {
  getDailyQuestSummary,
  useQuestDashboard,
} from '../../../hooks/useQuestDashboard';
import type { QuestClaim } from '../../../hooks/useClaimQuestReward';
import { questClaimQueryKey } from '../../../hooks/useClaimQuestReward';
import { getQuestLevelProgress } from '../../quest/QuestLevelProgressCircle';
import {
  OfferPlacement,
  userOffersQueryOptions,
} from '../../../graphql/offers';
import { featureQuestOffers } from '../../../lib/featureManagement';

const CLAIM_WINDOW_MS = 30_000;

/**
 * Standalone daily quest reward modal trigger.
 *
 * Like `StreakMilestonePopup`, this sits outside BootPopups so it is NOT
 * subject to the one-per-day boot popup queue.
 *
 * It reacts to the claim itself, which `useClaimQuestReward` publishes to the
 * query cache — that being the one mutation every claim surface goes through.
 * Eligibility used to be the standing fact of having claimed today, which
 * stayed true on a later visit and delivered the reward detached from the
 * action that earned it. The persisted day stamp still caps it at one
 * showing, which is what holds a three-quest run to a single popup.
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

  // The last claim, published by `useClaimQuestReward` — the one mutation
  // every claim surface goes through. Read the way `useLazyModal` reads the
  // open modal: the query never fetches, it just observes the cache.
  const claimKey = useMemo(() => questClaimQueryKey(user), [user]);
  const { data: claim } = useQuery<QuestClaim | null>({
    queryKey: claimKey,
    queryFn: () => queryClient.getQueryData<QuestClaim>(claimKey) ?? null,
    enabled: false,
  });

  // Any real claim is a reward moment — daily, weekly and milestone all
  // qualify. Intro quests do not: they are the onboarding flow, they have
  // their own celebration in IntroQuestModal, and since that is a LazyModal
  // this trigger would defer behind it and land a sponsored offer as
  // someone's first-run experience.
  const pendingClaim =
    claim && claim.questType !== QuestType.Intro ? claim : null;

  // A claim is a one-shot, not a flag. One never acted on has to expire, or it
  // stops being a moment and becomes a standing fact again: a tab left open
  // past midnight would find the day stamp cleared and open on no action, and
  // an offers query that later refetched into inventory would open at an
  // arbitrary point with no claim behind it. Keyed on the claim itself, so a
  // second claim refreshes the window rather than riding the first one's.
  useEffect(() => {
    if (!claim) {
      return undefined;
    }

    // Clear an ignored claim rather than leaving it parked, so the cache entry
    // always means "the pending moment" and not merely "the last claim".
    if (!pendingClaim) {
      queryClient.setQueryData(claimKey, null);

      return undefined;
    }

    const timer = window.setTimeout(
      () => queryClient.setQueryData(claimKey, null),
      CLAIM_WINDOW_MS,
    );

    return () => window.clearTimeout(timer);
  }, [claim, claimKey, pendingClaim, queryClient]);

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
    !pendingClaim,
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
        // Daily, weekly and milestone all open this, so the denominator needs
        // to be segmentable by what was actually claimed.
        questType: pendingClaim?.questType ?? null,
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
    pendingClaim,
  ]);

  useEffect(() => {
    if (hasOpened.current || !shouldShow || isOffersFeatureLoading) {
      return;
    }

    // Still waiting on the fetch, so the claim is not spent yet.
    if (offersEnabled && areOffersPending) {
      return;
    }

    // `modal` is a react-query snapshot from render, and MainLayout mounts
    // three independent writers to this key (BootPopups, StreakMilestonePopup,
    // this) whose effects all run in the same commit. Read the live value so
    // we don't overwrite a sibling's popup that landed microseconds earlier.
    // The claim stays unspent so this can still land when that popup closes,
    // bounded by CLAIM_WINDOW_MS rather than waiting indefinitely.
    if (queryClient.getQueryData(MODAL_KEY)) {
      return;
    }

    // Decision time. Spend the claim whichever way this goes: control has no
    // popup of its own, and a treatment that came back empty must not be
    // revived by a later refetch landing inventory long after the claim.
    // Neither stamps the day, so a genuine later claim can still show.
    queryClient.setQueryData(claimKey, null);

    if (!offersEnabled || !offers?.length || !dashboard) {
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
    claimKey,
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
