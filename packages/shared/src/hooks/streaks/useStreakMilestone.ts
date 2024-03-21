import { useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import AlertContext from '../../contexts/AlertContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useReadingStreak } from './useReadingStreak';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';

export const useStreakMilestone = (): void => {
  const queryClient = useQueryClient();
  const { loadedSettings, optOutWeeklyGoal } = useSettingsContext();
  const { user } = useAuthContext();
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { streak, isEnabled } = useReadingStreak();
  const { trackEvent } = useContext(AnalyticsContext);

  const { openModal } = useLazyModal();
  const trackedImpression = useRef(false);

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

    // since the streaks query is cached and has a staleTime set
    // this is a good time to invalidate that query
    queryClient.invalidateQueries({
      queryKey: generateQueryKey(RequestKey.UserStreak, user),
    });

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

    if (trackedImpression.current) {
      return;
    }

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.StreaksMilestone,
      target_id: streak.current,
    });

    trackedImpression.current = true;
  }, [
    modalType,
    openModal,
    shouldHideModal,
    streak,
    updateAlerts,
    trackEvent,
    queryClient,
    user,
  ]);
};
