import { useContext, useEffect, useState } from 'react';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions, useBoot } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { LazyModal } from './common/types';
import AlertContext from '../../contexts/AlertContext';
import { MarketingCtaVariant } from '../cards/MarketingCta/common';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { promotion } from './generic';
import { useReadingStreak, useStreakExperiment } from '../../hooks/streaks';
import { useSettingsContext } from '../../contexts/SettingsContext';

const REP_TRESHOLD = 250;

/**
 * Component that renders popups that should be shown on boot.
 * Set rule is that we only show one popup per day, and they come in first come, first served manner.
 * These popups are removed when the users interact with page (clicks outside, closes, completes action).
 * @constructor
 */
export const useBootPopups = (): void => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const [shownModal, setShownModal] = useState(false);
  const { alerts, loadedAlerts, updateAlerts } = useContext(AlertContext);
  const [bootPopups, setBootPopups] = useState(new Map());
  const { getMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Popover);
  const { shouldShowPopup: shouldShowStreaksPopup } = useStreakExperiment();
  const { streak, isEnabled } = useReadingStreak();
  const { loadedSettings, optOutWeeklyGoal } = useSettingsContext();

  // hide modal if settings are not loaded
  let shouldHideStreaksModal = !loadedSettings;
  // hide modal if feature is not enabled or user opted out
  shouldHideStreaksModal =
    shouldHideStreaksModal || !isEnabled || optOutWeeklyGoal;
  // hide modal if user already closed it
  shouldHideStreaksModal =
    shouldHideStreaksModal || alerts?.showStreakMilestone !== true;
  // hide modal if there's no streak
  shouldHideStreaksModal = shouldHideStreaksModal || !streak?.current;

  const addBootPopup = (popup) => {
    setBootPopups((prev) => new Map([...prev, [popup.type, popup]]));
  };

  /**
   * Boot popup for reputation privileges.
   */
  useEffect(() => {
    if (!isActionsFetched) {
      return;
    }

    if (checkHasCompleted(ActionType.AckRep250)) {
      return;
    }

    if (user?.reputation >= REP_TRESHOLD) {
      addBootPopup({
        type: LazyModal.ReputationPrivileges,
        persistOnRouteChange: true,
      });
    }
  }, [checkHasCompleted, isActionsFetched, openModal, user?.reputation]);

  /**
   * Boot popup based on marketing CTA
   */
  useEffect(() => {
    if (marketingCta) {
      addBootPopup({
        type: LazyModal.MarketingCta,
        props: {
          marketingCta,
          onAfterOpen: () => {
            trackEvent({
              event_name: AnalyticsEvent.Impression,
              target_type: TargetType.MarketingCtaPopover,
              target_id: marketingCta.campaignId,
            });
          },
        },
      });
    }
  }, [marketingCta, openModal, trackEvent]);

  /** *
   * Boot popup for generic referral campaign
   */
  useEffect(() => {
    if (alerts?.showGenericReferral !== true) {
      return;
    }

    addBootPopup({
      type: LazyModal.GenericReferral,
    });
  }, [alerts?.showGenericReferral]);

  /**
   * Boot popup for migrate streaks
   */
  useEffect(() => {
    if (!shouldShowStreaksPopup || !isActionsFetched) {
      return;
    }

    addBootPopup({
      type: LazyModal.MarketingCta,
      props: {
        marketingCta: promotion.migrateStreaks,
        onAfterOpen: () => {
          completeAction(ActionType.ExistingUserSeenStreaks);
        },
      },
    });
  }, [openModal, shouldShowStreaksPopup, isActionsFetched, completeAction]);

  /**
   * Boot popup for streaks milestone
   */
  useEffect(() => {
    if (shouldHideStreaksModal) {
      return;
    }

    openModal({
      type: LazyModal.NewStreak,
      props: {
        currentStreak: streak?.current,
        maxStreak: streak?.max,
        onAfterClose: () => {
          updateAlerts({ showStreakMilestone: false });
        },
      },
    });
  }, [
    openModal,
    shouldHideStreaksModal,
    streak,
    updateAlerts,
    trackEvent,
    user,
  ]);

  /**
   * Actual rendering of the boot popup that's first in line
   */
  useEffect(() => {
    if (
      !loadedAlerts ||
      !alerts?.bootPopup ||
      bootPopups.size === 0 ||
      shownModal
    ) {
      return;
    }
    openModal(bootPopups.values().next().value);
    updateAlerts({
      lastBootPopup: new Date(),
    });
    setShownModal(true);
  }, [
    loadedAlerts,
    bootPopups,
    openModal,
    shownModal,
    updateAlerts,
    alerts?.bootPopup,
  ]);

  return null;
};
