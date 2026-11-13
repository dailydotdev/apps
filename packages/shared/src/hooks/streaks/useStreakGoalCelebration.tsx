import React, { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { useRequestProtocol } from '../useRequestProtocol';
import { useLazyModal } from '../useLazyModal';
import { useStreakGoal } from './useStreakGoal';
import { LazyModal } from '../../components/modals/common/types';
import { LogEvent, TargetType } from '../../lib/log';
import {
  getNextStreakGoal,
  getStreakGoalReachedCopy,
  hasCelebratedStreakGoalToday,
  markStreakGoalCelebrated,
  StreakGoalPromptReason,
} from '../../lib/streakGoal';
import { ReadingStreakIcon } from '../../components/icons/ReadingStreak';
import { IconSize } from '../../components/Icon';

export const STREAK_GOAL_NEXT_COPY = 'Set your next goal';
export const STREAK_GOAL_KEEP_GOING_COPY = 'Keep going';

// Toasts "Goal reached: n days!" on the read that lands the streak on the
// goal. Returns whether it celebrated, so the daily toast can stand down.
export const useStreakGoalCelebration = (): ((current?: number) => boolean) => {
  const { user } = useAuthContext();
  const { isCompanion } = useRequestProtocol();
  const { displayToast, dismissToast } = useToastNotification();
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
  const { goal } = useStreakGoal();

  return useCallback(
    (current?: number) => {
      if (
        isCompanion ||
        !user ||
        !goal ||
        current !== goal ||
        hasCelebratedStreakGoalToday(user.id, goal, user.timezone)
      ) {
        return false;
      }

      markStreakGoalCelebrated(user.id, goal, user.timezone);
      const nextGoal = getNextStreakGoal(goal);
      displayToast(
        <span className="flex items-center gap-2">
          <ReadingStreakIcon
            secondary
            size={IconSize.Small}
            className="shrink-0 text-accent-bacon-default motion-safe:animate-streak-toast-pop"
          />
          {getStreakGoalReachedCopy(goal)}
        </span>,
        {
          action: {
            copy: nextGoal
              ? STREAK_GOAL_NEXT_COPY
              : STREAK_GOAL_KEEP_GOING_COPY,
            onClick: () => {
              dismissToast();

              if (!nextGoal) {
                return;
              }

              openModal({
                type: LazyModal.StreakGoal,
                props: {
                  reason: StreakGoalPromptReason.NextGoal,
                  preselectedGoal: nextGoal,
                },
              });
            },
          },
        },
      );
      logEvent({
        event_name: LogEvent.HitStreakGoal,
        target_type: TargetType.StreakGoal,
        target_id: goal,
        extra: JSON.stringify({ goal }),
      });

      return true;
    },
    [dismissToast, displayToast, goal, isCompanion, logEvent, openModal, user],
  );
};
