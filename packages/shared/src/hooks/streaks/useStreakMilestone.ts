import { useContext, useEffect } from 'react';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import AlertContext from '../../contexts/AlertContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useReadingStreak } from './useReadingStreak';
import { StreakModalProps } from '../../components/modals/streaks/common';

export const useStreakMilestone = (): void => {
  const { loadedSettings, optOutWeeklyGoal } = useSettingsContext();
  const { streak, isLoading, isEnabled } = useReadingStreak();

  const { loadedAlerts, alerts, updateAlerts } = useContext(AlertContext);
  const { openModal, closeModal } = useLazyModal();

  const modalType =
    streak?.total === 1 ? LazyModal.FirstStreak : LazyModal.NewStreak;

  useEffect(() => {
    if (
      !loadedAlerts ||
      alerts?.showStreakMilestone !== true ||
      isLoading ||
      !isEnabled ||
      !loadedSettings ||
      optOutWeeklyGoal ||
      !streak?.current
    ) {
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
  }, [
    loadedAlerts,
    alerts?.showStreakMilestone,
    isLoading,
    isEnabled,
    loadedSettings,
    optOutWeeklyGoal,
    openModal,
    closeModal,
    modalType,
    streak,
    updateAlerts,
  ]);
};
