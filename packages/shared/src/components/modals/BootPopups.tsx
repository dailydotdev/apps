import type { ReactElement } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions, useBoot } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { LazyModal } from './common/types';
import AlertContext from '../../contexts/AlertContext';
import { MarketingCtaVariant } from '../marketingCta/common';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useReadingStreak } from '../../hooks/streaks';
import type { InteractivePopupProps } from '../tooltips/InteractivePopup';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { MarketingCtaPopoverSmall } from '../marketingCta/MarketingCtaPopoverSmall';
import { ButtonVariant } from '../buttons/common';
import { isNullOrUndefined } from '../../lib/func';
import useProfileForm from '../../hooks/useProfileForm';

const REP_TRESHOLD = 250;

/**
 * Boot popup system — centralized modal queue shown on page load.
 *
 * ## How it works
 *
 * There are two types of boot popups:
 *
 * ### Queued popups (default)
 * - Added via `addBootPopup({ type, props })`
 * - Subject to a **one-per-day** limit controlled by `alerts.bootPopup`
 * - First-come-first-served: only the first popup in the queue is shown
 * - Must call `updateLastBootPopup()` in `onAfterClose` to record the daily slot as used
 *
 * ### Immediate popups
 * - Added via `addImmediatePopup({ type, props })`
 * - **Bypass** the one-per-day limit — shown as soon as alerts are loaded
 * - Useful for time-sensitive or high-priority events (e.g. achievement unlocks)
 * - Do NOT call `updateLastBootPopup()` — they don't consume the daily slot
 * - Still respect opt-out checks and other guards in their useEffect
 *
 * ## Adding a new boot popup
 *
 * 1. Add a `useEffect` in this component that checks the relevant conditions
 * 2. Call `addBootPopup(...)` for queued or `addImmediatePopup(...)` for immediate
 * 3. For queued popups: call `updateLastBootPopup()` in `onAfterClose`
 * 4. For immediate popups: clear the server-side flag (e.g. `updateAlerts(...)`) in `onAfterClose`
 *
 * @constructor
 */
export const BootPopups = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { checkHasCompleted, isActionsFetched } = useActions();
  const { openModal } = useLazyModal();
  const { user, isValidRegion } = useAuthContext();
  const { updateUserProfile } = useProfileForm();
  const {
    alerts,
    loadedAlerts,
    updateAlerts,
    updateLastBootPopup,
    updateHasSeenOpportunity,
  } = useContext(AlertContext);
  const [bootPopups, setBootPopups] = useState(() => new Map());
  const [immediatePopups, setImmediatePopups] = useState(() => new Map());
  const [interactiveBootPopup, setInteractiveBootPopup] =
    useState<InteractivePopupProps | null>(null);
  const { getMarketingCta } = useBoot();
  const marketingCtaPopover = getMarketingCta(MarketingCtaVariant.Popover);
  const marketingCtaPopoverSmall = getMarketingCta(
    MarketingCtaVariant.PopoverSmall,
  );
  const marketingCtaPlus = getMarketingCta(MarketingCtaVariant.Plus);

  const { streak, isStreaksEnabled } = useReadingStreak();

  const isDisabledMilestone = checkHasCompleted(
    ActionType.DisableReadingStreakMilestone,
  );

  const shouldHideStreaksModal = [
    !isStreaksEnabled,
    !isActionsFetched,
    isNullOrUndefined(isDisabledMilestone),
    isDisabledMilestone,
    alerts?.showStreakMilestone !== true,
    !streak?.current,
  ].some(Boolean);
  const addBootPopup = (popup) => {
    setBootPopups((prev) => new Map([...prev, [popup.type, popup]]));
  };

  const addImmediatePopup = (popup) => {
    setImmediatePopups((prev) => new Map([...prev, [popup.type, popup]]));
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
    if (marketingCtaPlus && isValidRegion && !user?.isPlus) {
      addBootPopup({
        type: LazyModal.PlusMarketing,
        props: {
          onAfterOpen: () => {
            logEvent({
              event_name: LogEvent.Impression,
              target_type: TargetType.MarketingCtaPlus,
              target_id: marketingCtaPlus.campaignId,
            });
          },
          onAfterClose: () => {
            updateLastBootPopup();
          },
        },
      });
    }
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
  }, [
    marketingCtaPopover,
    logEvent,
    updateLastBootPopup,
    marketingCtaPlus,
    isValidRegion,
    user?.isPlus,
  ]);

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
        isDrawerOnMobile: true,
      },
    });
  }, [alerts?.showGenericReferral, updateLastBootPopup]);

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
   * Streak recovery modal
   */
  useEffect(() => {
    const shouldNotShowStreakUpdates =
      !isStreaksEnabled || !isActionsFetched || isDisabledMilestone;
    const hasMarkedAction = checkHasCompleted(
      ActionType.DisableReadingStreakRecover,
    );

    if (
      shouldNotShowStreakUpdates ||
      !alerts.showRecoverStreak ||
      !user ||
      hasMarkedAction
    ) {
      return;
    }
    addBootPopup({
      type: LazyModal.RecoverStreak,
      props: {
        user,
      },
    });
  }, [
    alerts,
    checkHasCompleted,
    isActionsFetched,
    isDisabledMilestone,
    isStreaksEnabled,
    shouldHideStreaksModal,
    streak,
    updateAlerts,
    updateLastBootPopup,
    user,
  ]);

  /**
   * Received gift plus modal
   */
  useEffect(() => {
    if (!user?.flags?.showPlusGift || !user.isPlus) {
      return;
    }

    addBootPopup({
      type: LazyModal.GiftPlusReceived,
      props: {
        user,
        onAfterClose: () => {
          updateUserProfile({
            flags: { showPlusGift: false },
          });
        },
      },
    });
  }, [updateUserProfile, user]);

  /**
   * Top reader badge modal
   */
  useEffect(() => {
    if (!alerts?.showTopReader) {
      return;
    }

    addBootPopup({
      type: LazyModal.TopReaderBadge,
      props: {
        origin: Origin.Boot,
        onAfterClose: () => {
          updateAlerts({ showTopReader: false });
          updateLastBootPopup();
        },
      },
    });
  }, [alerts.showTopReader, logEvent, updateAlerts, updateLastBootPopup]);

  /**
   * Immediate popup for achievement unlock celebration.
   * Bypasses the one-per-day queue so users see their unlock right away.
   */
  useEffect(() => {
    if (!alerts?.showAchievementUnlock || !isActionsFetched) {
      return;
    }

    const isOptedOut = checkHasCompleted(
      ActionType.DisableAchievementCompletion,
    );

    if (isNullOrUndefined(isOptedOut) || isOptedOut) {
      return;
    }

    addImmediatePopup({
      type: LazyModal.AchievementCompletion,
      props: {
        achievementId: alerts.showAchievementUnlock,
        onAfterClose: () => {
          updateAlerts({ showAchievementUnlock: null });
        },
      },
    });
  }, [
    alerts?.showAchievementUnlock,
    checkHasCompleted,
    isActionsFetched,
    updateAlerts,
  ]);

  /**
   * Job opportunity modal
   */
  useEffect(() => {
    if (!alerts?.opportunityId || alerts?.flags?.hasSeenOpportunity) {
      return;
    }

    addBootPopup({
      type: LazyModal.JobOpportunity,
      props: {
        opportunityId: alerts.opportunityId,
        onAfterClose: () => {
          updateHasSeenOpportunity();
          updateLastBootPopup();
        },
      },
    });
  }, [
    alerts.opportunityId,
    alerts?.flags?.hasSeenOpportunity,
    updateHasSeenOpportunity,
    updateLastBootPopup,
  ]);

  /**
   * Immediate popups — shown as soon as alerts are loaded, bypassing the daily limit.
   */
  useEffect(() => {
    if (!loadedAlerts || immediatePopups.size === 0) {
      return;
    }
    openModal(immediatePopups.values().next().value);
    setImmediatePopups(new Map());
  }, [immediatePopups, loadedAlerts, openModal]);

  /**
   * Queued popups — subject to the one-per-day gate (`alerts.bootPopup`).
   * Only the first popup in the queue is shown.
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
