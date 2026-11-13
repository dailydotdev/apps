import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ModalSize } from '../common/types';
import type { LazyModalCommonProps, ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ReadingStreakIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useLogContext } from '../../../contexts/LogContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useActions } from '../../../hooks/useActions';
import { ActionType } from '../../../graphql/actions';
import type { StreakGoal } from '../../../graphql/settings';
import { STREAK_GOAL_OPTIONS } from '../../../graphql/settings';
import { LogEvent, TargetType } from '../../../lib/log';
import { StreakGoalPromptReason } from '../../../lib/streakGoal';

export interface StreakGoalModalProps
  extends LazyModalCommonProps, Pick<ModalProps, 'onAfterOpen'> {
  reason: StreakGoalPromptReason;
  preselectedGoal?: StreakGoal | null;
}

const headingByReason: Record<StreakGoalPromptReason, string> = {
  [StreakGoalPromptReason.DayTwo]: 'Two days in. Set a goal?',
  [StreakGoalPromptReason.Break]: 'Start fresh with a goal',
  [StreakGoalPromptReason.NextGoal]: 'Ready for your next goal?',
};

export const STREAK_GOAL_MODAL_DESCRIPTION =
  'Pick how many days in a row you want to read. We will track your progress and celebrate when you get there.';

export const StreakGoalModal = ({
  isOpen,
  onRequestClose,
  onAfterClose,
  onAfterOpen,
  reason,
  preselectedGoal,
}: StreakGoalModalProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { updateStreakGoal } = useSettingsContext();
  const { completeAction } = useActions();
  const [selectedGoal, setSelectedGoal] = useState<StreakGoal | null>(
    preselectedGoal ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.StreakGoal,
      target_id: reason,
    });
    // Log once per open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Closing without a pick, by the secondary button or the close button, is a
  // skip. Only the day-2 offer is remembered on the account; the break offer
  // is keyed on the reset when it is queued (see BootPopups).
  const onSkip = () => {
    logEvent({
      event_name: LogEvent.SkipStreakGoal,
      target_type: TargetType.StreakGoal,
      target_id: reason,
    });

    if (reason === StreakGoalPromptReason.DayTwo) {
      completeAction(ActionType.StreakGoalSkipped);
    }

    onRequestClose();
  };

  const onCommit = async () => {
    if (!selectedGoal) {
      return;
    }

    setIsSaving(true);
    logEvent({
      event_name: LogEvent.SetStreakGoal,
      target_type: TargetType.StreakGoal,
      target_id: reason,
      extra: JSON.stringify({ goal: selectedGoal }),
    });

    try {
      await updateStreakGoal(selectedGoal);
    } finally {
      setIsSaving(false);
    }

    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onAfterClose={onAfterClose}
      onAfterOpen={onAfterOpen}
      onRequestClose={onSkip}
      size={ModalSize.Small}
    >
      <Modal.Header title="Streak goal" showCloseButton />
      <Modal.Body className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <ReadingStreakIcon
            secondary
            size={IconSize.XLarge}
            className="text-accent-bacon-default"
          />
          <Typography tag={TypographyTag.H3} type={TypographyType.Title3} bold>
            {headingByReason[reason]}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {STREAK_GOAL_MODAL_DESCRIPTION}
          </Typography>
        </div>
        <div className="flex flex-col gap-2" role="radiogroup">
          {STREAK_GOAL_OPTIONS.map((goal) => {
            const isSelected = selectedGoal === goal;

            return (
              <Button
                key={goal}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={classNames(
                  'w-full',
                  isSelected && 'border-accent-bacon-default',
                )}
                variant={ButtonVariant.Float}
                size={ButtonSize.Large}
                onClick={() => setSelectedGoal(goal)}
                data-testid={`streak-goal-option-${goal}`}
              >
                {goal} days
              </Button>
            );
          })}
        </div>
      </Modal.Body>
      <Modal.Footer className="!h-auto flex-col gap-2">
        <Button
          className="w-full"
          variant={ButtonVariant.Primary}
          disabled={!selectedGoal}
          loading={isSaving}
          onClick={onCommit}
        >
          Commit to my goal
        </Button>
        <Button
          className="w-full"
          variant={ButtonVariant.Tertiary}
          onClick={onSkip}
        >
          No goal for now
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StreakGoalModal;
