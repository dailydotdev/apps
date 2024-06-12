import { useContext, useEffect, useState } from 'react';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions, useBoot } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { LazyModal } from './common/types';
import AlertContext from '../../contexts/AlertContext';
import { MarketingCtaVariant } from '../cards/MarketingCta/common';
import { LogEvent, TargetType } from '../../lib/log';
import LogContext from '../../contexts/LogContext';
import { promotion } from './generic';
import { useReadingStreak } from '../../hooks/streaks';

const REP_TRESHOLD = 250;

/**
 * Component that renders popups that should be shown on boot.
 * Set rule is that we only show one popup per day, and they come in first come, first served manner.
 * These popups are removed when the users interact with page (clicks outside, closes, completes action).
 * @constructor
 */
export const BootPopups = (): null => {
  const { logEvent } = useContext(LogContext);
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const { alerts, loadedAlerts, updateAlerts, updateLastBootPopup } =
    useContext(AlertContext);
  const [bootPopups, setBootPopups] = useState(() => new Map());
  const { getMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Popover);
  const {
    streak,
    shouldShowPopup: shouldShowStreaksPopup,
    isStreaksEnabled,
  } = useReadingStreak();

  // hide modal if feature is not enabled
  let shouldHideStreaksModal = !isStreaksEnabled;
  // hide modal if actions are not fetched
  shouldHideStreaksModal = shouldHideStreaksModal || !isActionsFetched;
  // hide modal if user already opted out of the milestone
  shouldHideStreaksModal =
    shouldHideStreaksModal ||
    checkHasCompleted(ActionType.DisableReadingStreakMilestone);
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
        props: {
          onAfterClose: () => {
            updateLastBootPopup();
          },
        },
      });
    }
  }, [
    checkHasCompleted,
    isActionsFetched,
    user?.reputation,
    updateLastBootPopup,
  ]);

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
            logEvent({
              event_name: LogEvent.Impression,
              target_type: TargetType.MarketingCtaPopover,
              target_id: marketingCta.campaignId,
            });
          },
          onAfterClose: () => {
            updateLastBootPopup();
          },
        },
      });
    }
  }, [marketingCta, logEvent, updateLastBootPopup]);

  /** *
   * Boot popup for generic referral campaign
   */
  useEffect(() => {
    if (alerts?.showGenericReferral !== true) {
      return;
    }

    addBootPopup({
      type: LazyModal.GenericReferral,
      props: {
        onAfterOpen: () => {
          updateLastBootPopup();
        },
      },
    });
  }, [alerts?.showGenericReferral, updateLastBootPopup]);

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
          updateLastBootPopup();
          completeAction(ActionType.ExistingUserSeenStreaks);
        },
      },
    });
  }, [
    completeAction,
    isActionsFetched,
    shouldShowStreaksPopup,
    updateLastBootPopup,
  ]);

  /**
   * Boot popup for streaks milestone
   */
  useEffect(() => {
    if (shouldHideStreaksModal) {
      return;
    }

    addBootPopup({
      type: LazyModal.NewStreak,
      props: {
        currentStreak: streak?.current,
        maxStreak: streak?.max,
        onAfterClose: () => {
          updateLastBootPopup();
          updateAlerts({ showStreakMilestone: false });
        },
      },
    });
  }, [shouldHideStreaksModal, streak, updateAlerts, updateLastBootPopup]);

  /**
   * Actual rendering of the boot popup that's first in line
   */
  useEffect(() => {
    if (!loadedAlerts || !alerts?.bootPopup || bootPopups.size === 0) {
      return;
    }
    openModal(bootPopups.values().next().value);
    setBootPopups(new Map());
  }, [alerts?.bootPopup, bootPopups, loadedAlerts, openModal]);

  return null;
};
