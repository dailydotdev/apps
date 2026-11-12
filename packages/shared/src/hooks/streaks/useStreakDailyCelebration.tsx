import React, { useCallback, useContext } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAlertsContext } from '../../contexts/AlertContext';
import SettingsContext from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { useRequestProtocol } from '../useRequestProtocol';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureStreakDailyCelebration } from '../../lib/featureManagement';
import { LogEvent, TargetType } from '../../lib/log';
import {
  hasCelebratedStreakToday,
  isStreakMilestone,
  markStreakCelebrated,
} from '../../lib/streakDailyCelebration';
import { ReadingStreakIcon } from '../../components/icons/ReadingStreak';
import { IconSize } from '../../components/Icon';

export const getStreakDailyCelebrationCopy = (current: number): string =>
  `Day ${current}! See you tomorrow.`;

// Toasts "Day n! See you tomorrow." once per local day, after the first read
// that extended the streak. Milestone days leave the stage to the milestone
// modal, and the companion never shows it: it has no streak in its cache, so
// every read there looks like the first of the day.
export const useStreakDailyCelebration = (): ((current?: number) => void) => {
  const { user } = useAuthContext();
  const { isCompanion } = useRequestProtocol();
  const { alerts } = useAlertsContext();
  const { optOutReadingStreak, loadedSettings } = useContext(SettingsContext);
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { value: isEnabled } = useConditionalFeature({
    feature: featureStreakDailyCelebration,
    shouldEvaluate: !!user && !isCompanion,
  });
  const isStreaksEnabled = loadedSettings && !optOutReadingStreak;
  const showStreakMilestone = alerts?.showStreakMilestone;

  return useCallback(
    (current?: number) => {
      if (
        !isEnabled ||
        isCompanion ||
        !user ||
        !isStreaksEnabled ||
        !current ||
        showStreakMilestone ||
        isStreakMilestone(current) ||
        hasCelebratedStreakToday(user.id, user.timezone)
      ) {
        return;
      }

      markStreakCelebrated(user.id, user.timezone);
      displayToast(
        <span className="flex items-center gap-2">
          <ReadingStreakIcon
            secondary
            size={IconSize.Small}
            className="shrink-0 text-accent-bacon-default motion-safe:animate-streak-toast-pop"
          />
          {getStreakDailyCelebrationCopy(current)}
        </span>,
      );
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.StreakDailyCelebration,
        target_id: current,
      });
    },
    [
      displayToast,
      isCompanion,
      isEnabled,
      isStreaksEnabled,
      logEvent,
      showStreakMilestone,
      user,
    ],
  );
};
