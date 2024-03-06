import { useContext, useEffect } from 'react';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import AlertContext from '../../contexts/AlertContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useReadingStreak } from './useReadingStreak';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';

export const useStreakMilestone = (): void => {
  const { loadedSettings, optOutWeeklyGoal } = useSettingsContext();
  const { streak, isEnabled } = useReadingStreak();
  const { trackEvent } = useContext(AnalyticsContext);

  const { alerts, updateAlerts } = useContext(AlertContext);
  const { openModal } = useLazyModal();

  const modalType: LazyModal.FirstStreak | LazyModal.NewStreak =
    streak?.total === 1 ? LazyModal.FirstStreak : LazyModal.NewStreak;

  // hide modal if settings are not loaded
  let shouldHideModal = !loadedSettings;

  // hide modal if feature is not enabled or user opted out
  shouldHideModal = shouldHideModal || !isEnabled || optOutWeeklyGoal;

  // hide modal if user already closed it
  shouldHideModal = shouldHideModal || alerts?.showStreakMilestone !== true;

  // hide modal if there's no streak
  shouldHideModal = shouldHideModal || !streak?.current;

  useEffect(() => {
    if (shouldHideModal) {
      return;
    }

    openModal({
      type: modalType,
      props: {
        currentStreak: streak?.current,
        maxStreak: streak?.max,
        onAfterClose: () => {
          updateAlerts({ showStreakMilestone: false });
        },
      },
    });

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.StreaksMilestone,
      target_id: streak.current,
    });
  }, [modalType, openModal, shouldHideModal, streak, updateAlerts, trackEvent]);
};
