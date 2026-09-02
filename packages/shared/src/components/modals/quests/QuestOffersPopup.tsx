import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import { isToday } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
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

const hasSeenToday = (lastSeen: string | null): boolean => {
  if (!lastSeen) {
    return false;
  }

  const parsed = new Date(lastSeen);

  return !Number.isNaN(parsed.getTime()) && isToday(parsed);
};

/**
 * Standalone daily quest reward modal trigger.
 *
 * Like `StreakMilestonePopup`, this sits outside BootPopups so it is NOT
 * subject to the one-per-day boot popup queue. It rides the day's first
 * claimed daily quest: waiting for the whole set is a moment too rare to be
 * worth measuring, and Plus users would have had to clear their unlocked Plus
 * quests too. Eligibility is a plain state check rather than a transition
 * watch, so the moment survives a reload — someone who claimed hours ago
 * still gets it on their next visit — and the persisted day stamp keeps it to
 * one showing.
 */
const QuestOffersTrigger = (): null => {
  const { openModal, modal } = useLazyModal();
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

  const shouldShow = ![
    !dashboard,
    !isLastSeenFetched,
    hasSeenToday(lastSeen),
    !summary.claimed,
    !!modal,
  ].some(Boolean);

  // Enrollment only happens when the popup would actually show, so users who
  // never finish their daily quests don't dilute the experiment split.
  const { value: offersEnabled, isLoading: isOffersFeatureLoading } =
    useConditionalFeature({
      feature: featureQuestOffers,
      shouldEvaluate: shouldShow,
    });

  const { data: offers, isPending: areOffersPending } = useQuery({
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
      hasSeenToday(eligibleLoggedAt)
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
      }),
    });
  }, [
    areOffersPending,
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

    hasOpened.current = true;
    setLastSeen(new Date().toISOString());

    openModal({
      type: LazyModal.QuestOffers,
      props: {
        level: dashboard.level.level,
        levelProgress: getQuestLevelProgress(dashboard.level),
        summary,
        offers,
      },
    });
  }, [
    areOffersPending,
    dashboard,
    isOffersFeatureLoading,
    offers,
    offersEnabled,
    openModal,
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
