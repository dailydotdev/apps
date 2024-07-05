import React, { useContext, useEffect, useState } from 'react';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions, useBoot } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { LazyModal } from './common/types';
import AlertContext from '../../contexts/AlertContext';
import { MarketingCtaVariant } from '../marketingCta/common';
import { LogEvent, TargetType } from '../../lib/log';
import LogContext from '../../contexts/LogContext';
import { promotion } from './generic';
import { useReadingStreak } from '../../hooks/streaks';
import InteractivePopup, {
  InteractivePopupPosition,
  InteractivePopupProps,
} from '../tooltips/InteractivePopup';
import { MarketingCtaPopoverSmall } from '../marketingCta/MarketingCtaPopoverSmall';
import { ButtonVariant } from '../buttons/common';
import { isNullOrUndefined } from '../../lib/func';

const REP_TRESHOLD = 250;

/**
 * Component that renders popups that should be shown on boot.
 * Set rule is that we only show one popup per day, and they come in first come, first served manner.
 * These popups are removed when the users interact with page (clicks outside, closes, completes action).
 * @constructor
 */
export const BootPopups = (): JSX.Element => {
  const { logEvent } = useContext(LogContext);
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const { alerts, loadedAlerts, updateAlerts, updateLastBootPopup } =
    useContext(AlertContext);
  const [bootPopups, setBootPopups] = useState(() => new Map());
  const [interactiveBootPopup, setInteractiveBootPopup] =
    useState<InteractivePopupProps | null>(null);
  const { getMarketingCta } = useBoot();
  const marketingCtaPopover = getMarketingCta(MarketingCtaVariant.Popover);
  const marketingCtaPopoverSmall = getMarketingCta(
    MarketingCtaVariant.PopoverSmall,
  );
  const {
    streak,
    shouldShowPopup: shouldShowStreaksPopup,
    isStreaksEnabled,
  } = useReadingStreak();

  const isDisabledMilestone = checkHasCompleted(
    ActionType.DisableReadingStreakMilestone,
  );
  const hideEvaluations = [
    !isStreaksEnabled,
    !isActionsFetched,
    isNullOrUndefined(isDisabledMilestone),
    isDisabledMilestone,
    alerts?.showStreakMilestone !== true,
    !streak?.current,
  ];

  const shouldHideStreaksModal = hideEvaluations.some(Boolean);

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
    if (marketingCtaPopover) {
      addBootPopup({
        type: LazyModal.MarketingCta,
        props: {
          marketingCta: marketingCtaPopover,
          onAfterOpen: () => {
            logEvent({
              event_name: LogEvent.Impression,
              target_type: TargetType.MarketingCtaPopover,
              target_id: marketingCtaPopover.campaignId,
            });
          },
          onAfterClose: () => {
            updateLastBootPopup();
          },
        },
      });
    }
  }, [marketingCtaPopover, logEvent, updateLastBootPopup]);

  useEffect(() => {
    if (marketingCtaPopoverSmall) {
      setInteractiveBootPopup({
        isDrawerOnMobile: true,
        drawerProps: {
          className: { wrapper: '!p-0' },
        },
        position: InteractivePopupPosition.RightEnd,
        disableOverlay: true,
        closeButton: {
          variant: ButtonVariant.Primary,
        },
        children: (
          <MarketingCtaPopoverSmall marketingCta={marketingCtaPopoverSmall} />
        ),
      });
    } else {
      setInteractiveBootPopup(null);
    }
  }, [marketingCtaPopoverSmall]);

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

  return !interactiveBootPopup ? null : (
    <InteractivePopup {...interactiveBootPopup} />
  );
};
