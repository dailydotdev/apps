import type { ReactElement } from 'react';
import { useContext, useEffect } from 'react';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { LazyModal } from '../common/types';
import AlertContext from '../../../contexts/AlertContext';
import { useReadingStreak } from '../../../hooks/streaks';
import { isNullOrUndefined } from '../../../lib/func';

/**
 * Standalone streak milestone modal trigger.
 *
 * Separated from BootPopups so it is NOT subject to the one-per-day
 * boot popup queue. The modal opens as soon as all conditions are met
 * (alerts loaded, streak data loaded, user eligible).
 */
export const StreakMilestonePopup = (): ReactElement => {
  const { openModal, modal } = useLazyModal();
  const { checkHasCompleted, isActionsFetched } = useActions();
  const { alerts, loadedAlerts, updateAlerts } = useContext(AlertContext);
  const { streak, isStreaksEnabled } = useReadingStreak();

  const isDisabledMilestone = checkHasCompleted(
    ActionType.DisableReadingStreakMilestone,
  );

  useEffect(() => {
    const shouldHide = [
      !loadedAlerts,
      !isStreaksEnabled,
      !isActionsFetched,
      isNullOrUndefined(isDisabledMilestone),
      isDisabledMilestone,
      alerts?.showStreakMilestone !== true,
      !streak?.current,
      !!modal,
    ].some(Boolean);

    if (shouldHide) {
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
    alerts?.showStreakMilestone,
    isActionsFetched,
    isDisabledMilestone,
    isStreaksEnabled,
    loadedAlerts,
    modal,
    openModal,
    streak,
    updateAlerts,
  ]);

  return null;
};
