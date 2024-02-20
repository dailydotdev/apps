import { useContext, useEffect } from 'react';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import AlertContext from '../../contexts/AlertContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useReadingStreak } from './useReadingStreak';
import { StreakModalProps } from '../../components/modals/streaks/common';

export const useStreakMilestone = (): void => {
  const { loadedSettings, optOutWeeklyGoal } = useSettingsContext();
  const { streak, isEnabled } = useReadingStreak();

  const { alerts, updateAlerts } = useContext(AlertContext);
  const { openModal, closeModal } = useLazyModal();

  const modalType: LazyModal.FirstStreak | LazyModal.NewStreak =
    streak?.total === 1 ? LazyModal.FirstStreak : LazyModal.NewStreak;

  // hide modal if settings are not loaded
  let shouldHideModal = !loadedSettings;

  // hide modal if feature is not enabled or user opted out
  shouldHideModal ||= !isEnabled || optOutWeeklyGoal;

  // hide modal if user already closed it
  shouldHideModal ||= alerts?.showStreakMilestone !== true;

  // hide modal if there's no streak
  shouldHideModal ||= !streak?.current;

  useEffect(() => {
    if (shouldHideModal) {
      return;
    }

    openModal({
      type: modalType,
      props: {
        currentStreak: streak?.current,
        onRequestClose: () => {
          updateAlerts({ showStreakMilestone: false });
          closeModal();
        },
      } as StreakModalProps,
    });
  }, [closeModal, modalType, openModal, shouldHideModal, streak, updateAlerts]);
};
