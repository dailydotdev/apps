import type { ReactElement } from 'react';
import { useContext, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { LazyModal } from '../common/types';
import AlertContext from '../../../contexts/AlertContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useReadingStreak } from '../../../hooks/streaks';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import {
  OfferPlacement,
  userOffersQueryOptions,
} from '../../../graphql/offers';
import { featureStreakMilestoneOffers } from '../../../lib/featureManagement';
import { isNullOrUndefined } from '../../../lib/func';

/**
 * Standalone streak milestone modal trigger.
 *
 * Separated from BootPopups so it is NOT subject to the one-per-day
 * boot popup queue. The modal opens as soon as all conditions are met
 * (alerts loaded, streak data loaded, user eligible).
 */
export const StreakMilestonePopup = (): ReactElement | null => {
  const { openModal, modal } = useLazyModal();
  const { checkHasCompleted, isActionsFetched } = useActions();
  const { alerts, loadedAlerts, updateAlerts } = useContext(AlertContext);
  const { streak, isStreaksEnabled } = useReadingStreak();
  const { user } = useAuthContext();
  const hasOpened = useRef(false);

  const isDisabledMilestone = checkHasCompleted(
    ActionType.DisableReadingStreakMilestone,
  );

  const shouldShow = ![
    !loadedAlerts,
    !isStreaksEnabled,
    !isActionsFetched,
    isNullOrUndefined(isDisabledMilestone),
    isDisabledMilestone,
    alerts?.showStreakMilestone !== true,
    !streak?.current,
    !!modal,
  ].some(Boolean);

  // Enrollment only happens when the popup would actually show, so users who
  // never hit a milestone don't dilute the experiment split.
  const { value: offersEnabled, isLoading: isOffersFeatureLoading } =
    useConditionalFeature({
      feature: featureStreakMilestoneOffers,
      shouldEvaluate: shouldShow,
    });

  const { data: offers, isPending: areOffersPending } = useQuery({
    ...userOffersQueryOptions({
      user,
      placement: OfferPlacement.StreakMilestone,
    }),
    enabled: shouldShow && !isOffersFeatureLoading && offersEnabled,
  });

  useEffect(() => {
    if (hasOpened.current || !shouldShow || isOffersFeatureLoading) {
      return;
    }

    // Treatment waits for the offers fetch to settle; an error resolves it
    // (offers stays undefined) and falls back to the classic popup.
    if (offersEnabled && areOffersPending) {
      return;
    }

    if (!streak?.current) {
      return;
    }

    hasOpened.current = true;

    const onAfterClose = () => {
      updateAlerts?.({ showStreakMilestone: false });
    };

    if (offersEnabled && offers?.length) {
      openModal({
        type: LazyModal.StreakOffers,
        props: {
          currentStreak: streak.current,
          maxStreak: streak.max,
          offers,
          onAfterClose,
        },
      });
      return;
    }

    openModal({
      type: LazyModal.NewStreak,
      props: {
        currentStreak: streak.current,
        maxStreak: streak.max,
        onAfterClose,
      },
    });
  }, [
    areOffersPending,
    isOffersFeatureLoading,
    offers,
    offersEnabled,
    openModal,
    shouldShow,
    streak,
    updateAlerts,
  ]);

  return null;
};
